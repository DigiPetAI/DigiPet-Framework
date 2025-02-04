import OpenAI from "openai";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";

export class OpenAIDigiPet extends DigiPetBaseAgent {
  private client: OpenAI;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: this.generateSystemPrompt(),
        },
        ...this.formatMessages(contextualizedMessages)
      ],
      temperature: this.calculateDynamicTemperature(),
    });

    this.processInteraction(messages[messages.length - 1]);
    return response.choices[0].message.content || "";
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: this.generateSystemPrompt(),
        },
        ...this.formatMessages(contextualizedMessages)
      ],
      temperature: this.calculateDynamicTemperature(),
      stream: true,
    });

    this.processInteraction(messages[messages.length - 1]);

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
    }
  }
  private calculateDynamicTemperature(): number {
    return this.temperature * 
      (this.personality.openness * 0.5 + 
       this.emotionalState.excitement * 0.3 +
       this.personality.playfulness * 0.2);
  }
}