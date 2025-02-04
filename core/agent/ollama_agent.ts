import { Ollama } from "ollama";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";

  role: string;
  content: string;
}

  private client: Ollama;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new Ollama();
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const contextualizedMessages = this.addPetContext(messages);
    const response = await this.client.chat({
      model: this.modelName,
      messages: this.formatMessagesForOllama(contextualizedMessages),
      options: {
        temperature: this.calculateDynamicTemperature(),
        num_predict: this.maxTokens,
      },
    });

    this.processInteraction(messages[messages.length - 1]);
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    
    const stream = await this.client.chat({
      messages: this.formatMessagesForOllama(contextualizedMessages),
      options: {
        num_predict: this.maxTokens,
      },

    this.processInteraction(messages[messages.length - 1]);

    for await (const chunk of stream) {
      if (chunk.message?.content) {
      }
    }
  }

  private formatMessagesForOllama(messages: ChatMessage[]): OllamaMessage[] {
    return [
      {
        role: "system",
        content: this.generateSystemPrompt()
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
  }

  private processInteraction(message: ChatMessage): void {
    this.updateEmotionalState(message);
    this.learn(message.content);
    
    this.memory.shortTerm.currentContext = message.content;
    if (this.memory.shortTerm.recentInteractions.length > 5) {
      const removedMemory = this.memory.shortTerm.recentInteractions.shift();
      if (removedMemory) {
        this.memory.longTerm.significantExperiences.push(removedMemory);
      }
    }
  }

  private calculateDynamicTemperature(): number {
    return this.temperature * 
      (1 + (this.personality.playfulness * 0.3) + 
           (this.emotionalState.excitement * 0.2));
  }
