import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { CloudSchedulerClient } from "@google-cloud/scheduler";
import { Storage } from "@google-cloud/storage";
import { CloudRunClient } from "@google-cloud/run";

export class DigiPetCloudManager {
  private secretManager: SecretManagerServiceClient;
  private scheduler: CloudSchedulerClient;
  private storage: Storage;
  private cloudRun: CloudRunClient;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.secretManager = new SecretManagerServiceClient();
    this.scheduler = new CloudSchedulerClient();
    this.storage = new Storage();
    this.cloudRun = new CloudRunClient();

  async savePetState(petId: string, state: any): Promise<void> {
    try {
      const bucketName = `${this.projectId}-pet-states`;
      const fileName = `pets/${petId}/state.json`;
      const bucket = this.storage.bucket(bucketName);
      await bucket.file(fileName).save(JSON.stringify(state));
    } catch (error) {
      throw new Error(`Failed to save pet state: ${error}`);
    }

  async loadPetState(petId: string): Promise<any> {
    try {
      const fileName = `pets/${petId}/state.json`;
      const file = this.storage.bucket(bucketName).file(fileName);
      const [content] = await file.download();
      return JSON.parse(content.toString());
    } catch (error) {
      throw new Error(`Failed to load pet state: ${error}`);
    }
  }

  async saveMemory(
    petId: string,
    memory: { content: string; timestamp: Date; type: string }
  ): Promise<void> {
    try {
      const bucketName = `${this.projectId}-pet-memories`;
      const fileName = `pets/${petId}/memories/${memory.timestamp.getTime()}.json`;
      const bucket = this.storage.bucket(bucketName);
      await bucket.file(fileName).save(JSON.stringify(memory));
    } catch (error) {
      throw new Error(`Failed to save memory: ${error}`);
    }

  async getMemories(
    startTime?: Date,
    endTime?: Date
  ): Promise<any[]> {
    try {
      const bucketName = `${this.projectId}-pet-memories`;
      
      const memories = await Promise.all(
        files
            return (!startTime || timestamp >= startTime.getTime()) &&
                   (!endTime || timestamp <= endTime.getTime());
          })
          .map(async file => {
            const [content] = await file.download();
            return JSON.parse(content.toString());
          })
      return memories;
    } catch (error) {
      throw new Error(`Failed to get memories: ${error}`);
    }
  }
  async scheduleTraining(
    petId: string,
    schedule: string,
    trainingType: string
  ): Promise<void> {
    try {
      const parent = `projects/${this.projectId}/locations/us-central1`;
      const jobName = `train-${petId}-${trainingType}`;
      
      await this.scheduler.createJob({
        parent,
          name: `${parent}/jobs/${jobName}`,
          httpTarget: {
            uri: `https://${this.projectId}.run.app/train`,
            httpMethod: "POST",
            body: Buffer.from(
              JSON.stringify({ petId, trainingType })
            ).toString('base64'),
          },
          schedule,
          timeZone: "UTC",
        },
    } catch (error) {
    }
  }

  async deployPetService(
    petId: string,
    config: {
      image: string;
      personality: any;
      learningRate: number;
      memoryCapacity: number;
    }
  ): Promise<void> {
    try {
      const parent = `projects/${this.projectId}/locations/us-central1`;
      const serviceName = `pet-${petId}`;

      await this.cloudRun.createService({
        parent,
        service: {
          name: `${parent}/services/${serviceName}`,
          template: {
            containers: [
              {
                image: config.image,
                env: [
                  { name: 'PET_ID', value: petId },
                  { name: 'PERSONALITY', value: JSON.stringify(config.personality) },
                  { name: 'LEARNING_RATE', value: config.learningRate.toString() },
                  { name: 'MEMORY_CAPACITY', value: config.memoryCapacity.toString() }
                ]
              }
            ]
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to deploy pet service: ${error}`);
    }
  }
  async createPetApiKey(petId: string): Promise<string> {
    try {
      const secretId = `pet-${petId}-api-key`;
      const apiKey = Math.random().toString(36).substring(2) + 
                    Math.random().toString(36).substring(2);

      await this.secretManager.createSecret({
        parent: `projects/${this.projectId}`,
        secretId,
        secret: {
          replication: {
            automatic: {},
          },
        },

      await this.secretManager.addSecretVersion({
        parent: `projects/${this.projectId}/secrets/${secretId}`,
        payload: {
          data: Buffer.from(apiKey, 'utf8'),
        },
      });

      return apiKey;
      throw new Error(`Failed to create pet API key: ${error}`);
  }
}

export const cloudManager = new DigiPetCloudManager(
  process.env.GOOGLE_CLOUD_PROJECT || ""
);