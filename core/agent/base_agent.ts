import {ChatMessage, EmotionalState, LearningCapabilities, ModelConfig, PersonalityTraits, PetMemory, } from '../../utils/types'

  modelName: string;
  temperature: number;
  maxTokens: number;
  personality: PersonalityTraits;
  emotionalState: EmotionalState;
  learningCapabilities: LearningCapabilities;
  memory: PetMemory;

  chat(messages: ChatMessage[]): Promise<string>;
  stream(messages: ChatMessage[]): AsyncGenerator<string>;
  getModelConfig(): ModelConfig;
  
  updateEmotionalState(interaction: ChatMessage): void;
  learn(experience: string): void;
  socialize(otherPet: BaseAgent): void;
  evolve(): void;
}

export abstract class DigiPetBaseAgent implements BaseAgent {
  modelName: string;
  temperature: number;
  maxTokens: number;
  personality: PersonalityTraits;
  emotionalState: EmotionalState;
  learningCapabilities: LearningCapabilities;
  memory: PetMemory;

  constructor(config: ModelConfig) {
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    
    this.personality = config.petPersonality || {
      openness: 0.5,
      playfulness: 0.5,
      independence: 0.5,
      sociability: 0.5
    };

    this.emotionalState = config.baseEmotionalState || {
      happiness: 0.7,
      excitement: 0.5,
      curiosity: 0.6,
      tiredness: 0.3
    };

    this.learningCapabilities = config.learningParams || {
      skillLevel: 1,
      experiencePoints: 0,
      adaptabilityRate: 0.5,
      memoryStrength: 0.5
    };

    this.memory = {
      shortTerm: {
        recentInteractions: [],
        currentContext: "",
        activeEmotions: this.emotionalState
      },
      longTerm: {
        significantExperiences: [],
        learnedBehaviors: [],
        relationshipHistory: {}
      }
    };
  }

  abstract chat(messages: ChatMessage[]): Promise<string>;
  abstract stream(messages: ChatMessage[]): AsyncGenerator<string>;
  
  updateEmotionalState(interaction: ChatMessage): void {
    const emotionalImpact = this.calculateEmotionalImpact(interaction);
    this.emotionalState = {
      happiness: Math.max(0, Math.min(1, this.emotionalState.happiness + emotionalImpact.happiness)),
      excitement: Math.max(0, Math.min(1, this.emotionalState.excitement + emotionalImpact.excitement)),
      curiosity: Math.max(0, Math.min(1, this.emotionalState.curiosity + emotionalImpact.curiosity)),
      tiredness: Math.max(0, Math.min(1, this.emotionalState.tiredness + emotionalImpact.tiredness))
    };
  }

  learn(experience: string): void {
    this.memory.shortTerm.recentInteractions.push(experience);
    if (this.memory.shortTerm.recentInteractions.length > 10) {
      this.memory.shortTerm.recentInteractions.shift();
    }

    this.learningCapabilities.experiencePoints += 1;
      this.evolve();
    }
  }

  socialize(otherPet: BaseAgent): void {
    const currentRelationship = this.memory.longTerm.relationshipHistory[otherPet.modelName] || 0;
    this.memory.longTerm.relationshipHistory[otherPet.modelName] = 
      Math.min(1, currentRelationship + this.personality.sociability * 0.1);
  }

  evolve(): void {
    if (this.learningCapabilities.experiencePoints >= 100) {
      this.learningCapabilities.skillLevel += 1;
      this.learningCapabilities.experiencePoints = 0;
      this.learningCapabilities.adaptabilityRate *= 1.1;
      this.learningCapabilities.memoryStrength *= 1.1;
    }
  }
  protected calculateEmotionalImpact(interaction: ChatMessage): EmotionalState {
    const baseImpact = {
      happiness: 0,
      excitement: 0,
      curiosity: 0,
      tiredness: 0.1
    };

    switch (interaction.interactionType) {
      case "play":
        baseImpact.happiness += 0.2;
        baseImpact.excitement += 0.3;
        baseImpact.tiredness += 0.2;
        break;
      case "learn":
        baseImpact.tiredness += 0.3;
        break;
      case "care":
        baseImpact.happiness += 0.3;
        baseImpact.tiredness -= 0.2;
        break;
      case "socialize":
        baseImpact.excitement += 0.2;
        baseImpact.happiness += 0.1;
        break;
    }

    return baseImpact;

  getModelConfig(): ModelConfig {
    return {
      modelName: this.modelName,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      apiKey: "",
      petPersonality: this.personality,
      learningParams: this.learningCapabilities,
      baseEmotionalState: this.emotionalState
    };
  }
}