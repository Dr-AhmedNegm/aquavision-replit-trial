import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { epanetService } from "./services/epanet";
import { drlService } from "./services/drl";
import { insertPumpSchema, insertValveSchema, insertDrlModelSchema } from "@shared/schema";
import type { NetworkStatus, TrainingProgress, ControlUpdate } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  await epanetService.initialize();
  await drlService.initialize({
    algorithm: "DQN",
    learningRate: 0.001,
    batchSize: 32,
    bufferSize: 10000,
    explorationRate: 0.1,
    targetUpdateFreq: 100,
  });

  // Networks
  app.get("/api/networks", async (req, res) => {
    try {
      const networks = await storage.getAllNetworks();
      res.json(networks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch networks" });
    }
  });

  app.get("/api/networks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const network = await storage.getNetwork(id);
      if (!network) {
        return res.status(404).json({ message: "Network not found" });
      }
      res.json(network);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network" });
    }
  });

  // DRL Models
  app.get("/api/networks/:networkId/drl-model", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const model = await storage.getDrlModelByNetworkId(networkId);
      if (!model) {
        return res.status(404).json({ message: "DRL model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch DRL model" });
    }
  });

  app.post("/api/networks/:networkId/drl-model", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const modelData = insertDrlModelSchema.parse({ ...req.body, networkId });
      const model = await storage.createDrlModel(modelData);
      res.json(model);
    } catch (error) {
      res.status(400).json({ message: "Failed to create DRL model" });
    }
  });

  // Training Control
  app.post("/api/drl-models/:id/start-training", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await drlService.startTraining(id);
      res.json({ message: "Training started" });
    } catch (error) {
      res.status(400).json({ message: "Failed to start training" });
    }
  });

  app.post("/api/drl-models/:id/pause-training", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await drlService.pauseTraining(id);
      res.json({ message: "Training paused" });
    } catch (error) {
      res.status(400).json({ message: "Failed to pause training" });
    }
  });

  app.post("/api/drl-models/:id/save", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await drlService.saveModel(id);
      res.json({ message: "Model saved" });
    } catch (error) {
      res.status(400).json({ message: "Failed to save model" });
    }
  });

  // Network Metrics
  app.get("/api/networks/:networkId/metrics/latest", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const metrics = await storage.getLatestMetrics(networkId);
      if (!metrics) {
        return res.status(404).json({ message: "No metrics found" });
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/networks/:networkId/metrics/history", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const hours = parseInt(req.query.hours as string) || 24;
      const metrics = await storage.getMetricsHistory(networkId, hours);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics history" });
    }
  });

  // Pumps
  app.get("/api/networks/:networkId/pumps", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const pumps = await storage.getPumpsByNetworkId(networkId);
      res.json(pumps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pumps" });
    }
  });

  app.put("/api/pumps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Update pump in storage
      const pump = await storage.updatePump(id, updates);
      if (!pump) {
        return res.status(404).json({ message: "Pump not found" });
      }

      // Update EPANET model if speed changed
      if (updates.speed !== undefined) {
        await epanetService.updatePumpSpeed(pump.nodeId, updates.speed);
      }

      res.json(pump);
    } catch (error) {
      res.status(400).json({ message: "Failed to update pump" });
    }
  });

  // Valves
  app.get("/api/networks/:networkId/valves", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const valves = await storage.getValvesByNetworkId(networkId);
      res.json(valves);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch valves" });
    }
  });

  app.put("/api/valves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Update valve in storage
      const valve = await storage.updateValve(id, updates);
      if (!valve) {
        return res.status(404).json({ message: "Valve not found" });
      }

      // Update EPANET model if position changed
      if (updates.position !== undefined) {
        await epanetService.updateValvePosition(valve.linkId, updates.position);
      }

      res.json(valve);
    } catch (error) {
      res.status(400).json({ message: "Failed to update valve" });
    }
  });

  // Events
  app.get("/api/networks/:networkId/events", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getRecentEvents(networkId, limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Simulation Control
  app.post("/api/networks/:networkId/simulate", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      await epanetService.runSimulation(networkId);
      res.json({ message: "Simulation completed" });
    } catch (error) {
      res.status(400).json({ message: "Failed to run simulation" });
    }
  });

  // DRL Optimal Controls
  app.post("/api/networks/:networkId/apply-optimal", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const state = req.body.state || [];
      
      const actions = await drlService.getOptimalActions(networkId, state);
      
      // Apply actions to pumps and valves
      for (const action of actions) {
        if (action.type === 'pump') {
          await storage.updatePump(action.id, { speed: action.action });
          const pump = await storage.getPump(action.id);
          if (pump) {
            await epanetService.updatePumpSpeed(pump.nodeId, action.action);
          }
        }
      }

      res.json({ message: "Optimal controls applied", actions });
    } catch (error) {
      res.status(400).json({ message: "Failed to apply optimal controls" });
    }
  });

  // Emergency shutdown
  app.post("/api/networks/:networkId/emergency-shutdown", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      
      // Stop all pumps
      const pumps = await storage.getPumpsByNetworkId(networkId);
      for (const pump of pumps) {
        await storage.updatePump(pump.id, { status: "off", speed: 0 });
        await epanetService.updatePumpSpeed(pump.nodeId, 0);
      }

      await storage.createEvent({
        networkId,
        type: "warning",
        title: "Emergency Shutdown Activated",
        description: "All pumps have been stopped for safety",
      });

      res.json({ message: "Emergency shutdown completed" });
    } catch (error) {
      res.status(400).json({ message: "Failed to perform emergency shutdown" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    // Send initial data
    const sendNetworkStatus = async () => {
      try {
        const networks = await storage.getAllNetworks();
        if (networks.length > 0) {
          const network = networks[0];
          const pumps = await storage.getPumpsByNetworkId(network.id);
          const activePumps = pumps.filter(p => p.status === 'on').length;
          const metrics = await storage.getLatestMetrics(network.id);

          const status: NetworkStatus = {
            networkId: network.id,
            status: network.status,
            nodeCount: network.nodeCount,
            pipeCount: network.pipeCount,
            pumpCount: network.pumpCount,
            activePumps,
            energyEfficiency: metrics?.energyEfficiency || 92.4,
          };

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'networkStatus', data: status }));
          }
        }
      } catch (error) {
        console.error('Failed to send network status:', error);
      }
    };

    const sendTrainingProgress = async () => {
      try {
        const models = await storage.getAllNetworks();
        if (models.length > 0) {
          const model = await storage.getDrlModelByNetworkId(models[0].id);
          if (model) {
            const progress: TrainingProgress = {
              modelId: model.id,
              episode: model.currentEpisode,
              totalEpisodes: model.totalEpisodes,
              progress: (model.currentEpisode / model.totalEpisodes) * 100,
              reward: model.currentReward,
              algorithm: model.algorithm,
              learningRate: model.learningRate,
              exploration: model.exploration,
            };

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'trainingProgress', data: progress }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to send training progress:', error);
      }
    };

    // Send initial data
    sendNetworkStatus();
    sendTrainingProgress();

    // Set up periodic updates
    const statusInterval = setInterval(sendNetworkStatus, 5000);
    const trainingInterval = setInterval(sendTrainingProgress, 2000);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(statusInterval);
      clearInterval(trainingInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
