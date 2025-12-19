import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import OpenAI from "openai";

const MCP_SERVER_URL = "https://traider-production.up.railway.app/mcp";

// Read-only tools whitelist - only these tools will be exposed to the AI
const READ_ONLY_TOOLS = new Set([
  "search_fabrics",
  "get_variant",
  "search_variants",
  "get_stock",
  "get_stock_batch",
]);

export class MCPClient {
  private mcp: Client;
  private transport: StreamableHTTPClientTransport | null = null;
  public tools: OpenAI.ChatCompletionTool[] = [];
  private isConnected = false;

  constructor() {
    this.mcp = new Client({
      name: "fabric-inventory-dashboard-client",
      version: "1.0.0",
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Connect to the fabric inventory MCP server via Streamable HTTP
      this.transport = new StreamableHTTPClientTransport(
        new URL(MCP_SERVER_URL)
      );

      await this.mcp.connect(this.transport);
      this.isConnected = true;

      // List available tools from the MCP server
      const toolsResult = await this.mcp.listTools();
      
      // Filter to only read-only tools and map to OpenAI-compatible schema
      this.tools = toolsResult.tools
        .filter((tool) => READ_ONLY_TOOLS.has(tool.name))
        .map((tool) => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description || "",
            parameters: tool.inputSchema,
          },
        }));

      console.log(
        `[MCP] Connected to fabric inventory server. Read-only tools enabled:`,
        this.tools.map((t) => t.function.name)
      );
    } catch (error) {
      console.error("[MCP] Failed to connect:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async runTool({
    tool_call_id,
    name,
    args,
  }: {
    tool_call_id: string;
    name: string;
    args: Record<string, unknown>;
  }): Promise<{
    tool_call_id: string;
    role: "tool";
    content: string;
  }> {
    // Security check: only allow read-only tools
    if (!READ_ONLY_TOOLS.has(name)) {
      console.warn(`[MCP] Blocked write operation attempt: ${name}`);
      return {
        tool_call_id,
        role: "tool" as const,
        content: JSON.stringify({
          error: `Operation "${name}" is not allowed. This dashboard only supports read operations.`,
        }),
      };
    }

    try {
      console.log(`[MCP] Executing read-only tool: ${name}`, args);
      
      const result = await this.mcp.callTool({
        name,
        arguments: args,
      });

      const content = JSON.stringify(result.content);
      console.log(`[MCP] Tool ${name} result:`, content);

      return {
        tool_call_id,
        role: "tool" as const,
        content,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[MCP] Tool ${name} failed:`, errorMessage);
      
      return {
        tool_call_id,
        role: "tool" as const,
        content: JSON.stringify({
          error: `Tool call failed: ${errorMessage}`,
        }),
      };
    }
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.isConnected = false;
      this.tools = [];
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance for the MCP client
export const mcpClient = new MCPClient();

