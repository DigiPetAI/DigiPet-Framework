import Anthropic from "@anthropic-ai/sdk";
import { ChatMessage, DigiPetBaseAgent, ModelConfig } from "./base_agent";
export class AnthropicDigiPet extends DigiPetBaseAgent {
  private client: Anthropic;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const response = await this.client.messages.create({
      system: this.generateSystemPrompt(),
      messages: [{
        role: "user",
        content: contextualizedMessages[contextualizedMessages.length - 1].content,
      }],
      temperature: this.temperature * this.personality.openness,
      max_tokens: this.maxTokens,
    });

    this.processInteraction(messages[messages.length - 1]);
    return response.content[0].text;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const contextualizedMessages = this.addPetContext(messages);
    
    const stream = await this.client.messages.create({
      model: this.modelName,
      messages: this.formatMessages(contextualizedMessages),
      temperature: this.temperature * this.personality.openness,
      max_tokens: this.maxTokens,
      stream: true,
    });


      if (chunk.type === "content_block_delta") {
        yield chunk.delta.text;
      }
    }

    this.memory.shortTerm.currentContext = message.content;
  }

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }
