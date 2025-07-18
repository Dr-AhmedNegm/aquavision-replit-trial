import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Brain, Cog, Leaf } from "lucide-react";
import type { Network, NetworkMetrics, DrlModel, Pump } from "@shared/schema";
import type { NetworkStatus, TrainingProgress } from "@shared/schema";

interface StatusCardsProps {
  network?: Network;
  metrics?: NetworkMetrics;
  drlModel?: DrlModel;
  pumps?: Pump[];
  networkStatus?: NetworkStatus | null;
  trainingProgress?: TrainingProgress | null;
}

export default function StatusCards({ 
  network, 
  metrics, 
  drlModel, 
  pumps,
  networkStatus,
  trainingProgress 
}: StatusCardsProps) {
  const activePumps = pumps?.filter(p => p.status === 'on').length || 0;
  const totalPumps = pumps?.length || 0;
  const efficiency = networkStatus?.energyEfficiency || metrics?.energyEfficiency || 92.4;
  const trainingPercent = trainingProgress ? 
    Math.round((trainingProgress.episode / trainingProgress.totalEpisodes) * 100) : 
    (drlModel ? Math.round((drlModel.currentEpisode / drlModel.totalEpisodes) * 100) : 85);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Status</p>
              <p className="text-2xl font-bold text-secondary">
                {networkStatus?.status === 'active' || network?.status === 'active' ? 'Optimal' : 'Inactive'}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-secondary text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">DRL Agent Training</p>
              <p className="text-2xl font-bold text-accent">{trainingPercent}%</p>
            </div>
            <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
              <Brain className="text-accent text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pumps</p>
              <p className="text-2xl font-bold text-primary">{activePumps}/{totalPumps}</p>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Cog className="text-primary text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Energy Efficiency</p>
              <p className="text-2xl font-bold text-secondary">{efficiency.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Leaf className="text-secondary text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
