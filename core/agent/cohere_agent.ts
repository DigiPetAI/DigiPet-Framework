import { CohereClient } from "cohere-ai";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";

export class CohereDigiPet extends DigiPetBaseAgent {
  private client: CohereClient;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new CohereClient({ apiKey: config.apiKey });
  }

    const contextualizedMessages = this.addPetContext(messages);
    
    const response = await this.client.chat({
      model: this.modelName,
      message: this.formatMessagesWithContext(contextualizedMessages),
      temperature: this.calculateDynamicTemperature(),
      max_tokens: this.maxTokens,
    });

    this.processInteraction(messages[messages.length - 1]);
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const stream = await this.client.chat({
      message: this.formatMessagesWithContext(contextualizedMessages),
      temperature: this.calculateDynamicTemperature(),
      max_tokens: this.maxTokens,
      stream: true,
    });

    this.processInteraction(messages[messages.length - 1]);

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  private formatMessagesWithContext(messages: ChatMessage[]): string {
    const context = `Acting as a DigiPet with the following traits:
Personality: ${JSON.stringify(this.personality)}
Emotional State: ${JSON.stringify(this.emotionalState)}

Recent Interactions: ${this.memory.shortTerm.recentInteractions.join(", ")}
`;
    return context + messages[messages.length - 1].content;
  private processInteraction(message: ChatMessage): void {
    this.updateEmotionalState(message);
    this.learn(message.content);
    this.memory.shortTerm.currentContext = message.content;
    
    // Update learning capabilities based on interaction
    this.learningCapabilities.experiencePoints += 1;
    if (this.learningCapabilities.experiencePoints >= 100) {
      this.evolve();
    }
  }

  private calculateDynamicTemperature(): number {
    const emotionalFactor = (
      this.emotionalState.excitement * 0.3 +
      this.emotionalState.curiosity * 0.2
    return this.temperature * (1 + emotionalFactor);
  }
}