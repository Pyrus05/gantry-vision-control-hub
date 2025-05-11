
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';

type GantryControlProps = {
  isConnected: boolean;
}

const GantryControl: React.FC<GantryControlProps> = ({ isConnected }) => {
  const [stepSize, setStepSize] = useState(1);
  const [feedRate, setFeedRate] = useState(500);
  const [lastResponse, setLastResponse] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleMove = (direction: string) => {
    if (!isConnected) {
      toast.error("Gantry not connected");
      return;
    }
    
    let command = "";
    let endpoint = "/api/send_gcode";
    
    switch (direction) {
      case "x+":
        command = `G1 X${stepSize} F${feedRate}`;
        break;
      case "x-":
        command = `G1 X-${stepSize} F${feedRate}`;
        break;
      case "y+":
        command = `G1 Y${stepSize} F${feedRate}`;
        break;
      case "y-":
        command = `G1 Y-${stepSize} F${feedRate}`;
        break;
      case "z+":
        command = `G1 Z${stepSize} F${feedRate}`;
        break;
      case "z-":
        command = `G1 Z-${stepSize} F${feedRate}`;
        break;
      case "home":
        command = "G28";
        break;
      case "align":
        endpoint = "/api/run_alignment";
        command = "align";
        break;
      case "test":
        // Test command to verify serial connection
        command = "M115"; // Get firmware info
        break;
      default:
        return;
    }
    
    // Show sending notification
    toast.info(`Sending: ${command}`);
    console.log(`Sending command: ${command} to endpoint: ${endpoint}`);
    
    // Send command to the Python script via API
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Network response was not ok: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        const responseText = data.response || 'No response from controller';
        setLastResponse(responseText);
        setDebugInfo(JSON.stringify(data));
        toast.success(`Command sent: ${command}`);
        console.log('Command response:', data);
      })
      .catch(error => {
        setDebugInfo(`Error: ${error.message}`);
        toast.error(`Error sending command: ${error.message}`);
        console.error('Error sending command:', error);
      });
  };

  return (
    <Card className="border border-gantry-accent bg-gantry-highlight">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Gantry Control</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls section */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <div className="font-medium mb-2 text-sm">X/Y Control</div>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <Button 
                  onClick={() => handleMove("y+")} 
                  disabled={!isConnected}
                  variant="secondary" 
                  className="aspect-square p-0"
                >
                  ↑
                </Button>
                <div></div>
                
                <Button 
                  onClick={() => handleMove("x-")} 
                  disabled={!isConnected}
                  variant="secondary" 
                  className="aspect-square p-0"
                >
                  ←
                </Button>
                <Button 
                  onClick={() => handleMove("home")} 
                  disabled={!isConnected}
                  variant="outline" 
                  className="aspect-square p-0 text-xs"
                >
                  HOME
                </Button>
                <Button 
                  onClick={() => handleMove("x+")} 
                  disabled={!isConnected}
                  variant="secondary" 
                  className="aspect-square p-0"
                >
                  →
                </Button>
                
                <div></div>
                <Button 
                  onClick={() => handleMove("y-")} 
                  disabled={!isConnected}
                  variant="secondary" 
                  className="aspect-square p-0"
                >
                  ↓
                </Button>
                <div></div>
              </div>
            </div>

            <div className="col-span-3">
              <div className="font-medium mb-2 text-sm">Z Control</div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleMove("z+")} 
                  disabled={!isConnected}
                  variant="secondary"
                >
                  Z ↑
                </Button>
                <Button 
                  onClick={() => handleMove("z-")} 
                  disabled={!isConnected}
                  variant="secondary"
                >
                  Z ↓
                </Button>
              </div>
            </div>

            <div className="col-span-3">
              <Button 
                onClick={() => handleMove("test")} 
                disabled={!isConnected}
                className="w-full bg-yellow-600 hover:bg-yellow-700 mb-2"
              >
                Test Connection
              </Button>
              <Button 
                onClick={() => handleMove("align")} 
                disabled={!isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Run Auto-Alignment
              </Button>
            </div>
          </div>

          {/* Debug section */}
          {lastResponse && (
            <div className="pt-2 border-t border-gantry-accent/50 text-xs">
              <div className="font-medium mb-1">Last Response:</div>
              <div className="bg-black/20 p-2 rounded overflow-x-auto">
                <pre>{lastResponse}</pre>
              </div>
            </div>
          )}

          {/* Settings section */}
          <div className="space-y-4 pt-2 border-t border-gantry-accent/50">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Movement Step (mm): {stepSize} mm</label>
              </div>
              <Slider
                value={[stepSize]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={(value) => setStepSize(value[0])}
                disabled={!isConnected}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>0.1</span>
                <span>10</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Feed Rate: {feedRate} mm/min</label>
              </div>
              <Slider
                value={[feedRate]}
                min={100}
                max={3000}
                step={100}
                onValueChange={(value) => setFeedRate(value[0])}
                disabled={!isConnected}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>100</span>
                <span>3000</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GantryControl;
