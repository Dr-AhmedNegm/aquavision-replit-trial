import { 
  networks, drlModels, networkMetrics, pumps, valves, events,
  type Network, type InsertNetwork, type DrlModel, type InsertDrlModel,
  type NetworkMetrics, type InsertNetworkMetrics, type Pump, type InsertPump,
  type Valve, type InsertValve, type Event, type InsertEvent
} from "@shared/schema";

export interface IStorage {
  // Networks
  getNetwork(id: number): Promise<Network | undefined>;
  getAllNetworks(): Promise<Network[]>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  updateNetwork(id: number, updates: Partial<Network>): Promise<Network | undefined>;

  // DRL Models
  getDrlModel(id: number): Promise<DrlModel | undefined>;
  getDrlModelByNetworkId(networkId: number): Promise<DrlModel | undefined>;
  createDrlModel(model: InsertDrlModel): Promise<DrlModel>;
  updateDrlModel(id: number, updates: Partial<DrlModel>): Promise<DrlModel | undefined>;

  // Network Metrics
  getLatestMetrics(networkId: number): Promise<NetworkMetrics | undefined>;
  getMetricsHistory(networkId: number, hours: number): Promise<NetworkMetrics[]>;
  createMetrics(metrics: InsertNetworkMetrics): Promise<NetworkMetrics>;

  // Pumps
  getPumpsByNetworkId(networkId: number): Promise<Pump[]>;
  getPump(id: number): Promise<Pump | undefined>;
  createPump(pump: InsertPump): Promise<Pump>;
  updatePump(id: number, updates: Partial<Pump>): Promise<Pump | undefined>;

  // Valves
  getValvesByNetworkId(networkId: number): Promise<Valve[]>;
  getValve(id: number): Promise<Valve | undefined>;
  createValve(valve: InsertValve): Promise<Valve>;
  updateValve(id: number, updates: Partial<Valve>): Promise<Valve | undefined>;

  // Events
  getRecentEvents(networkId: number, limit: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  acknowledgeEvent(id: number): Promise<Event | undefined>;
}

export class MemStorage implements IStorage {
  private networks: Map<number, Network> = new Map();
  private drlModels: Map<number, DrlModel> = new Map();
  private networkMetrics: Map<number, NetworkMetrics[]> = new Map();
  private pumps: Map<number, Pump> = new Map();
  private valves: Map<number, Valve> = new Map();
  private events: Map<number, Event> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with sample network
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const network: Network = {
      id: 1,
      name: "Main Distribution Network",
      description: "Primary water distribution network for the city",
      inpFile: "net1.inp",
      nodeCount: 45,
      pipeCount: 62,
      pumpCount: 16,
      status: "active",
      createdAt: new Date(),
    };
    this.networks.set(1, network);

    const drlModel: DrlModel = {
      id: 1,
      networkId: 1,
      algorithm: "DQN",
      status: "training",
      currentEpisode: 2847,
      totalEpisodes: 3000,
      currentReward: 2341.7,
      bestReward: 2456.3,
      learningRate: 0.001,
      exploration: 0.05,
      modelData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.drlModels.set(1, drlModel);

    // Initialize pumps
    for (let i = 1; i <= 16; i++) {
      const pump: Pump = {
        id: i,
        networkId: 1,
        name: `Pump Station ${String.fromCharCode(64 + i)}`,
        nodeId: `P${i}`,
        status: i <= 12 ? "on" : "off",
        speed: i <= 12 ? 60 + Math.random() * 40 : 0,
        power: i <= 12 ? 10 + Math.random() * 20 : 0,
        flow: i <= 12 ? 50 + Math.random() * 100 : 0,
        head: i <= 12 ? 30 + Math.random() * 20 : 0,
      };
      this.pumps.set(i, pump);
    }

    // Initialize valves
    for (let i = 1; i <= 8; i++) {
      const valve: Valve = {
        id: i,
        networkId: 1,
        name: `Valve ${i}`,
        linkId: `V${i}`,
        status: "open",
        position: 50 + Math.random() * 50,
        setting: 0,
      };
      this.valves.set(i, valve);
    }

    // Initialize recent events
    const eventData = [
      { title: "DRL agent achieved new efficiency record", description: "Power consumption reduced by 8.3% while maintaining optimal pressure levels", type: "success" },
      { title: "Training episode 2,800 completed", description: "Reward convergence improved, model saved automatically", type: "info" },
      { title: "Pump Station B speed optimized", description: "DRL agent adjusted pump speed from 92% to 78% for better efficiency", type: "info" },
    ];

    eventData.forEach((event, index) => {
      const e: Event = {
        id: index + 1,
        networkId: 1,
        type: event.type,
        title: event.title,
        description: event.description,
        timestamp: new Date(Date.now() - (index + 1) * 15 * 60 * 1000),
        acknowledged: false,
      };
      this.events.set(index + 1, e);
    });

    this.currentId = 100;
  }

