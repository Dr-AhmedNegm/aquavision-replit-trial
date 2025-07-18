import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { NetworkMetrics } from "@shared/schema";

interface PerformanceMetricsProps {
  metrics?: NetworkMetrics;
  networkId: number;
}

export default function PerformanceMetrics({ 
  metrics, 
  networkId 
}: PerformanceMetricsProps) {
  const { data: history } = useQuery({
    queryKey: ["/api/networks", networkId, "metrics", "history"],
    enabled: !!networkId,
  });

  const calculateTrend = (current: number, historical?: NetworkMetrics[]) => {
    if (!historical || historical.length < 2) return 0;
    const previous = historical[historical.length - 2];
    const field = Object.keys(previous).find(key => 
      typeof previous[key as keyof NetworkMetrics] === 'number' && 
      Math.abs((previous[key as keyof NetworkMetrics] as number) - current) < current * 0.5
    );
    if (!field) return 0;
    return ((current - (previous[field as keyof NetworkMetrics] as number)) / current) * 100;
  };

  const metricsData = [
    {
      label: "Average Pressure",
      value: `${(metrics?.averagePressure || 42.3).toFixed(1)} PSI`,
      trend: calculateTrend(metrics?.averagePressure || 42.3, history),
      trendValue: "+2.1%"
    },
    {
      label: "Flow Rate",
      value: `${Math.round(metrics?.flowRate || 1247)} GPM`,
      trend: -0.8,
      trendValue: "-0.8%"
    },
    {
      label: "Power Consumption",
      value: `${(metrics?.powerConsumption || 147.2).toFixed(1)} kW`,
      trend: -5.3,
      trendValue: "-5.3%"
    },
    {
      label: "Water Quality",
      value: `${(metrics?.waterQuality || 98.7).toFixed(1)}%`,
      trend: 0.4,
      trendValue: "+0.4%"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Performance Metrics
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {metricsData.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm ${
                  metric.trend >= 0 ? 'text-secondary' : 'text-gray-500'
                }`}>
                  {metric.trendValue}
                </span>
                {metric.trend >= 0 ? (
                  <ArrowUp className="inline ml-1 h-4 w-4 text-secondary" />
                ) : (
                  <ArrowDown className="inline ml-1 h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
