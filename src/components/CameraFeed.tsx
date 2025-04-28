
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CameraFeedProps = {
  isConnected: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ isConnected }) => {
  return (
    <Card className="border border-gantry-accent bg-gantry-highlight">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div>
            Camera Feed
            {isConnected && (
              <span className="ml-2 text-xs bg-gantry-success text-white px-2 py-0.5 rounded">LIVE</span>
            )}
          </div>
          <div className="flex items-center text-sm">
            <span className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden rounded-b-lg">
        {isConnected ? (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {/* In a real implementation, this would be replaced with a WebSocket-based video stream */}
            <div className="h-full w-full bg-gantry flex items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-gantry-foreground/50">
                  <svg className="inline-block w-12 h-12 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gantry-foreground">Camera feed would appear here</p>
                <p className="text-xs text-gantry-foreground/70 mt-1">
                  (Requires WebSocket connection to Pi camera stream)
                </p>
              </div>
            </div>
            {/* Crosshair overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Horizontal line */}
                <div className="absolute w-16 h-px bg-green-500 left-1/2 -translate-x-1/2"></div>
                {/* Vertical line */}
                <div className="absolute h-16 w-px bg-green-500 top-1/2 -translate-y-1/2"></div>
                {/* Center circle */}
                <div className="h-5 w-5 rounded-full border-2 border-green-500 -mt-2.5 -ml-2.5"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gantry flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gantry-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-gantry-foreground/70">Camera not connected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraFeed;
