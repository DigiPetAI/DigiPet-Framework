import chalk from "chalk";
import Table from "cli-table3";
import { DigiPetConfig, ModifyDigiPetConfig } from "./types";

export const createDigiPet = async (config: DigiPetConfig): Promise<void> => {
  try {
    console.log(chalk.blue("🥚"), "Creating new DigiPet...");

    if (config.personality) {
      const traits = Object.values(config.personality);
      if (traits.some(v => v < 0 || v > 1)) {
        throw new Error("Personality traits must be between 0 and 1");
      }
    }

    const fullConfig = {
      ...config,
      personality: {
        openness: 0.5,
        playfulness: 0.5,
        independence: 0.5,
        sociability: 0.5,
        ...config.personality,
      },
      initialState: {
        happiness: 0.7,
        excitement: 0.5,
        curiosity: 0.6,
        tiredness: 0.3,
        ...config.initialState,
      },
    };

    console.log(
      chalk.green("🐣"),
      `Created DigiPet '${config.name}' with model ${config.model || "default"}`,
    );
    console.log(chalk.blue("📊"), "Initial personality traits:");
    console.table(fullConfig.personality);
  } catch (error) {
    console.error(chalk.red("❌"), `Failed to create DigiPet: ${error.message}`);
    process.exit(1);
  }
};

export const modifyDigiPet = async (config: ModifyDigiPetConfig): Promise<void> => {
  try {
    console.log(chalk.blue("🔄"), "Modifying DigiPet...");
    
    if (config.personality) {
      const traits = Object.values(config.personality);
      if (traits.some(v => v < 0 || v > 1)) {
        throw new Error("Personality traits must be between 0 and 1");
      }
    }

    console.log(chalk.green("✓"), `Modified DigiPet '${config.petId}'`);
    
    if (config.personality) {
      console.log(chalk.blue("📊"), "Updated personality traits:");
      console.table(config.personality);
    }
  } catch (error) {
    console.error(chalk.red("❌"), `Failed to modify DigiPet: ${error.message}`);
    process.exit(1);
  }
};

export const listDigiPets = async (): Promise<void> => {
  try {
    console.log(chalk.blue("🔍"), "Fetching DigiPets...");
    
    const table = new Table({
      head: [
        "ID",
        "Name",
        "Model",
        "Level",
        "Happiness",
        "Social Score",
        "Status"
      ].map((header) => chalk.magenta(header)),
    });

    table.push(
      ["pet_1", "Mochi", "claude-3", "5", "85%", "High", "Active"],
      ["pet_2", "Byte", "gpt-4", "3", "92%", "Medium", "Resting"]
    );

    console.log(table.toString());
  } catch (error) {
    console.error(chalk.red("❌"), `Failed to list DigiPets: ${error.message}`);
    process.exit(1);
  }
};

export const interactWithPet = async (
  petId: string,
  action: string,
  message?: string
): Promise<void> => {
  try {
    console.log(chalk.blue("🤝"), `Interacting with DigiPet ${petId}...`);
    
    switch (action) {
      case "play":
        console.log(chalk.yellow("🎮"), "Starting play session...");
        break;
      case "train":
        console.log(chalk.cyan("📚"), "Beginning training...");
        break;
      case "rest":
        console.log(chalk.magenta("💤"), "Letting pet rest...");
        break;
      case "chat":
        if (!message) {
          throw new Error("Message is required for chat interaction");
        }
        console.log(chalk.green("💭"), "Chatting with pet...");
        break;
      default:
        throw new Error(`Unknown interaction type: ${action}`);
    }

    console.log(chalk.green("✓"), "Interaction complete");
  } catch (error) {
    console.error(chalk.red("❌"), `Interaction failed: ${error.message}`);
    process.exit(1);
  }
};

export const getPetStats = async (petId: string): Promise<void> => {
  try {
    console.log(chalk.blue("📊"), `Fetching stats for DigiPet ${petId}...`);

    const stats = {
      level: 5,
      experience: 450,
      nextLevel: 500,
      personality: {
        openness: 0.7,
        playfulness: 0.8,
        independence: 0.6,
        sociability: 0.9
      },
      state: {
        happiness: 0.85,
        excitement: 0.6,
        curiosity: 0.7,
        tiredness: 0.4
      },
      skills: [
        "Basic Commands",
        "Pattern Recognition",
        "Social Interaction"
      ]
    };

    console.log("\nLevel Progress:");
    console.log(`Level ${stats.level} (${stats.experience}/${stats.nextLevel} XP)`);
    
    console.log("\nPersonality Traits:");
    console.table(stats.personality);
    
    console.log("\nCurrent State:");
    console.table(stats.state);
    
    console.log("\nLearned Skills:");
    stats.skills.forEach(skill => console.log(chalk.cyan("•"), skill));
    
  } catch (error) {
    console.error(chalk.red("❌"), `Failed to get pet stats: ${error.message}`);
    process.exit(1);
  }
};