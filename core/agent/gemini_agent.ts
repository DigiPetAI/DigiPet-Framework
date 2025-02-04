import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";

export class GeminiDigiPet extends DigiPetBaseAgent {
  private client: GoogleGenerativeAI;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
  }
  async chat(messages: ChatMessage[]): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const contextualizedMessages = this.addPetContext(messages);
    
    const chat = model.startChat({
      generationConfig: {
        temperature: this.calculateDynamicTemperature(),
        maxOutputTokens: this.maxTokens,
      },
        parts: [{ text: this.generateSystemPrompt() }],
    });
    const result = await chat.sendMessage(
    );
    
    return result.response.text();
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    const chat = model.startChat({
      generationConfig: {
        temperature: this.calculateDynamicTemperature(),
        maxOutputTokens: this.maxTokens,
      },
      history: [{
        role: "user",
        parts: [{ text: this.generateSystemPrompt() }],
      }],
    });

      contextualizedMessages[contextualizedMessages.length - 1].content,
      { stream: true }
    );

    this.processInteraction(messages[messages.length - 1]);

    }
  }

  private calculateDynamicTemperature(): number {
    const baseTemp = this.temperature;
    const emotionalModifier = (
      this.emotionalState.excitement * 0.3 +
      this.emotionalState.curiosity * 0.2
    );
    const personalityModifier = (
      this.personality.openness * 0.3 +
      this.personality.playfulness * 0.2
}