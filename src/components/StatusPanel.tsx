
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusPanelProps = {
  isConnected: boolean;
  machineState: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

const StatusPanel: React.FC<StatusPanelProps> = ({ isConnected, machineState, position }) => {
  const [lastCommand, setLastCommand] = useState<string>("No commands sent");
  
  // In a real implementation, this would fetch status updates from the API
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      // Example of how we could poll for status updates
      interval = setInterval(() => {
        fetch('/api/status')
          .then(response => response.json())
          .then(data => {
            // This would update with real data in a full implementation
            console.log('Status update:', data);
            // setLastCommand(data.lastCommand);
          })
          .catch(err => {
            console.error('Error fetching status:', err);
          });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);
  
  // Listen for commands sent from other components
  useEffect(() => {
    const handleCommandSent = (event: CustomEvent) => {
      if (event.detail && event.detail.command) {
        setLastCommand(event.detail.command);
      }
    };
    
    // Using a custom event to communicate between components
    window.addEventListener('gantry:command-sent' as any, handleCommandSent as any);
    
    return () => {
      window.removeEventListener('gantry:command-sent' as any, handleCommandSent as any);
    };
  }, []);
  
  return (
    <Card className="border border-gantry-accent bg-gantry-highlight">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Machine State:</span>
            <span className="flex items-center">
              <span 
                className={`status-indicator ${
                  !isConnected ? 'status-disconnected' : 
                  machineState === 'Idle' ? 'status-connected' : 
                  'status-busy'
                }`}
              ></span>
              {!isConnected ? 'Disconnected' : machineState}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Position X:</span>
            <span className="font-mono">{isConnected ? position.x.toFixed(3) : '-.---'} mm</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Position Y:</span>
            <span className="font-mono">{isConnected ? position.y.toFixed(3) : '-.---'} mm</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Position Z:</span>
            <span className="font-mono">{isConnected ? position.z.toFixed(3) : '-.---'} mm</span>
          </div>
          
          <div className="pt-2 border-t border-gantry-accent/50">
            <div className="text-xs text-gantry-foreground/70">
              {isConnected ? (
                `Last command: ${lastCommand}`
              ) : (
                "No commands sent"
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPanel;
