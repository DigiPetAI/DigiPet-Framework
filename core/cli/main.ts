#!/usr/bin/env node
import { Command } from "commander";
import {
  createDigiPet,
  modifyDigiPet,
  listDigiPets,
  interactWithPet,
} from "./agentCommands";


program
  .name("digipet-cli")
  .version("1.0.0");
  .command("create")
  .description("Create a new DigiPet")
  .requiredOption("-n, --name <name>", "name of the DigiPet")
  .option("-o, --openness <value>", "openness trait (0-1)", parseFloat)
  .option("-p, --playfulness <value>", "playfulness trait (0-1)", parseFloat)
  .option("-s, --sociability <value>", "sociability trait (0-1)", parseFloat)
  .option("-d, --description <description>", "pet description")
  .option("--system-prompt <prompt>", "system prompt for the pet")
  .action(async (options) => {
      openness: options.openness,
      playfulness: options.playfulness,
      sociability: options.sociability,
    };
    await createDigiPet({ ...options, personality });
  });

program
  .command("modify")
  .description("Modify an existing DigiPet's configuration")
  .option("-n, --name <name>", "new name for the DigiPet")
  .option("-m, --model <model>", "new AI model to use")
  .option("-o, --openness <value>", "new openness trait (0-1)", parseFloat)
  .option("-p, --playfulness <value>", "new playfulness trait (0-1)", parseFloat)
  .option("--independence <value>", "new independence trait (0-1)", parseFloat)
  .option("-s, --sociability <value>", "new sociability trait (0-1)", parseFloat)
  .option("-d, --description <description>", "new pet description")
  .option("--system-prompt <prompt>", "new system prompt")
  .action(async (options) => {
    const personality = {
      openness: options.openness,
      playfulness: options.playfulness,
      independence: options.independence,
      sociability: options.sociability,
    };
    await modifyDigiPet({ ...options, personality });
  });

  .command("list")
  .description("List all available DigiPets")
  .action(async () => {
    await listDigiPets();
  });

  .command("interact")
  .description("Interact with a DigiPet")
  .requiredOption("-i, --pet-id <id>", "ID of the DigiPet")
  .requiredOption(
    "-a, --action <action>", 
  .option("-m, --message <message>", "message for chat interaction")
    await interactWithPet(options.petId, options.action, options.message);
  });

program
  .command("stats")
  .description("Get detailed statistics for a DigiPet")
  .requiredOption("-i, --pet-id <id>", "ID of the DigiPet")
  .action(async (options) => {
    await getPetStats(options.petId);
  });

program.parse();