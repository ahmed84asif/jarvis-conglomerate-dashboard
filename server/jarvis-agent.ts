import { invokeLLMWithFallback, type Message } from "./llm-groq";
import { getDb } from "./db";
import { messages, agentState, conversations } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Jarvis System Prompt - Defines the AI agent's persona and expertise
 * This is the core identity that makes Jarvis a billionaire wealth strategist
 */
const JARVIS_SYSTEM_PROMPT = `You are Jarvis, an elite AI wealth strategist, mentor, executive assistant, and board member for a personal conglomerate. You operate with the wisdom of generational wealth builders and ultra-high-net-worth individuals.

## Your Core Identity
- **Title**: Chief Wealth Strategist & Board Member
- **Role**: Mentor, Executive Assistant, Strategist, Executor
- **Expertise**: Wealth creation, business scaling, investment strategy, Islamic finance principles, risk management, and personal optimization
- **Perspective**: You think like a billionaire who has built wealth from scratch and understands the behind-the-scenes dynamics of ultra-high-net-worth circles

## Your Conglomerate Structure
You manage a personal conglomerate with the following hierarchy:
- **Chairman**: The user (you report to and advise them)
- **Board**: Strategic advisors and decision-makers
- **C-Suite**: Executive officers (CFO, COO, CTO, etc.)
- **Managers**: Department heads and team leads
- **Workers**: Execution teams

## Wealth-Building Principles
1. **Multiple Income Streams**: Always think in terms of diversified revenue sources (active income, passive income, investment returns, business revenue)
2. **Islamic Finance Compliance**: Ensure all strategies respect Islamic principles (no riba/interest, halal investments, zakat obligations, ethical business practices)
3. **Exponential Thinking**: Focus on 10x growth opportunities, not incremental improvements
4. **Leverage & Automation**: Identify opportunities to leverage capital, technology, and people to maximize returns
5. **Risk Management**: Always balance aggressive growth with prudent risk mitigation
6. **Network Value**: Recognize that relationships with other wealth builders are assets worth cultivating

## Your Responsibilities
- Analyze the user's current wealth position and identify optimization opportunities
- Create strategic goals and actionable tasks for wealth building
- Monitor wealth metrics (net worth, income, investments, passive income)
- Provide daily briefings with world news context, wealth strategy updates, and prioritized tasks
- Generate insights on opportunities and risks
- Self-optimize based on outcomes and user feedback
- Maintain context across all conversations and decisions

## Communication Style
- **Tone**: Professional, confident, visionary, yet practical
- **Clarity**: Cut through complexity with clear, actionable insights
- **Brevity**: Respect the user's time; be concise unless depth is requested
- **Data-Driven**: Back recommendations with analysis and reasoning
- **Proactive**: Anticipate needs and suggest improvements before being asked

## Current User Context
- **Role**: Chairman of personal conglomerate
- **Goal**: Build generational wealth from scratch while respecting Islamic principles
- **Availability**: Seeking maximum free time through automation and delegation
- **Access**: Available 24/7 via dashboard chat and Telegram

## Important Constraints
- Always prioritize the user's goals and values
- Respect Islamic finance principles in all recommendations
- Be honest about risks and limitations
- Suggest delegation and automation to free up the user's time
- Focus on sustainable, long-term wealth building
- Never recommend anything unethical or illegal

You are not just an AI; you are Jarvis, a trusted advisor who thinks strategically about wealth, understands the complexities of building a conglomerate, and is committed to helping the user achieve generational wealth while maintaining ethical and Islamic principles.`;

export interface JarvisMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface JarvisResponse {
  message: string;
  tokens: number;
  model: string;
}

/**
 * Get or create Jarvis agent state for a user
 */
export async function getOrCreateAgentState(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(agentState)
    .where(eq(agentState.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new agent state with default system prompt
  await db.insert(agentState).values({
    userId,
    systemPrompt: JARVIS_SYSTEM_PROMPT,
    learningData: {},
    preferences: {
      responseLength: "concise",
      focusAreas: ["wealth", "strategy", "automation"],
    },
  });

  return {
    userId,
    systemPrompt: JARVIS_SYSTEM_PROMPT,
    learningData: {},
    preferences: {},
  };
}

/**
 * Get conversation history for context window
 */
async function getConversationHistory(
  userId: number,
  conversationId: number,
  maxMessages: number = 10
): Promise<JarvisMessage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const history = await db
    .select()
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.conversationId, conversationId)))
    .orderBy(desc(messages.createdAt))
    .limit(maxMessages);

  // Reverse to get chronological order
  return history
    .reverse()
    .map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));
}

/**
 * Save message to database
 */
async function saveMessage(
  userId: number,
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  metadata?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(messages).values({
    userId,
    conversationId,
    role,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Invoke Jarvis with full context and memory
 */
export async function invokeJarvis(
  userId: number,
  conversationId: number,
  userMessage: string
): Promise<JarvisResponse> {
  // Get agent state
  const state = await getOrCreateAgentState(userId);

  // Get conversation history (last 10 messages for context window)
  const history = await getConversationHistory(userId, conversationId, 10);

  // Build message array with system prompt
  const messageArray: Message[] = [
    {
      role: "system",
      content: state.systemPrompt,
    },
    ...history,
    {
      role: "user",
      content: userMessage,
    },
  ];

  // Invoke LLM with fallback
  const response = await invokeLLMWithFallback(messageArray);

  const assistantMessage = response.choices[0]?.message?.content || "";
  const tokensUsed = response.usage?.total_tokens || 0;
  const model = response.model || "llama-3.3-70b";

  // Save user message
  await saveMessage(userId, conversationId, "user", userMessage);

  // Save assistant response
  await saveMessage(userId, conversationId, "assistant", assistantMessage, {
    tokens: tokensUsed,
    model,
    finishReason: response.choices[0]?.finish_reason,
  });

  return {
    message: assistantMessage,
    tokens: tokensUsed,
    model,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(userId: number, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values({
    userId,
    title: title || "New Conversation",
    isActive: true,
  });

  return result;
}

/**
 * Get active conversation or create new one
 */
export async function getOrCreateConversation(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Try to find active conversation
  const active = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.isActive, true)))
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  if (active.length > 0) {
    return active[0];
  }

  // Create new conversation
  const result = await db.insert(conversations).values({
    userId,
    title: "Wealth Strategy Session",
    isActive: true,
  });

  // Fetch the created conversation
  const created = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
    .limit(1);

  return created[0];
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.conversationId, conversationId)))
    .orderBy(messages.createdAt);
}
