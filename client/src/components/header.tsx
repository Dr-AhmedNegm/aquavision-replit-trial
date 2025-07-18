import { Download, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  isConnected: boolean;
  networkName: string;
}

export default function Header({ isConnected, networkName }: HeaderProps) {
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would export simulation results
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export Completed",
        description: "Simulation results have been exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export simulation results",
        variant: "destructive",
      });
    },
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Droplet className="text-primary text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900">AquaVision DRL</h1>
          </div>
          <div className="text-sm text-gray-500">Water Network Control Platform</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'EPANET-JS Connected' : 'Connection Lost'}
            </span>
          </div>
          
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="bg-primary text-white hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {exportMutation.isPending ? 'Exporting...' : 'Export Results'}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Dr. Smith</span>
          </div>
        </div>
      </div>
    </header>
  );
}
