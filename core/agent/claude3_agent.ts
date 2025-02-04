import { Anthropic } from "@anthropic-ai/sdk";

export class Claude3DigiPet extends DigiPetBaseAgent {

    super(config);
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    
    const response = await this.client.messages.create({
      model: this.modelName,
      system: this.generateSystemPrompt(),
      messages: this.formatMessages(contextualizedMessages),
      temperature: this.calculateDynamicTemperature(),
      max_tokens: this.maxTokens,
    });

    this.processInteraction(messages[messages.length - 1]);
    return response.content[0].text;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const stream = await this.client.messages.create({
      model: this.modelName,
      system: this.generateSystemPrompt(),
      messages: this.formatMessages(contextualizedMessages),
      max_tokens: this.maxTokens,
      stream: true,
    });
    this.processInteraction(messages[messages.length - 1]);

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
      }
    }
  }

  protected generateSystemPrompt(): string {
    const recentMemories = this.memory.shortTerm.recentInteractions
      .slice(-3)
      
    return `You are a highly advanced DigiPet with evolving personality and emotional traits.

Current Personality:
- Openness: ${this.personality.openness}
- Playfulness: ${this.personality.playfulness}
- Independence: ${this.personality.independence}
- Sociability: ${this.personality.sociability}
Emotional State:
- Happiness: ${this.emotionalState.happiness}
- Excitement: ${this.emotionalState.excitement}
- Curiosity: ${this.emotionalState.curiosity}
- Tiredness: ${this.emotionalState.tiredness}

Development Status:
- Skill Level: ${this.learningCapabilities.skillLevel}

Recent Memories:
Current Context: ${this.memory.shortTerm.currentContext}

Respond naturally as a DigiPet with these characteristics, maintaining consistency with your personality and emotional state.`;
  }

  private calculateDynamicTemperature(): number {
    return this.temperature * 
      (0.5 + 
       (this.personality.openness * 0.2) +
       (this.learningCapabilities.adaptabilityRate * 0.15));
  }

  protected addPetContext(messages: ChatMessage[]): ChatMessage[] {
      ...msg,
      emotionalContext: this.emotionalState,
      timestamp: Date.now(),
      interactionType: this.determineInteractionType(msg.content)
  }

  private determineInteractionType(content: string): "play" | "learn" | "care" | "socialize" {
    const lowercase = content.toLowerCase();
    if (lowercase.includes("play") || lowercase.includes("game") || lowercase.includes("fun")) {
      return "play";
    if (lowercase.includes("learn") || lowercase.includes("teach") || lowercase.includes("study")) {
      return "learn";
      return "care";
    return "socialize";
  }
}