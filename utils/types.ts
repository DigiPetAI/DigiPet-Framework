export interface EmotionalState {
  happiness: number;
  excitement: number;
  curiosity: number;
  tiredness: number;
}

export interface PersonalityTraits {
  openness: number;
  playfulness: number;
  independence: number;
  skillLevel: number;
  experiencePoints: number;
  adaptabilityRate: number;
}

  shortTerm: {
    recentInteractions: string[];
  };
  longTerm: {
    significantExperiences: string[];
    learnedBehaviors: string[];
    relationshipHistory: Record<string, number>;
  };

  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;

export interface ModelConfig {
  modelName: string;
  temperature: number;
  apiKey: string;
  petPersonality?: PersonalityTraits;
  learningParams?: LearningCapabilities;
  baseEmotionalState?: EmotionalState;
  memoryConfig?: {
}