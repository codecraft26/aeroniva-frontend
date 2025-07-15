'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Violation, Filters, FilterOptions } from '@/utils/types';
import { api } from '@/utils/api';
import FilterPanel from './FilterPanel';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('./Map'), { ssr: false });

interface MapViewProps {
  violations: Violation[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const MapView: React.FC<MapViewProps> = ({ violations, filters, onFiltersChange }) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await api.getFilters();
        setFilterOptions(options);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Filters */}
      {filterOptions && (
        <FilterPanel
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={onFiltersChange}
        />
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Violation Locations ({violations.length} violations)
          </h3>
        </div>
        <div style={{ height: '600px' }}>
          <Map violations={violations} />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Fire Detected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Unauthorized Person</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>No PPE Kit</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Other Violations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
