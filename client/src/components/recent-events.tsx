import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Event } from "@shared/schema";

interface RecentEventsProps {
  events?: Event[];
  networkId: number;
}

export default function RecentEvents({ events }: RecentEventsProps) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-secondary';
      case 'warning':
        return 'bg-accent';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  const formatTimeAgo = (timestamp?: Date) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Events & Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {events?.map((event) => (
            <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 ${getEventColor(event.type)} rounded-full mt-2`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <p>No recent events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
