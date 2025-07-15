'use client';

import React from 'react';
import { MapPin } from '@/components/icons';
import { Violation } from '@/utils/types';

interface MapProps {
  violations: Violation[];
}

const Map: React.FC<MapProps> = ({ violations }) => {
  // Get violation type color
  const getMarkerColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire detected':
        return '#ef4444'; // red
      case 'unauthorized person':
        return '#f97316'; // orange
      case 'no ppe kit':
        return '#eab308'; // yellow
      default:
        return '#3b82f6'; // blue
    }
  };

  // Group violations by type for statistics
  const violationStats = violations.reduce((acc, violation) => {
    acc[violation.type] = (acc[violation.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate a unique component ID to avoid key conflicts
  const componentId = React.useId();

  return (
    <div className="w-full h-full bg-gray-100 relative overflow-hidden">
      {/* Map placeholder background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`${componentId}-h-${i}`} className="absolute border-t border-gray-300" style={{ top: `${i * 5}%`, left: 0, right: 0 }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`${componentId}-v-${i}`} className="absolute border-l border-gray-300" style={{ left: `${i * 5}%`, top: 0, bottom: 0 }} />
          ))}
        </div>

        {/* Boundary area */}
        <div 
          className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 rounded-lg"
          style={{
            top: '20%',
            left: '25%',
            width: '50%',
            height: '60%'
          }}
        >
          <div className="absolute top-2 left-2 text-xs text-blue-700 font-medium">Safety Zone</div>
        </div>

        {/* Violation markers */}
        {violations.map((violation, index) => {
          // Convert lat/lng to relative positions (simplified mapping)
          const latRange = [23.745, 23.755];
          const lngRange = [85.980, 85.990];
          
          const lat = Number(violation.latitude);
          const lng = Number(violation.longitude);
          
          const x = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
          const y = ((latRange[1] - lat) / (latRange[1] - latRange[0])) * 100;
          
          const color = getMarkerColor(violation.type);
          
          return (
            <div
              key={`map-violation-${violation.violation_id}-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${Math.max(5, Math.min(95, x))}%`,
                top: `${Math.max(5, Math.min(95, y))}%`
              }}
              title={`${violation.type} - ${violation.violation_id}`}
            >
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{ backgroundColor: color }}
              ></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                <div className="font-semibold text-gray-900 mb-1">{violation.type}</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>ID:</strong> {violation.violation_id}</div>
                  <div><strong>Drone:</strong> {violation.drone_id}</div>
                  <div><strong>Time:</strong> {violation.date} {violation.timestamp}</div>
                  <div><strong>Location:</strong> {violation.location}</div>
                  <div><strong>Coords:</strong> {Number(violation.latitude).toFixed(6)}, {Number(violation.longitude).toFixed(6)}</div>
                </div>
                <div className="mt-2">
                  <img 
                    src={violation.image_url} 
                    alt="Evidence" 
                    className="w-full h-16 object-cover rounded border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                {/* Arrow pointing down */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map info overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3 max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-2">Live Map View</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>📍 {violations.length} violations detected</div>
          <div>🗺️ Safety zone monitoring active</div>
          <div>📊 Real-time violation tracking</div>
        </div>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Violation Types</h4>
        <div className="space-y-1 text-xs">
          {Object.entries(violationStats).map(([type, count]) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getMarkerColor(type) }}
              ></div>
              <span>{type}: {count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls placeholder */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm">
        <button className="block p-2 hover:bg-gray-50 border-b">+</button>
        <button className="block p-2 hover:bg-gray-50">−</button>
      </div>
    </div>
  );
};

export default Map;
