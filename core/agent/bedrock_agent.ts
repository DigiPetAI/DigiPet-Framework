  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";

  private client: BedrockRuntimeClient;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new BedrockRuntimeClient({
      credentials: {
      },
      region: process.env.AWS_REGION || "us-east-1",
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const command = new InvokeModelCommand({
      modelId: this.modelName,
      body: JSON.stringify({
        prompt: this.formatMessagesWithContext(contextualizedMessages),
        max_tokens: this.maxTokens,
        temperature: this.calculateDynamicTemperature(),
      }),

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    this.processInteraction(messages[messages.length - 1]);
    return responseBody.completion;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const command = new InvokeModelCommand({
      modelId: this.modelName,
      body: JSON.stringify({
        prompt: this.formatMessagesWithContext(contextualizedMessages),
        max_tokens: this.maxTokens,
        temperature: this.calculateDynamicTemperature(),
        stream: true,
      }),
    });

    const response = await this.client.send(command);
    const reader = response.body.getReader();

    this.processInteraction(messages[messages.length - 1]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = JSON.parse(new TextDecoder().decode(value));
      if (chunk.completion) {
        yield chunk.completion;
      }
  }

  private formatMessagesWithContext(messages: ChatMessage[]): string {
    const formattedMessages = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
    
    return `${systemContext}\n\nConversation:\n${formattedMessages}`;
  }

  private processInteraction(message: ChatMessage): void {
    this.updateEmotionalState(message);
    this.learn(message.content);
    this.updateMemory(message);
  }

  private updateMemory(message: ChatMessage): void {
    this.memory.shortTerm.currentContext = message.content;
    if (this.memory.shortTerm.recentInteractions.length >= 5) {
      const significantMemory = this.memory.shortTerm.recentInteractions[0];
      this.memory.longTerm.significantExperiences.push(significantMemory);
    }

  private calculateDynamicTemperature(): number {
    return this.temperature * 
      (1 + (this.personality.openness * 0.2) + 
           (this.emotionalState.excitement * 0.2));
  }
