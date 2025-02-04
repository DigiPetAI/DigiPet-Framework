import { LettaClient, LettaEnvironment } from "@letta-ai/letta-client";

interface Memory {
  type: 'shortTerm' | 'longTerm' | 'emotional';
  timestamp: Date;
  emotionalImpact?: number;
  tags?: string[];
}

interface MemoryQueryOptions {
  type?: Memory['type'];
  startTime?: Date;
  endTime?: Date;
  tags?: string[];
  emotionalThreshold?: number;
}

class DigiPetMemoryManager {
  private localClient: LettaClient;
  private cloudClient: LettaClient;
  private petId: string;
  private shouldSync: boolean;
  constructor(
    petId: string,
    config: {
      selfHostedUrl?: string;
      enableSync?: boolean;
  ) {
    this.petId = petId;
    this.shouldSync = config.enableSync ?? true;

    this.localClient = new LettaClient({
      environment: LettaEnvironment.SelfHosted,
      baseUrl: config.selfHostedUrl,
    });

    if (config.cloudApiKey) {
      this.cloudClient = new LettaClient({
        environment: LettaEnvironment.Cloud,
        token: config.cloudApiKey,
      });
    }
  }

  async storeMemory(memory: Omit<Memory, 'timestamp'>): Promise<void> {
    const fullMemory: Memory = {
      ...memory,
      timestamp: new Date(),
    };

    try {
      await this.localClient.insert(`pet:${this.petId}:memories`, fullMemory);

      if (this.shouldSync && this.cloudClient) {
        await this.cloudClient.insert(`pet:${this.petId}:memories`, fullMemory);
      }

      switch (memory.type) {
        case 'shortTerm':
          await this.processShortTermMemory(fullMemory);
          break;
        case 'emotional':
          await this.processEmotionalMemory(fullMemory);
          break;
          await this.processLongTermMemory(fullMemory);
      }
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw error;
    }
  }

  async retrieveMemories(options: MemoryQueryOptions = {}): Promise<Memory[]> {
    try {
      const query = this.buildMemoryQuery(options);
      const memories = await this.localClient.search(`pet:${this.petId}:memories`, query);
      return memories as Memory[];
    } catch (error) {
      console.error('Failed to retrieve memories:', error);
      throw error;
    }
  }

  async consolidateMemories(): Promise<void> {
      const shortTermMemories = await this.retrieveMemories({
        type: 'shortTerm',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
      });

      const significantMemories = this.identifySignificantMemories(shortTermMemories);

      for (const memory of significantMemories) {
        await this.storeMemory({
          type: 'longTerm',
          tags: [...(memory.tags || []), 'consolidated']
        });
      }

      await this.cleanupOldMemories();
      console.error('Failed to consolidate memories:', error);
      throw error;
    }
  }

  async syncWithCloud(): Promise<void> {
    if (!this.cloudClient) {
      throw new Error('Cloud client not initialized');
    }

    try {
      const localMemories = await this.retrieveMemories();

      const cloudMemories = await this.cloudClient.search(`pet:${this.petId}:memories`, {});

      const memoriesToSync = this.findMemoriesToSync(localMemories, cloudMemories);

      for (const memory of memoriesToSync) {
        await this.cloudClient.insert(`pet:${this.petId}:memories`, memory);
      }
    } catch (error) {
      console.error('Failed to sync with cloud:', error);
      throw error;
    }
  }
  private async processShortTermMemory(memory: Memory): Promise<void> {
    memory.tags = [...(memory.tags || []), 'recent'];

    const recentMemories = await this.retrieveMemories({
      type: 'shortTerm',
      startTime: new Date(Date.now() - 60 * 60 * 1000)
    });

    if (this.detectPattern(recentMemories)) {
      await this.storeMemory({
        content: 'Pattern detected in recent interactions',
        type: 'longTerm',
        emotionalImpact: 0.5,
        tags: ['pattern', 'behavior']
      });
    }
  }

  private async processEmotionalMemory(memory: Memory): Promise<void> {
    if (memory.emotionalImpact && memory.emotionalImpact > 0.7) {
      await this.storeMemory({
        ...memory,
        type: 'longTerm',
        tags: [...(memory.tags || []), 'significant_emotional']
      });
    }
  }

  private async processLongTermMemory(memory: Memory): Promise<void> {
    const relatedMemories = await this.findRelatedMemories(memory);
    if (relatedMemories.length > 0) {
      memory.tags = [...(memory.tags || []), 'associated'];
    }
  }

  private async cleanupOldMemories(): Promise<void> {
    const oldMemories = await this.retrieveMemories({
      type: 'shortTerm',
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    for (const memory of oldMemories) {
      await this.localClient.delete(`pet:${this.petId}:memories`, memory);
    }
  }

  private buildMemoryQuery(options: MemoryQueryOptions): any {
    const query: any = {};
    if (options.type) {
      query.type = options.type;
    }
    
    if (options.startTime || options.endTime) {
      query.timestamp = {};
      if (options.startTime) query.timestamp.$gte = options.startTime;
      if (options.endTime) query.timestamp.$lte = options.endTime;
    }
    
    if (options.tags) {
      query.tags = { $all: options.tags };
    }
    
      query.emotionalImpact = { $gte: options.emotionalThreshold };
    }
    
    return query;
  }

  private identifySignificantMemories(memories: Memory[]): Memory[] {
    return memories.filter(memory => (
      memory.emotionalImpact && memory.emotionalImpact > 0.5) || 
      (memory.tags && memory.tags.includes('important'))
    );
  }

  private findMemoriesToSync(localMemories: Memory[], cloudMemories: Memory[]): Memory[] {
    const cloudTimestamps = new Set(cloudMemories.map(m => m.timestamp.getTime()));
    return localMemories.filter(m => !cloudTimestamps.has(m.timestamp.getTime()));
  }

  private detectPattern(memories: Memory[]): boolean {
    return memories.length >= 3 && 
           memories.every(m => m.tags?.includes(memories[0].tags?.[0] || ''));
  }

  private async findRelatedMemories(memory: Memory): Promise<Memory[]> {
    return await this.retrieveMemories({
      tags: memory.tags,
      emotionalThreshold: memory.emotionalImpact
    });
  }
}

export const createLocalMemoryManager = (petId: string) => {
  return new DigiPetMemoryManager(petId);
};

export const createCloudMemoryManager = (petId: string, apiKey: string) => {
  return new DigiPetMemoryManager(petId, {
    cloudApiKey: apiKey,
    enableSync: true
  });
};