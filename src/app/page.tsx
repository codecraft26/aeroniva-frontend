'use client';

import { useState, useEffect } from 'react';
import { Upload, BarChart3, Map, Filter, AlertTriangle } from '@/components/icons';
import UploadForm from '@/components/UploadForm';
import Dashboard from '@/components/Dashboard';
import MapView from '@/components/MapView';
import TableView from '@/components/TableView';
import { KPIData, Violation } from '@/utils/types';
import { api } from '@/utils/api';

type ActiveTab = 'upload' | 'dashboard' | 'map' | 'table';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    droneId: '',
    date: '',
    type: ''
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpisResponse, violationsResponse] = await Promise.all([
        api.getKPIs(filters),
        api.getViolations(filters)
      ]);
      setKpiData(kpisResponse);
      setViolations(violationsResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'upload') {
      fetchData();
    }
  }, [activeTab, filters]);

  const handleUploadSuccess = () => {
    fetchData();
    setActiveTab('dashboard');
  };

  const tabs = [
    { id: 'upload' as ActiveTab, label: 'Upload Reports', icon: Upload },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'map' as ActiveTab, label: 'Map View', icon: Map },
    { id: 'table' as ActiveTab, label: 'Table View', icon: Filter }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-black">
                AI Analytics Dashboard
              </h1>
            </div>
            <div className="text-sm text-black">
              Drone Safety Monitoring System
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-black hover:text-black hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && activeTab !== 'upload' && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-black">Loading...</span>
          </div>
        )}

        {activeTab === 'upload' && (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        )}

        {activeTab === 'dashboard' && kpiData && (
          <Dashboard 
            kpiData={kpiData} 
            violations={violations}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {activeTab === 'map' && (
          <MapView 
            violations={violations}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {activeTab === 'table' && (
          <TableView 
            violations={violations}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
      </main>
    </div>
  );
}
