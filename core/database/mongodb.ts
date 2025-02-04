import { Pool, PoolClient } from 'pg';
import { ChatMessage } from '../types';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined

const CREATE_TABLES = `
  -- Conversations table
  CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
  );

  -- Messages table
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  -- Agent movements table
  CREATE TABLE IF NOT EXISTS agent_movements (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    position JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  -- Agent interactions table
  CREATE TABLE IF NOT EXISTS agent_interactions (
    id SERIAL PRIMARY KEY,
    agent_id1 VARCHAR(100) NOT NULL,
    agent_id2 VARCHAR(100) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  -- DigiPet States table
  CREATE TABLE IF NOT EXISTS digipet_states (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    emotional_state JSONB NOT NULL,
    personality_traits JSONB NOT NULL,
    learning_stats JSONB NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_movements_agent ON agent_movements(agent_id);
  CREATE INDEX IF NOT EXISTS idx_interactions_agents ON agent_interactions(agent_id1, agent_id2);
`;

  const client = await pool.connect();
  try {
    await client.query(CREATE_TABLES);
  } finally {
    client.release();
  }
}

initializeDatabase().catch(console.error);

interface Position {
  x: number;
  y: number;
}

interface AgentMovementRecord {
  agentId: string;
  position: Position;
  timestamp: Date;

interface AgentInteractionRecord {
  agentId1: string;
  agentId2: string;
  interactionType: string;
  details: Record<string, any>;
  timestamp: Date;
}

  agentType: string,
  messages: ChatMessage[],
  sessionId: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const conversationResult = await client.query(
      'INSERT INTO conversations (agent_type, session_id) VALUES ($1, $2) RETURNING id',
      [agentType, sessionId]
    );
    const conversationId = conversationResult.rows[0].id;

    for (const message of messages) {
      await cli