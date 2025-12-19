import OpenAI from "openai";
import { systemPrompt } from "./systemPrompt";

export type DBMessage = OpenAI.Chat.ChatCompletionMessageParam & {
  id?: string;
};

const messagesStore: {
  [threadId: string]: DBMessage[];
} = {};

export const getMessageStore = (threadId: string) => {
  if (!messagesStore[threadId]) {
    messagesStore[threadId] = [{ role: "system", content: systemPrompt }];
  }
  const messageList = messagesStore[threadId];
  return {
    addMessage: (message: DBMessage) => {
      messageList.push(message);
    },
    messageList,
    getOpenAICompatibleMessageList: () => {
      return messageList.map((m) => {
        const message = { ...m };
        delete message.id;
        return message;
      });
    },
  };
};

