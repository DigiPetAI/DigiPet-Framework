export interface DigiPetMetrics {
    happiness: number;
    sociability: number;
    learning: number;
    adaptability: number;
    loyalty: number;
  }
  
  export interface EvaluationScore {
    score: number;
    metrics: DigiPetMetrics;
    timestamp: Date;
    details?: {
      recentInteractions: string[];
      skillProgression: Record<string, number>;
      emotionalGrowth: Record<string, number>;
    };
