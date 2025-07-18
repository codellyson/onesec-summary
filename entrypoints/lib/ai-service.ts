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

  static async summarize(text: string) {
    console.log("text", text);
    const response = await AI.getInstance().client.chatCompletion({
      provider: "hf-inference",
      model: "HuggingFaceTB/SmolLM3-3B",

      messages: [
        {
          role: "user",
          content: AI.getInstance().buildPrompt(text),
        },
      ],
      temperature: 0.6,
      chat_template_kwargs: { enable_thinking: false },
      stream: AI.getInstance().stream,
    });
    console.log("response", response);
    return AI.getInstance().transformResponse(response);
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

  public buildPrompt(text: string) {
    return `You are a helpful assistant that summarizes text.
  You are going to summarize the following text:
  ${text}
  You need to summarize the text in a way that is easy to understand and to the point.
  You need to summarize the text in a way that is easy to understand and to the point.
  Limit your response to best possible summary.`;
  }
}
