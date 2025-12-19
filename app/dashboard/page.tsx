"use client";

import * as React from "react";
import { C1Chat } from "@thesysai/genui-sdk";
import { themePresets } from "@crayonai/react-ui";

export default function DashboardPage() {
  return (
    <C1Chat
      apiUrl="/api/dashboard"
      agentName="Fabric Inventory Dashboard"
      theme={themePresets.emerald}
      welcomeMessage="Welcome to the Fabric Inventory Dashboard! I can help you explore your fabric inventory data including properties like GSM, dimensions, material composition, and stock levels. Try asking me questions like 'Show all fabrics' or 'What cotton fabrics do we have?'"
    />
  );
}

