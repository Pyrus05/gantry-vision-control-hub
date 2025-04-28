
import React, { useState, useEffect } from 'react';
import CameraFeed from '@/components/CameraFeed';
import GantryControl from '@/components/GantryControl';
import ConnectionPanel from '@/components/ConnectionPanel';
import StatusPanel from '@/components/StatusPanel';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [machineState, setMachineState] = useState('Idle');
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  // Set up event listener for command updates
  const dispatchCommandEvent = (command: string) => {
    const event = new CustomEvent('gantry:command-sent', {
      detail: { command }
    });
    window.dispatchEvent(event);
  };

  // Make GantryControl component aware of this function
  useEffect(() => {
    // Expose the dispatchCommandEvent function globally
    (window as any).dispatchGantryCommand = dispatchCommandEvent;
  }, []);

  // Update document title
  useEffect(() => {
    document.title = "Gantry Vision Control Hub";
  }, []);

  // Add connection detection for Raspberry Pi
  useEffect(() => {
    if (isConnected) {
      // Poll for status updates
      const interval = setInterval(() => {
        // In a real implementation, this would fetch the status from the API
        fetch('/api/status')
          .then(response => response.json())
          .then(data => {
            setMachineState(data.state || 'Idle');
            setPosition(data.position || { x: 0, y: 0, z: 0 });
          })
          .catch(err => {
            console.error('Error fetching status:', err);
          });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gantry">
      <header className="bg-gantry-highlight border-b border-gantry-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gantry-foreground">
              Gantry Vision Control Hub
            </h1>
            <div className="flex items-center">
              <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main camera feed - takes up 2/3 of the screen on large displays */}
          <div className="lg:col-span-2 space-y-6">
            <CameraFeed isConnected={isConnected} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConnectionPanel 
                isConnected={isConnected} 
                onConnectionChange={setIsConnected} 
              />
              <StatusPanel 
                isConnected={isConnected} 
                machineState={machineState} 
                position={position} 
              />
            </div>
          </div>
          
          {/* Control panel - takes up 1/3 of the screen */}
          <div>
            <GantryControl isConnected={isConnected} />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
