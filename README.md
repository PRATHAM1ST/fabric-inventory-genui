# Fabric Inventory GenUI

AI-powered fabric inventory management system built with [C1 by Thesys](https://thesys.dev) and Next.js 15.

[![Built with Thesys](https://thesys.dev/built-with-thesys-badge.svg)](https://thesys.dev)

## Features

- 🤖 AI-powered inventory assistant
- 💬 Conversational UI with C1Chat component
- 🎨 Beautiful theming with pre-built presets
- ⚡ Real-time streaming responses
- 📊 Dynamic UI generation for inventory data

## Getting Started

### 1. Get your API Key

Generate a new API key from [Thesys Console](https://chat.thesys.dev/console/keys).

### 2. Set Environment Variables

Create a `.env.local` file in the root directory:

```bash
THESYS_API_KEY=your_api_key_here
```

Or export it directly:

```bash
export THESYS_API_KEY=<your-api-key>
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
├── api/
│   └── chat/
│       ├── route.ts          # API endpoint for chat
│       ├── messageStore.ts   # In-memory message storage
│       └── systemPrompt.ts   # AI system instructions
├── globals.css               # Global styles + Tailwind + C1 styles
├── layout.tsx                # Root layout
└── page.tsx                  # Main chat page with C1Chat
```

## Customization

### System Prompt

Edit `app/api/chat/systemPrompt.ts` to customize the AI assistant's behavior and capabilities.

### Theme

Change the theme preset in `app/page.tsx`:

```tsx
import { themePresets } from "@crayonai/react-ui";

// Available presets: candy, ocean, forest, sunset, etc.
<C1Chat theme={themePresets.candy} />
```

### Agent Name

Update the `agentName` prop in `app/page.tsx`:

```tsx
<C1Chat agentName="Your Custom Agent Name" />
```

## Learn More

- [C1 Documentation](https://docs.thesys.dev) - Learn about Thesys C1
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthesysdev%2Ftemplate-c1-next&env=THESYS_API_KEY&envDescription=Thesys%20Generative%20UI%20API%20key%20can%20be%20found%20in%20the%20Thesys%20console&envLink=https%3A%2F%2Fchat.thesys.dev%2Fconsole%2Fkeys>)
