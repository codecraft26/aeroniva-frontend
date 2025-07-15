'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, ExternalLink } from '@/components/icons';
import { Violation, Filters, FilterOptions } from '@/utils/types';
import { api } from '@/utils/api';
import FilterPanel from './FilterPanel';

interface TableViewProps {
  violations: Violation[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const TableView: React.FC<TableViewProps> = ({ violations, filters, onFiltersChange }) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Violation>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  // Filter violations based on search term
  const filteredViolations = violations.filter((violation) =>
    Object.values(violation).some((value) =>
      value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort violations
  const sortedViolations = [...filteredViolations].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortDirection === 'asc' ? -1 : 1;
    if (!bValue) return sortDirection === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Violation) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Violation ID',
      'Type',
      'Drone ID',
      'Date',
      'Time',
      'Location',
      'Latitude',
      'Longitude',
      'Image URL'
    ];

    const csvContent = [
      headers.join(','),
      ...sortedViolations.map(violation =>
        [
          violation.violation_id,
          violation.type,
          violation.drone_id,
          violation.date,
          violation.timestamp,
          violation.location,
          Number(violation.latitude).toFixed(6),
          Number(violation.longitude).toFixed(6),
          violation.image_url
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `violations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getViolationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire detected':
        return 'bg-red-100 text-red-800';
      case 'unauthorized person':
        return 'bg-orange-100 text-orange-800';
      case 'no ppe kit':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const SortIcon = ({ field }: { field: keyof Violation }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

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

      {/* Search and Export */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search violations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Violations ({sortedViolations.length} total)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('violation_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <SortIcon field="violation_id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    <SortIcon field="type" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('drone_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Drone</span>
                    <SortIcon field="drone_id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date/Time</span>
                    <SortIcon field="date" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Location</span>
                    <SortIcon field="location" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedViolations.map((violation, index) => (
                <tr key={`table-violation-${violation.violation_id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {violation.violation_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getViolationTypeColor(violation.type)}`}>
                      {violation.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {violation.drone_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{violation.date}</div>
                    <div className="text-xs text-gray-400">{violation.timestamp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {violation.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{Number(violation.latitude).toFixed(6)}</div>
                    <div>{Number(violation.longitude).toFixed(6)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={violation.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedViolations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No violations found</div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableView;
