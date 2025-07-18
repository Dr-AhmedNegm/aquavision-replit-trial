import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pause, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DrlModel } from "@shared/schema";
import type { TrainingProgress } from "@shared/schema";

interface DrlTrainingPanelProps {
  drlModel?: DrlModel;
  trainingProgress?: TrainingProgress | null;
}

export default function DrlTrainingPanel({ 
  drlModel, 
  trainingProgress 
}: DrlTrainingPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pauseMutation = useMutation({
    mutationFn: async () => {
      if (!drlModel) throw new Error("No model available");
      const response = await apiRequest("POST", `/api/drl-models/${drlModel.id}/pause-training`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Training Paused",
        description: "DRL training has been paused",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!drlModel) throw new Error("No model available");
      const response = await apiRequest("POST", `/api/drl-models/${drlModel.id}/save`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Model Saved",
        description: "DRL model has been saved successfully",
      });
    },
  });

  const currentProgress = trainingProgress || drlModel;
  if (!currentProgress) return null;

  const progressPercent = (currentProgress.currentEpisode || currentProgress.episode || 0) / 
    (currentProgress.totalEpisodes || 3000) * 100;

  const rewardData = Array.from({ length: 10 }, (_, i) => ({
    height: Math.max(10, Math.min(100, 50 + (i - 5) * 10 + Math.random() * 20))
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          DRL Training Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Episode Progress</span>
            <span className="text-sm text-gray-500">
              {currentProgress.currentEpisode || currentProgress.episode || 0}/
              {currentProgress.totalEpisodes || 3000}
            </span>
          </div>
          <Progress value={progressPercent} className="training-progress-bar" />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Reward Convergence</span>
            <span className="text-sm text-secondary">
              +{(currentProgress.currentReward || currentProgress.reward || 2341.7).toFixed(1)}
            </span>
          </div>
          <div className="h-20 bg-gray-50 rounded border flex items-end justify-between p-2">
            {rewardData.map((bar, index) => (
              <div
                key={index}
                className={`w-1 ${index >= 6 ? 'bg-secondary' : index >= 3 ? 'bg-primary' : 'bg-gray-400'}`}
                style={{ height: `${bar.height}%` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Algorithm:</span>
            <span className="text-sm font-medium">
              {currentProgress.algorithm || drlModel?.algorithm || 'DQN'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Learning Rate:</span>
            <span className="text-sm font-medium">
              {currentProgress.learningRate || drlModel?.learningRate || 0.001}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Exploration:</span>
            <span className="text-sm font-medium">
              ε={(currentProgress.exploration || drlModel?.exploration || 0.05).toFixed(3)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => pauseMutation.mutate()}
            disabled={pauseMutation.isPending}
            className="flex-1 bg-primary text-white hover:bg-blue-700"
          >
            <Pause className="mr-1 h-4 w-4" />
            {pauseMutation.isPending ? 'Pausing...' : 'Pause'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex-1"
          >
            <Save className="mr-1 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
