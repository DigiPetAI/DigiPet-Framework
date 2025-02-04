import { GoogleAuth } from "google-auth-library";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";

export class PalmDigiPet extends DigiPetBaseAgent {
  private client: DiscussServiceClient;

  constructor(config: ModelConfig) {
    super(config);
    const auth = new GoogleAuth({
      credentials: JSON.parse(config.apiKey),
    });
    this.client = new DiscussServiceClient({ auth });
    this.modelName = config.modelName || "chat-bison";
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const [response] = await this.client.generateMessage({
      model: this.modelName,
      prompt: { 
        messages: this.formatMessagesForPalm(contextualizedMessages),
        context: this.generateSystemPrompt()
      },
      temperature: this.calculateDynamicTemperature(),
      candidateCount: 1,
    });

    this.processInteraction(messages[messages.length - 1]);
    return response.candidates?.[0]?.content || "";
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    
    const [response] = await this.client.generateMessageStream({
      model: this.modelName,
      prompt: { 
        messages: this.formatMessagesForPalm(contextualizedMessages),
        context: this.generateSystemPrompt()
      },
      temperature: this.calculateDynamicTemperature(),
    });

    this.processInteraction(messages[messages.length - 1]);

    for await (const chunk of response.candidates || []) {
      if (chunk.content) {
        yield chunk.content;
    }
  }

  private formatMessagesForPalm(messages: ChatMessage[]): Array<{ content: string }> {
    return messages.map((msg) => ({ content: msg.content }));
  }

  private processInteraction(message: ChatMessage): void {
    this.learn(message.content);
    
    this.updateMemorySystem(message);
    
    this.learningCapabilities.experiencePoints += 1;
    if (this.learningCapabilities.experiencePoints >= 100) {
      this.evolve();
      this.memory.longTerm.learnedBehaviors.push(
        `Evolved to level ${this.learningCapabilities.skillLevel}`
      );
    }
  }

  private updateMemorySystem(message: ChatMessage): void {
    this.memory.shortTerm.currentContext = message.content;
    this.memory.shortTerm.recentInteractions.push(message.content);
    
    if (this.memory.shortTerm.recentInteractions.length > 5) {
      const significantMemory = this.memory.shortTerm.recentInteractions.shift();
        if (this.isSignificantMemory(significantMemory)) {
          this.memory.longTerm.significantExperiences.push(significantMemory);
        }
      }
    }
  }

  private isSignificantMemory(memory: string): boolean {
    const emotionalKeywords = ['happy', 'excited', 'curious', 'tired', 'play', 'learn'];
    return emotionalKeywords.some(keyword => memory.toLowerCase().includes(keyword));
  }

  private calculateDynamicTemperature(): number {
    const emotionalFactor = (
      this.emotionalState.excitement * 0.3 +
      this.emotionalState.curiosity * 0.2 +
      this.emotionalState.happiness * 0.1
    );
    
    const personalityFactor = (
      this.personality.openness * 0.2 +
      this.personality.playfulness * 0.2
    
    const learningFactor = (
      this.learningCapabilities.adaptabilityRate * 0.1
    );
    
    return this.temperature * (1 + emotionalFactor + personalityFactor + learningFactor);
  }
}