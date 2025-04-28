
import React from 'react';
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
                "Last command: G1 X0.00 Y0.00 F500"
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
