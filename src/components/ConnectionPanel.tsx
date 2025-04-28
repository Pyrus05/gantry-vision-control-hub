
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

type ConnectionPanelProps = {
  isConnected: boolean;
  onConnectionChange: (status: boolean) => void;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ isConnected, onConnectionChange }) => {
  const [port, setPort] = useState('/dev/ttyUSB0');
  const [baudRate, setBaudRate] = useState('115200');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (isConnected) {
      // Disconnect logic
      setIsConnecting(true);
      setTimeout(() => {
        onConnectionChange(false);
        setIsConnecting(false);
        toast.success("Device disconnected");
      }, 500);
    } else {
      // Connect logic
      setIsConnecting(true);
      setTimeout(() => {
        onConnectionChange(true);
        setIsConnecting(false);
        toast.success("Connected to gantry controller");
      }, 1000);
    }
  };

  return (
    <Card className="border border-gantry-accent bg-gantry-highlight">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Serial Port</label>
            <Input 
              value={port} 
              onChange={(e) => setPort(e.target.value)} 
              placeholder="Serial port" 
              disabled={isConnected}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Baud Rate</label>
            <Select 
              value={baudRate} 
              onValueChange={setBaudRate}
              disabled={isConnected}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select baud rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9600">9600</SelectItem>
                <SelectItem value="19200">19200</SelectItem>
                <SelectItem value="38400">38400</SelectItem>
                <SelectItem value="57600">57600</SelectItem>
                <SelectItem value="115200">115200</SelectItem>
                <SelectItem value="250000">250000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleConnect} 
            className={`w-full ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isConnected ? 'Disconnecting...' : 'Connecting...'}
              </>
            ) : (
              <>{isConnected ? 'Disconnect' : 'Connect'}</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;
