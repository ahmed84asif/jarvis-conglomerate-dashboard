import { getDb } from "./db";
import { goals, tasks, wealthMetrics, orgStructure, insights, briefings } from "../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import type { InsertGoal, InsertTask, InsertWealthMetric, InsertOrgStructure, InsertInsight, InsertBriefing } from "../drizzle/schema";

/**
 * Goal operations
 */
export async function createGoal(userId: number, goal: Omit<InsertGoal, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(goals).values({
    ...goal,
    userId,
  });
}

export async function getUserGoals(userId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (status) {
    return await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, status as any)))
      .orderBy(desc(goals.priority), desc(goals.createdAt));
  }

  return await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.priority), desc(goals.createdAt));
}

export async function updateGoal(userId: number, goalId: number, updates: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(goals)
    .set(updates)
    .where(and(eq(goals.userId, userId), eq(goals.id, goalId)));
}

/**
 * Task operations
 */
export async function createTask(userId: number, task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(tasks).values({
    ...task,
    userId,
  });
}

export async function getUserTasks(userId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (status) {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, status as any)))
      .orderBy(desc(tasks.priority), tasks.dueDate);
  }

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.priority), tasks.dueDate);
}

export async function updateTask(userId: number, taskId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)));
}

/**
 * Wealth metrics operations
 */
export async function recordMetric(userId: number, metric: InsertWealthMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(wealthMetrics).values({
    ...metric,
    userId,
  });
}

export async function getUserMetrics(userId: number, metricType?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (metricType) {
    return await db
      .select()
      .from(wealthMetrics)
      .where(and(eq(wealthMetrics.userId, userId), eq(wealthMetrics.metricType, metricType as any)))
      .orderBy(desc(wealthMetrics.recordedAt));
  }

  return await db
    .select()
    .from(wealthMetrics)
    .where(eq(wealthMetrics.userId, userId))
    .orderBy(desc(wealthMetrics.recordedAt));
}

export async function getLatestMetrics(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allMetrics = await db
    .select()
    .from(wealthMetrics)
    .where(eq(wealthMetrics.userId, userId))
    .orderBy(desc(wealthMetrics.recordedAt));

  // Group by metric type and get latest of each
  const latestMap = new Map();
  for (const metric of allMetrics) {
    if (!latestMap.has(metric.metricType)) {
      latestMap.set(metric.metricType, metric);
    }
  }

  return Array.from(latestMap.values());
}

/**
 * Org structure operations
 */
export async function createOrgRole(userId: number, org: InsertOrgStructure) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(orgStructure).values({
    ...org,
    userId,
  });
}

export async function getUserOrgStructure(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(orgStructure)
    .where(eq(orgStructure.userId, userId))
    .orderBy(orgStructure.role);
}

export async function updateOrgRole(userId: number, orgId: number, updates: Partial<InsertOrgStructure>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(orgStructure)
    .set(updates)
    .where(and(eq(orgStructure.userId, userId), eq(orgStructure.id, orgId)));
}

/**
 * Insights operations
 */
export async function createInsight(userId: number, insight: InsertInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(insights).values({
    ...insight,
    userId,
  });
}

export async function getUserInsights(userId: number, unreadOnly?: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (unreadOnly) {
    return await db
      .select()
      .from(insights)
      .where(and(eq(insights.userId, userId), eq(insights.isRead, false)))
      .orderBy(desc(insights.createdAt));
  }

  return await db
    .select()
    .from(insights)
    .where(eq(insights.userId, userId))
    .orderBy(desc(insights.createdAt));
}

export async function markInsightAsRead(userId: number, insightId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(insights)
    .set({ isRead: true })
    .where(and(eq(insights.userId, userId), eq(insights.id, insightId)));
}

/**
 * Briefing operations
 */
export async function createBriefing(userId: number, briefing: InsertBriefing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(briefings).values({
    ...briefing,
    userId,
  });
}

export async function getUserBriefings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(briefings)
    .where(eq(briefings.userId, userId))
    .orderBy(desc(briefings.createdAt));
}

export async function getLatestBriefing(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(briefings)
    .where(eq(briefings.userId, userId))
    .orderBy(desc(briefings.createdAt))
    .limit(1);

  return result[0];
}

export async function updateBriefing(userId: number, briefingId: number, updates: Partial<InsertBriefing>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(briefings)
    .set(updates)
    .where(and(eq(briefings.userId, userId), eq(briefings.id, briefingId)));
}
