import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const networks = pgTable("networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  inpFile: text("inp_file").notNull(),
  nodeCount: integer("node_count").notNull().default(0),
  pipeCount: integer("pipe_count").notNull().default(0),
  pumpCount: integer("pump_count").notNull().default(0),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drlModels = pgTable("drl_models", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => networks.id),
  algorithm: text("algorithm").notNull(), // DQN, PPO, etc.
  status: text("status").notNull().default("training"), // training, paused, completed
  currentEpisode: integer("current_episode").notNull().default(0),
  totalEpisodes: integer("total_episodes").notNull().default(3000),
  currentReward: real("current_reward").notNull().default(0),
  bestReward: real("best_reward").notNull().default(0),
  learningRate: real("learning_rate").notNull().default(0.001),
  exploration: real("exploration").notNull().default(0.1),
  modelData: jsonb("model_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const networkMetrics = pgTable("network_metrics", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => networks.id),
  timestamp: timestamp("timestamp").defaultNow(),
  averagePressure: real("average_pressure").notNull(),
  flowRate: real("flow_rate").notNull(),
  powerConsumption: real("power_consumption").notNull(),
  waterQuality: real("water_quality").notNull(),
  energyEfficiency: real("energy_efficiency").notNull(),
});

export const pumps = pgTable("pumps", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => networks.id),
  name: text("name").notNull(),
  nodeId: text("node_id").notNull(), // EPANET node ID
  status: text("status").notNull().default("off"), // on, off, auto
  speed: real("speed").notNull().default(0), // 0-100%
  power: real("power").notNull().default(0),
  flow: real("flow").notNull().default(0),
  head: real("head").notNull().default(0),
});

export const valves = pgTable("valves", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => networks.id),
  name: text("name").notNull(),
  linkId: text("link_id").notNull(), // EPANET link ID
  status: text("status").notNull().default("open"), // open, closed, active
  position: real("position").notNull().default(100), // 0-100%
  setting: real("setting").notNull().default(0),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").references(() => networks.id),
  type: text("type").notNull(), // info, warning, error, success
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
});

export const insertNetworkSchema = createInsertSchema(networks).omit({
  id: true,
  createdAt: true,
});

export const insertDrlModelSchema = createInsertSchema(drlModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNetworkMetricsSchema = createInsertSchema(networkMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertPumpSchema = createInsertSchema(pumps).omit({
  id: true,
});

export const insertValveSchema = createInsertSchema(valves).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true,
});

export type Network = typeof networks.$inferSelect;
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;
export type DrlModel = typeof drlModels.$inferSelect;
export type InsertDrlModel = z.infer<typeof insertDrlModelSchema>;
export type NetworkMetrics = typeof networkMetrics.$inferSelect;
export type InsertNetworkMetrics = z.infer<typeof insertNetworkMetricsSchema>;
export type Pump = typeof pumps.$inferSelect;
export type InsertPump = z.infer<typeof insertPumpSchema>;
export type Valve = typeof valves.$inferSelect;
export type InsertValve = z.infer<typeof insertValveSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Real-time data types for WebSocket communication
export interface NetworkStatus {
  networkId: number;
  status: string;
  nodeCount: number;
  pipeCount: number;
  pumpCount: number;
  activePumps: number;
  energyEfficiency: number;
}

export interface TrainingProgress {
  modelId: number;
  episode: number;
  totalEpisodes: number;
  progress: number;
  reward: number;
  algorithm: string;
  learningRate: number;
  exploration: number;
}

export interface ControlUpdate {
  type: 'pump' | 'valve';
  id: number;
  nodeId?: string;
  linkId?: string;
  speed?: number;
  position?: number;
  status?: string;
}
