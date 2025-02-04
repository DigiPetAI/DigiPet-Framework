import { mutation, query } from './_generated/server';
import { getAuthUserId } from './auth';
import { Id } from './_generated/dataModel';
import { v } from 'convex/values';

interface Personality {
  openness: number;
  playfulness: number;
  independence: number;
  sociability: number;
}

interface EmotionalState {
  happiness: number;
  excitement: number;
  curiosity: number;
  tiredness: number;
}

interface LearningStats {
  level: number;
  experience: number;
  skillPoints: number;
  learnedBehaviors: string[];
}

interface Memory {
  recentInteractions: Array<{
    type: string;
    content: string;
    timestamp: number;
  }>;
  significantExperiences: Array<{
    content: string;
    impact: number;
    timestamp: number;
  }>;
}

export const fetchDigiPet = query({
  args: { petId: v.id("digipet") },
  handler: async ({ db }, { petId }) => {
    return await db.get(petId);
  }
});

export const fetchAllDigiPets = query(async ({ db }) => {
  return await db
    .query("digipet")
    .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
    .collect();
});

export const fetchMyDigiPets = query(async (ctx) => {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) throw new Error("Not authenticated");

  return await ctx.db
    .query("digipet")
    .collect();
});

export const createDigiPet = mutation(
  async (
    ctx,
    {
      name,
      modelName,
      personality,
      description,
      visibility
    }: {
      name: string;
      modelName: string;
      personality?: Personality;
      description?: string;
      visibility: "public" | "private";
    }
  ) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const defaultPersonality: Personality = {
      openness: 0.5,
      playfulness: 0.5,
      independence: 0.5,
      sociability: 0.5
    };

    const initialState: EmotionalState = {
      happiness: 0.7,
      excitement: 0.5,
      curiosity: 0.6,
      tiredness: 0.3
    };

    const initialLearningStats: LearningStats = {
      level: 1,
      experience: 0,
      skillPoints: 0,
      learnedBehaviors: []
    };

    const initialMemory: Memory = {
      recentInteractions: [],
      significantExperiences: []
    };
    const newDigiPet = {
      authUserId,
      name,
      modelName,
      personality: personality || defaultPersonality,
      emotionalState: initialState,
      learningStats: initialLearningStats,
      memory: initialMemory,
      description: description || "",
      visibility,
      createdAt: Date.now(),
      lastInteraction: Date.now()
    };

    return await ctx.db.insert("digipet", newDigiPet);
  }
);

export const updateDigiPet = mutation(
  async (
    ctx,
    {
      petId,
      updates
    }: {
      petId: Id<"digipet">;
      updates: Partial<{
        name: string;
        modelName: string;
        personality: Partial<Personality>;
        description: string;
        visibility: "public" | "private";
      }>;
    }
  ) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const existingPet = await ctx.db.get(petId);
    if (!existingPet || existingPet.authUserId !== authUserId) {
      throw new Error("Not authorized to update this DigiPet");
    }

    await ctx.db.patch(petId, updates);
    return { success: true };
  }
);

export const interactWithDigiPet = mutation(
  async (
    ctx,
    {
      petId,
      interaction
    }: {
      petId: Id<"digipet">;
      interaction: {
        type: "play" | "train" | "rest" | "chat";
        content: string;
      };
    }
  ) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const pet = await ctx.db.get(petId);
    if (!pet) throw new Error("DigiPet not found");

    const newMemory: Memory = {
      recentInteractions: [
        {
          type: interaction.type,
          content: interaction.content,
          timestamp: Date.now()
        },
        ...pet.memory.recentInteractions.slice(0, 9)
      ],
      significantExperiences: pet.memory.significantExperiences
    };

    const emotionalUpdates = calculateEmotionalUpdates(pet.emotionalState, interaction);

    const learningUpdates = calculateLearningUpdates(pet.learningStats, interaction);

    await ctx.db.patch(petId, {
      memory: newMemory,
      emotionalState: emotionalUpdates,
      learningStats: learningUpdates,
      lastInteraction: Date.now()
    });

    return {
      success: true,
        emotionalState: emotionalUpdates,
        learningStats: learningUpdates
      }
    };
  }
);
export const deleteDigiPet = mutation(
  async (ctx, { petId }: { petId: Id<"digipet"> }) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const existingPet = await ctx.db.get(petId);
    if (!existingPet || existingPet.authUserId !== authUserId) {
      throw new Error("Not authorized to delete this DigiPet");
    }

    await ctx.db.delete(petId);
    return { success: true };
  }
);

function calculateEmotionalUpdates(
  currentState: EmotionalState,
  interaction: { type: string; content: string }
  const newState = { ...currentState };

  switch (interaction.type) {
    case "play":
      newState.happiness = Math.min(1, newState.happiness + 0.1);
      newState.excitement = Math.min(1, newState.excitement + 0.2);
      newState.tiredness = Math.min(1, newState.tiredness + 0.15);
      break;
    case "train":
      newState.curiosity = Math.min(1, newState.curiosity + 0.2);
      newState.tiredness = Math.min(1, newState.tiredness + 0.2);
      break;
    case "rest":
      newState.tiredness = Math.max(0, newState.tiredness - 0.3);
      newState.happiness = Math.min(1, newState.happiness + 0.05);
      break;
    case "chat":
      newState.happiness = Math.min(1, newState.happiness + 0.05);
      newState.curiosity = Math.min(1, newState.curiosity + 0.1);
      break;
  }

  Object.keys(newState).forEach((key) => {
    if (key !== "tiredness") {
      newState[key] = Math.max(0.1, newState[key] - 0.01);
    }
  });

  return newState;
}

function calculateLearningUpdates(
  currentStats: LearningStats,
  interaction: { type: string; content: string }
): LearningStats {
  const newStats = { ...currentStats };
  

  switch (interaction.type) {
    case "play":
      newStats.experience += 5;
      break;
    case "train":
      newStats.experience += 10;
      break;
    case "chat":
      newStats.experience += 3;
      break;
    case "rest":
      newStats.experience += 1;
      break;
  }

  const experienceNeeded = newStats.level * 100;
  if (newStats.experience >= experienceNeeded) {
    newStats.level += 1;
    newStats.experience -= experienceNeeded;
    newStats.skillPoints += 1;
    newStats.learnedBehaviors.push(`Reached level ${newStats.level}`);
  }

  return newStats;
}
