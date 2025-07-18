import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Cog, StopCircle, Wand2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pump, Valve } from "@shared/schema";

interface ControlPanelProps {
  pumps?: Pump[];
  networkId: number;
}

export default function ControlPanel({ pumps, networkId }: ControlPanelProps) {
  const [autoMode, setAutoMode] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: valves } = useQuery({
    queryKey: ["/api/networks", networkId, "valves"],
    enabled: !!networkId,
  });

  const updatePumpMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Pump> }) => {
      const response = await apiRequest("PUT", `/api/pumps/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks", networkId, "pumps"] });
    },
  });

  const updateValveMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Valve> }) => {
      const response = await apiRequest("PUT", `/api/valves/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks", networkId, "valves"] });
    },
  });

  const applyOptimalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/networks/${networkId}/apply-optimal`, {
        state: [] // In a real implementation, this would include current network state
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Optimal Controls Applied",
        description: "DRL agent recommendations have been applied to the network",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/networks", networkId] });
    },
    onError: () => {
      toast({
        title: "Failed to Apply Controls",
        description: "Could not apply DRL optimal controls",
        variant: "destructive",
      });
    },
  });

  const emergencyShutdownMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/networks/${networkId}/emergency-shutdown`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Shutdown Complete",
        description: "All pumps have been stopped for safety",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/networks", networkId] });
    },
  });

  const handlePumpSpeedChange = (pumpId: number, speed: number[]) => {
    if (!autoMode) {
      updatePumpMutation.mutate({
        id: pumpId,
        updates: { speed: speed[0] }
      });
    }
  };

  const handleValvePositionChange = (valveId: number, position: number[]) => {
    if (!autoMode) {
      updateValveMutation.mutate({
        id: valveId,
        updates: { position: position[0] }
      });
    }
  };

  const displayPumps = pumps?.slice(0, 3) || [];
  const mainValve = valves?.[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Control Panel
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto Mode</span>
            <Switch 
              checked={autoMode} 
              onCheckedChange={setAutoMode}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayPumps.map((pump) => (
          <div key={pump.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Cog className="text-primary h-5 w-5" />
                <span className="font-medium">{pump.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded-full text-white ${
                  pump.status === 'on' ? 'bg-secondary' : 'bg-gray-500'
                }`}>
                  {pump.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Speed:</span>
                <span className="font-medium">{pump.speed.toFixed(0)}%</span>
              </div>
              <Slider
                value={[pump.speed]}
                onValueChange={(value) => handlePumpSpeedChange(pump.id, value)}
                max={100}
                step={1}
                disabled={autoMode}
                className="w-full"
              />
            </div>
          </div>
        ))}
        
        {mainValve && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full"></div>
                <span className="font-medium">{mainValve.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm px-2 py-1 bg-secondary text-white rounded-full">
                  {mainValve.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">{mainValve.position.toFixed(0)}%</span>
              </div>
              <Slider
                value={[mainValve.position]}
                onValueChange={(value) => handleValvePositionChange(mainValve.id, value)}
                max={100}
                step={1}
                disabled={autoMode}
                className="w-full"
              />
            </div>
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={() => applyOptimalMutation.mutate()}
            disabled={applyOptimalMutation.isPending}
            className="flex-1 bg-primary text-white hover:bg-blue-700"
          >
            <Wand2 className="mr-1 h-4 w-4" />
            {applyOptimalMutation.isPending ? 'Applying...' : 'Apply DRL Optimal'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => emergencyShutdownMutation.mutate()}
            disabled={emergencyShutdownMutation.isPending}
            className="flex-1"
          >
            <StopCircle className="mr-1 h-4 w-4" />
            {emergencyShutdownMutation.isPending ? 'Stopping...' : 'Emergency Stop'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
