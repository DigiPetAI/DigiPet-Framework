import { OpenAIAgent } from "./openai_agent";
import { AnthropicAgent } from "./anthropic_agent";
import { GeminiAgent } from "./gemini_agent";
import { MistralAgent } from "./mistral_agent";
import { OllamaAgent } from "./ollama_agent";
import { BedrockAgent } from "./bedrock_agent";
import { CohereAgent } from "./cohere_agent";
import { Claude3Agent } from "./claude3_agent";
import { PalmAgent } from "./palm_agent";

const AGENT_TYPES = [
    'openai',
    'anthropic',
    'mistral',
    'ollama',
    'bedrock',
    'cohere',
    'claude3',
    'palm'
] as const;

export type AgentType = typeof AGENT_TYPES[number];

const AGENT_MAP: Record<AgentType, new (config: ModelConfig) => BaseAgent> = {
    anthropic: AnthropicAgent,
    gemini: GeminiAgent,
    mistral: MistralAgent,
    ollama: OllamaAgent,
    bedrock: BedrockAgent,
    cohere: CohereAgent,
    claude3: Claude3Agent,
    palm: PalmAgent
};

export class AgentFactory {
    private static validateAgentType(type: string): asserts type is AgentType {
        if (!AGENT_TYPES.includes(type as AgentType)) {
            throw new Error(`Invalid agent type: ${type}. Valid types are: ${AGENT_TYPES.join(', ')}`);
        }
    }

    static createAgent(type: string, config: ModelConfig): BaseAgent {
        this.validateAgentType(type);
        const AgentClass = AGENT_MAP[type];
        return new AgentClass(config);
    }

    static getAvailableAgentTypes(): readonly AgentType[] {
        return AGENT_TYPES;
    }

        return AGENT_TYPES.includes(type as AgentType);
    }
}