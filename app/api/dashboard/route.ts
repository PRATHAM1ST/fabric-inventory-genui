import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources.mjs";
import { JSONSchema } from "openai/lib/jsonschema.mjs";
import { transformStream } from "@crayonai/stream";
import { getMessageStore } from "./messageStore";
import { mcpClient } from "./mcp";

interface RequestBody {
  prompt: ChatCompletionMessageParam & { id: string };
  threadId: string;
  responseId: string;
}

async function ensureMCPConnection(): Promise<void> {
  if (mcpClient.tools.length === 0) {
    await mcpClient.connect();
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prompt, threadId, responseId } = (await req.json()) as RequestBody;

  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed",
    apiKey: process.env.THESYS_API_KEY,
  });

  const messageStore = getMessageStore(threadId);
  messageStore.addMessage(prompt);

  // Ensure MCP connection is established
  try {
    await ensureMCPConnection();
  } catch (error) {
    console.error("[Dashboard] Failed to connect to MCP server:", error);
    // Continue without tools if MCP connection fails
  }

  const messages = messageStore.getOpenAICompatibleMessageList();

  // If we have MCP tools available, use runTools for automatic tool execution
  if (mcpClient.tools.length > 0) {
    const llmStream = await client.beta.chat.completions.runTools({
      model: "c1/anthropic/claude-sonnet-4/v-20250617",
      messages,
      tools: mcpClient.tools.map((tool) => ({
        type: "function" as const,
        function: {
          name: tool.function.name,
          description: tool.function.description || "",
          parameters: tool.function.parameters as unknown as JSONSchema,
          parse: JSON.parse,
          function: async (args: unknown) => {
            const results = await mcpClient.runTool({
              tool_call_id: tool.function.name + Date.now().toString(),
              name: tool.function.name,
              args: args as Record<string, unknown>,
            });
            return results.content;
          },
        },
      })),
      stream: true,
    });

    const responseStream = transformStream(
      llmStream,
      (chunk) => {
        return chunk.choices[0]?.delta?.content;
      },
      {
        onEnd: ({ accumulated }) => {
          const message = accumulated.filter((chunk) => chunk).join("");
          messageStore.addMessage({
            id: responseId,
            role: "assistant",
            content: message,
          });
        },
      }
    ) as ReadableStream<string>;

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // Fallback: If no MCP tools, use regular chat completion
  const llmStream = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250617",
    messages,
    stream: true,
  });

  const responseStream = transformStream(
    llmStream,
    (chunk) => {
      return chunk.choices[0]?.delta?.content;
    },
    {
      onEnd: ({ accumulated }) => {
        const message = accumulated.filter((chunk) => chunk).join("");
        messageStore.addMessage({
          id: responseId,
          role: "assistant",
          content: message,
        });
      },
    }
  ) as ReadableStream<string>;

  return new NextResponse(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