  async getNetwork(id: number): Promise<Network | undefined> {
    return this.networks.get(id);
  }

  async getAllNetworks(): Promise<Network[]> {
    return Array.from(this.networks.values());
  }

  async createNetwork(network: InsertNetwork): Promise<Network> {
    const id = this.currentId++;
    const newNetwork: Network = {
      ...network,
      id,
      createdAt: new Date(),
    };
    this.networks.set(id, newNetwork);
    return newNetwork;
  }

  async updateNetwork(id: number, updates: Partial<Network>): Promise<Network | undefined> {
    const network = this.networks.get(id);
    if (!network) return undefined;
    
    const updated = { ...network, ...updates };
    this.networks.set(id, updated);
    return updated;
  }

  async getDrlModel(id: number): Promise<DrlModel | undefined> {
    return this.drlModels.get(id);
  }

  async getDrlModelByNetworkId(networkId: number): Promise<DrlModel | undefined> {
    return Array.from(this.drlModels.values()).find(model => model.networkId === networkId);
  }

  async createDrlModel(model: InsertDrlModel): Promise<DrlModel> {
    const id = this.currentId++;
    const newModel: DrlModel = {
      ...model,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.drlModels.set(id, newModel);
    return newModel;
  }

  async updateDrlModel(id: number, updates: Partial<DrlModel>): Promise<DrlModel | undefined> {
    const model = this.drlModels.get(id);
    if (!model) return undefined;
    
    const updated = { ...model, ...updates, updatedAt: new Date() };
    this.drlModels.set(id, updated);
    return updated;
  }

  async getLatestMetrics(networkId: number): Promise<NetworkMetrics | undefined> {
    const metrics = this.networkMetrics.get(networkId);
    if (!metrics || metrics.length === 0) return undefined;
    return metrics[metrics.length - 1];
  }

  async getMetricsHistory(networkId: number, hours: number): Promise<NetworkMetrics[]> {
    const metrics = this.networkMetrics.get(networkId) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return metrics.filter(m => m.timestamp && m.timestamp > cutoff);
  }

  async createMetrics(metrics: InsertNetworkMetrics): Promise<NetworkMetrics> {
    const id = this.currentId++;
    const newMetrics: NetworkMetrics = {
      ...metrics,
      id,
      timestamp: new Date(),
    };
    
    const networkMetrics = this.networkMetrics.get(metrics.networkId) || [];
    networkMetrics.push(newMetrics);
    this.networkMetrics.set(metrics.networkId, networkMetrics);
    
    return newMetrics;
  }

  async getPumpsByNetworkId(networkId: number): Promise<Pump[]> {
    return Array.from(this.pumps.values()).filter(pump => pump.networkId === networkId);
  }

  async getPump(id: number): Promise<Pump | undefined> {
    return this.pumps.get(id);
  }

  async createPump(pump: InsertPump): Promise<Pump> {
    const id = this.currentId++;
    const newPump: Pump = { ...pump, id };
    this.pumps.set(id, newPump);
    return newPump;
  }

  async updatePump(id: number, updates: Partial<Pump>): Promise<Pump | undefined> {
    const pump = this.pumps.get(id);
    if (!pump) return undefined;
    
    const updated = { ...pump, ...updates };
    this.pumps.set(id, updated);
    return updated;
  }

  async getValvesByNetworkId(networkId: number): Promise<Valve[]> {
    return Array.from(this.valves.values()).filter(valve => valve.networkId === networkId);
  }

  async getValve(id: number): Promise<Valve | undefined> {
    return this.valves.get(id);
  }

  async createValve(valve: InsertValve): Promise<Valve> {
    const id = this.currentId++;
    const newValve: Valve = { ...valve, id };
    this.valves.set(id, newValve);
    return newValve;
  }

  async updateValve(id: number, updates: Partial<Valve>): Promise<Valve | undefined> {
    const valve = this.valves.get(id);
    if (!valve) return undefined;
    
    const updated = { ...valve, ...updates };
    this.valves.set(id, updated);
    return updated;
  }

  async getRecentEvents(networkId: number, limit: number = 10): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.networkId === networkId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const newEvent: Event = {
      ...event,
      id,
      timestamp: new Date(),
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async acknowledgeEvent(id: number): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updated = { ...event, acknowledged: true };
    this.events.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
