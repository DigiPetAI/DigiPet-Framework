export interface DigiPetConfig {
    name: string;
    apiKey?: string;
    personality?: {
      openness: number;
      playfulness: number;
      independence: number;
      sociability: number;
    initialState?: {
      happiness: number;
      curiosity: number;
    systemPrompt?: string;
  
    petId: string;
    name?: string;
    systemPrompt?: string;
