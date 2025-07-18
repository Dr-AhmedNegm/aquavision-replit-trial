import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import StatusCards from "@/components/status-cards";
import NetworkVisualization from "@/components/network-visualization";
import DrlTrainingPanel from "@/components/drl-training-panel";
import PerformanceMetrics from "@/components/performance-metrics";
import ControlPanel from "@/components/control-panel";
import RecentEvents from "@/components/recent-events";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const { data: networks } = useQuery({
    queryKey: ["/api/networks"],
  });

  const network = networks?.[0];
  const networkId = network?.id || 1;

  const { data: metrics } = useQuery({
    queryKey: ["/api/networks", networkId, "metrics", "latest"],
    enabled: !!networkId,
  });

  const { data: drlModel } = useQuery({
    queryKey: ["/api/networks", networkId, "drl-model"],
    enabled: !!networkId,
  });

  const { data: pumps } = useQuery({
    queryKey: ["/api/networks", networkId, "pumps"],
    enabled: !!networkId,
  });

  const { data: events } = useQuery({
    queryKey: ["/api/networks", networkId, "events"],
    enabled: !!networkId,
  });

  const { isConnected, networkStatus, trainingProgress, error } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isConnected={isConnected} 
        networkName={network?.name || "Main Distribution Network"}
      />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 ml-64">
          <StatusCards 
            network={network}
            metrics={metrics}
            drlModel={drlModel}
            pumps={pumps}
            networkStatus={networkStatus}
            trainingProgress={trainingProgress}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <NetworkVisualization 
                network={network}
                pumps={pumps}
                networkId={networkId}
              />
            </div>
            <div>
              <DrlTrainingPanel 
                drlModel={drlModel}
                trainingProgress={trainingProgress}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PerformanceMetrics 
              metrics={metrics}
              networkId={networkId}
            />
            <ControlPanel 
              pumps={pumps}
              networkId={networkId}
            />
          </div>
          
          <RecentEvents 
            events={events}
            networkId={networkId}
          />
        </main>
      </div>
    </div>
  );
}
