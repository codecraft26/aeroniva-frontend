'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, BarChart3, Map, Filter, AlertTriangle, LogOut, User } from '@/components/icons';
import UploadForm from '@/components/UploadForm';
import Dashboard from '@/components/Dashboard';
import MapView from '@/components/MapView';
import TableView from '@/components/TableView';
import { useAuth } from '@/contexts/AuthContext';
import { KPIData, Violation } from '@/utils/types';
import { api } from '@/utils/api';

type ActiveTab = 'upload' | 'dashboard' | 'map' | 'table';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, user, logout } = useAuth();
  
  // Get initial tab from URL params, default to 'upload'
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'upload';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    droneId: '',
    date: '',
    type: ''
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Update URL when tab changes
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab, isAuthenticated, loading]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [kpisResponse, violationsResponse] = await Promise.all([
        api.getKPIs(filters),
        api.getViolations(filters)
      ]);
      setKpiData(kpisResponse);
      setViolations(violationsResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setDataLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && activeTab !== 'upload') {
      fetchData();
    }
  }, [activeTab, fetchData, isAuthenticated]);

  const handleUploadSuccess = () => {
    fetchData();
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'upload' as ActiveTab, label: 'Upload Reports', icon: Upload },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'map' as ActiveTab, label: 'Map View', icon: Map },
    { id: 'table' as ActiveTab, label: 'Table View', icon: Filter }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected
  }

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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-black">
                Drone Safety Monitoring System
              </div>
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.username}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
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
                  onClick={() => handleTabChange(tab.id)}
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
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              Error: {error}
            </div>
          </div>
        )}

        {dataLoading && activeTab !== 'upload' && (
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

function DashboardPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-lg text-gray-700">Loading Dashboard...</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
