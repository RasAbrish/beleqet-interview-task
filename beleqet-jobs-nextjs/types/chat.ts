export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
