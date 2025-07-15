// Simple chart components as placeholders for demo
import React from 'react';

interface ChartData {
  name?: string;
  count?: number;
  type?: string;
  drone_id?: string;
  location?: string;
  date?: string;
  [key: string]: any;
}

interface ChartProps {
  data?: ChartData[];
  width?: string | number;
  height?: string | number;
  children?: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ChartProps> = ({ children, width = "100%", height = 300 }) => (
  <div style={{ width, height, position: 'relative' }}>
    {children}
  </div>
);

export const PieChart: React.FC<ChartProps> = ({ children }) => (
  <div className="flex items-center justify-center h-full">
    {children}
  </div>
);

interface PieProps {
  data: ChartData[];
  dataKey: string;
  cx?: string;
  cy?: string;
  outerRadius?: number;
  fill?: string;
  label?: any;
  labelLine?: boolean;
  children?: React.ReactNode;
}

export const Pie: React.FC<PieProps> = ({ data, dataKey }) => {
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">{total}</div>
        <div className="text-sm text-gray-500">Total Violations</div>
      </div>
      <div className="space-y-2 w-full max-w-xs">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item[dataKey] || 0) / total * 100).toFixed(1) : 0;
          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span>{item.type || item.name}</span>
              </div>
              <span className="font-medium">{item[dataKey]} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Cell: React.FC<{ fill: string }> = () => null;

export const BarChart: React.FC<ChartProps> = ({ data = [], children }) => (
  <div className="w-full h-full">
    {children}
    <div className="space-y-1 mt-4">
      {data.map((item, index) => {
        const maxValue = Math.max(...data.map(d => d.count || 0));
        const width = maxValue > 0 ? (item.count || 0) / maxValue * 100 : 0;
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.drone_id || item.name}</span>
              <span className="font-medium">{item.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${width}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const LineChart: React.FC<ChartProps> = ({ data = [], children }) => (
  <div className="w-full h-full">
    {children}
    <div className="space-y-2 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex justify-between text-sm border-b pb-1">
          <span className="text-gray-600">{item.date}</span>
          <span className="font-medium">{item.count} violations</span>
        </div>
      ))}
    </div>
  </div>
);

export const XAxis: React.FC<{ dataKey: string }> = () => null;
export const YAxis: React.FC = () => null;
export const CartesianGrid: React.FC<{ strokeDasharray?: string }> = () => null;
export const Tooltip: React.FC = () => null;
export const Legend: React.FC = () => null;
export const Bar: React.FC<{ dataKey: string; fill: string }> = () => null;
export const Line: React.FC<{ type?: string; dataKey: string; stroke: string; strokeWidth?: number }> = () => null;
