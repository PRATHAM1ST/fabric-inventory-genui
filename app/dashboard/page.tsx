"use client";

import * as React from "react";
import { C1Chat } from "@thesysai/genui-sdk";
import { themePresets } from "@crayonai/react-ui";

export default function DashboardPage() {
  return (
    <C1Chat
      apiUrl="/api/dashboard"
      agentName="Fabric Inventory Dashboard"
      theme={themePresets.default}
    />
  );
}

