import MistralClient from "@mistralai/mistralai";
  private client: MistralClient;

    super(config);
    this.client = new MistralClient(config.apiKey);

  async chat(messages: ChatMessage[]): Promise<string> {
    const contextualizedMessages = this.addPetContext(messages);
    const response = await this.client.chat({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: this.generateSystemPrompt(),
        ...this.formatMessages(contextualizedMessages)
      ],
    });
    return response.choices[0].message.content;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const stream = await this.client.chatStream({
      model: this.modelName,
      messages: [
        {
          role: "system",
        },
        ...this.formatMessages(contextualizedMessages)
      ],
      temperature: this.calculateDynamicTemperature(),
      maxTokens: this.maxTokens,
    });

    this.processInteraction(messages[messages.length - 1]);

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
  }
}