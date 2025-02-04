import { DigiPetBaseAgent } from "../agent/base_agent";
import { DigiPetMetrics, EvaluationScore } from "../types";
export class DigiPetScorer {
  /**
   * Evaluates a DigiPet's overall development and capabilities
   */
  public static evaluateDigiPet(pet: DigiPetBaseAgent): EvaluationScore {
    const metrics: DigiPetMetrics = {
      happiness: this.evaluateHappiness(pet),
      sociability: this.evaluateSocialSkills(pet),
      learning: this.evaluateLearningProgress(pet),
      adaptability: this.evaluateAdaptability(pet),
      loyalty: this.evaluateLoyalty(pet)
    const weightedScore = this.calculateOverallScore(metrics);
    const details = this.gatherDetailedMetrics(pet);

    return {
      score: weightedScore,
      timestamp: new Date(),
    };
  }
  private static evaluateHappiness(pet: DigiPetBaseAgent): number {
    const { happiness, excitement, curiosity, tiredness } = pet.emotionalState;
    
    return (
      happiness * 0.4 +
      excitement * 0.3 +
      curiosity * 0.2 +
      (1 - tiredness) * 0.1
    );
  }

  private static evaluateSocialSkills(pet: DigiPetBaseAgent): number {
    const relationshipCount = Object.keys(pet.memory.longTerm.relationshipHistory).length;

    return (
      sociability * 0.3 +
      playfulness * 0.2 +
      Math.min(recentInteractions / 10, 1) * 0.25 +
      Math.min(relationshipCount / 5, 1) * 0.25
    );
  }

  private static evaluateLearningProgress(pet: DigiPetBaseAgent): number {
      skillLevel,
      experiencePoints,
      adaptabilityRate,
      memoryStrength 

    return (
      (experiencePoints / 100) * 0.3 +
      adaptabilityRate * 0.2 +
      memoryStrength * 0.2
    );
  }

  private static evaluateAdaptability(pet: DigiPetBaseAgent): number {
    const { openness, independence } = pet.personality;
    const learnedBehaviors = pet.memory.longTerm.learnedBehaviors.length;

      openness * 0.4 +
      independence * 0.3 +
      Math.min(learnedBehaviors / 10, 1) * 0.3
    );
  }

    const significantExperiences = pet.memory.longTerm.significantExperiences.length;
      .reduce((sum, value) => sum + value, 0) / Math.max(1, Object.keys(pet.memory.longTerm.relationshipHistory).length);

    return (
      Math.min(significantExperiences / 20, 1) * 0.5 +
      relationshipStrength * 0.5
    );
  }

  private static calculateOverallScore(metrics: DigiPetMetrics): number {
    const weights = {
      happiness: 0.25,
      sociability: 0.2,
      learning: 0.2,
      loyalty: 0.15
    };

    const totalScore = Object.entries(metrics).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof typeof weights];
    }, 0);

  }

  private static gatherDetailedMetrics(pet: DigiPetBaseAgent) {
    return {
      recentInteractions: pet.memory.shortTerm.recentInteractions.slice(-5),
      skillProgression: {
        currentLevel: pet.learningCapabilities.skillLevel,
        experiencePoints: pet.learningCapabilities.experiencePoints,
        adaptabilityRate: pet.learningCapabilities.adaptabilityRate,
        memoryStrength: pet.learningCapabilities.memoryStrength
      },
      emotionalGrowth: {
        excitement: pet.emotionalState.excitement,
        curiosity: pet.emotionalState.curiosity,
        tiredness: pet.emotionalState.tiredness
      }
    };
  }
}