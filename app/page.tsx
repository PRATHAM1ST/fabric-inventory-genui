"use client";

import * as React from "react";
import { C1Chat } from "@thesysai/genui-sdk";
import { themePresets } from "@crayonai/react-ui";

export default function Home() {
  return (
    <C1Chat
      apiUrl="/api/chat"
      agentName="Fabric Inventory Assistant"
      theme={themePresets.candy}
    />
  );
}

