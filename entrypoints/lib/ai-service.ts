import { InferenceClient } from "@huggingface/inference";

export class AI {
  private client: InferenceClient;
  private stream: boolean;

  constructor() {
    this.client = new InferenceClient(import.meta.env.WXT_HF_TOKEN);
    this.stream = false;
  }
  static getInstance() {
    return new AI();
  }
  setStream(stream: boolean) {
    this.stream = stream;
  }

  private chatInterface(text: string, summaryType: string) {
    if (this.stream) {
      return this.client.chatCompletionStream({
        provider: "hf-inference",
        model: "HuggingFaceTB/SmolLM3-3B",
        messages: [
          {
            role: "user",
            content: AI.getInstance().buildPrompt(text, summaryType),
          },
        ],
        temperature: 0.6,
        chat_template_kwargs: { enable_thinking: false },
      });
    } else {
      return this.client.chatCompletion({
        provider: "hf-inference",
        model: "HuggingFaceTB/SmolLM3-3B",
        messages: [
          {
            role: "user",
            content: AI.getInstance().buildPrompt(text, summaryType),
          },
        ],
        temperature: 0.6,
        chat_template_kwargs: { enable_thinking: false },
      });
    }
  }

  static async summarize(
    text: string,
    summaryType: string,
    onChunk?: (chunk: string) => void
  ) {
    let output = "";
    const isStreaming = AI.getInstance().getStream();
    console.log("Streaming enabled:", isStreaming);

    const response = await AI.getInstance().chatInterface(text, summaryType);

    if (isStreaming) {
      console.log("Processing streaming response...");
      for await (const chunk of response as any) {
        console.log("Received chunk:", chunk);
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent =
            chunk.choices[0].delta?.content ||
            chunk.choices[0].message?.content;
          if (newContent) {
            output += newContent;
            // Call the callback with the new chunk for real-time updates
            if (onChunk) {
              onChunk(output);
            }
            console.log("streaming output", output);
          }
        }
      }
      return AI.getInstance().parseMarkdown(output, summaryType);
    } else {
      console.log("Processing non-streaming response...");
      const result = AI.getInstance().transformResponse(response);
      return AI.getInstance().parseMarkdown(result, summaryType);
    }
  }

  private transformResponse(response: any) {
    // Handle the new response structure from HuggingFace inference
    if (Array.isArray(response) && response.length > 0) {
      // New structure: array with message objects
      return response[0].message.content;
    } else if (response.choices && response.choices.length > 0) {
      // Fallback to standard OpenAI-like structure
      return response.choices[0].message.content;
    } else {
      // Fallback for unexpected response structure
      console.warn("Unexpected response structure:", response);
      return "Unable to process response";
    }
  }

  getStream() {
    return this.stream;
  }

  private parseMarkdown(text: string, summaryType: string): string {
    if (summaryType === "3 bullet points") {
      // Convert markdown bullet points to HTML
      return text
        .replace(/^\s*[-*+]\s+/gm, "• ") // Convert markdown bullets to bullet points
        .replace(/\n/g, "<br>") // Convert newlines to HTML breaks
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
        .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic text
    }
    return text;
  }

  public buildPrompt(text: string, summaryType: string) {
    return `You are a helpful assistant that summarizes text.
  You are going to summarize the following text:
  ${text}
  You need to summarize the text in a way that is easy to understand and to the point.
  Limit your response to ${summaryType} to best possible summary.`;
  }
}
