import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Play } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Network, Pump } from "@shared/schema";

interface NetworkVisualizationProps {
  network?: Network;
  pumps?: Pump[];
  networkId: number;
}

export default function NetworkVisualization({ 
  network, 
  pumps, 
  networkId 
}: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const simulationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/networks/${networkId}/simulate`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Simulation Complete",
        description: "Hydraulic simulation completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/networks", networkId, "metrics"] });
    },
    onError: () => {
      toast({
        title: "Simulation Failed",
        description: "Failed to run hydraulic simulation",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw network visualization
    drawNetwork(ctx, canvas.offsetWidth, canvas.offsetHeight, pumps || []);
  }, [pumps]);

  const drawNetwork = (ctx: CanvasRenderingContext2D, width: number, height: number, pumps: Pump[]) => {
    // Draw background grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw main trunk line
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, height / 2);
    ctx.lineTo(width - 50, height / 2);
    ctx.stroke();

    // Draw nodes (junctions)
    const nodePositions = [
      { x: 100, y: height / 2 },
      { x: 200, y: height / 2 },
      { x: 300, y: height / 2 },
      { x: 400, y: height / 2 },
      { x: 500, y: height / 2 },
      { x: 600, y: height / 2 },
    ];

    nodePositions.forEach((pos, index) => {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`N${index + 1}`, pos.x, pos.y - 15);
    });

    // Draw pumps
    const pumpPositions = [
      { x: 150, y: height / 2 - 60 },
      { x: 350, y: height / 2 + 60 },
      { x: 550, y: height / 2 - 60 },
    ];

    pumpPositions.forEach((pos, index) => {
      const pump = pumps[index];
      const isActive = pump?.status === 'on';
      
      // Draw pump station
      ctx.fillStyle = isActive ? '#2563eb' : '#9ca3af';
      ctx.fillRect(pos.x - 15, pos.y - 10, 30, 20);
      
      // Pump icon
      ctx.fillStyle = 'white';
      ctx.font = '14px FontAwesome';
      ctx.textAlign = 'center';
      ctx.fillText('⚙', pos.x, pos.y + 5);
      
      // Connection lines
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      if (index === 0) {
        ctx.moveTo(pos.x, pos.y + 10);
        ctx.lineTo(150, height / 2);
      } else if (index === 1) {
        ctx.moveTo(pos.x, pos.y - 10);
        ctx.lineTo(350, height / 2);
      } else {
        ctx.moveTo(pos.x, pos.y + 10);
        ctx.lineTo(550, height / 2);
      }
      ctx.stroke();
      
      // Pump labels
      ctx.fillStyle = '#374151';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`P${index + 1}`, pos.x, pos.y - 20);
      
      if (pump) {
        ctx.fillText(`${pump.speed.toFixed(0)}%`, pos.x, pos.y + 35);
      }
    });

    // Draw valves
    const valvePositions = [
      { x: 250, y: height / 2 },
      { x: 450, y: height / 2 },
    ];

    valvePositions.forEach((pos, index) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Valve symbol
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pos.x - 5, pos.y - 5);
      ctx.lineTo(pos.x + 5, pos.y + 5);
      ctx.moveTo(pos.x + 5, pos.y - 5);
      ctx.lineTo(pos.x - 5, pos.y + 5);
      ctx.stroke();
      
      // Valve labels
      ctx.fillStyle = '#374151';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`V${index + 1}`, pos.x, pos.y + 20);
    });

    // Draw reservoir
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(20, height / 2 - 20, 40, 40);
    ctx.fillStyle = 'white';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('RES', 40, height / 2 + 5);

    // Draw tank
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(width - 60, height / 2 - 20, 40, 40);
    ctx.fillStyle = 'white';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('TANK', width - 40, height / 2 + 5);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Network Visualization
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 hover:bg-gray-100"
            >
              <Eye className="mr-1 h-4 w-4" />
              Toggle View
            </Button>
            <Button
              size="sm"
              onClick={() => simulationMutation.mutate()}
              disabled={simulationMutation.isPending}
              className="bg-primary text-white hover:bg-blue-700"
            >
              <Play className="mr-1 h-4 w-4" />
              {simulationMutation.isPending ? 'Running...' : 'Run Simulation'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 network-canvas"
          />
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Pump Stations</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Nodes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-1 bg-gray-500"></div>
              <span>Pipes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Valves</span>
            </div>
          </div>
          
          {/* Network Stats */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
            <div className="text-sm space-y-1">
              <div>Nodes: <span className="font-semibold">{network?.nodeCount || 45}</span></div>
              <div>Pipes: <span className="font-semibold">{network?.pipeCount || 62}</span></div>
              <div>Pumps: <span className="font-semibold">{network?.pumpCount || 16}</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
