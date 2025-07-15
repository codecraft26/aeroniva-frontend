import React, { useRef, useState, useEffect } from 'react';
import { uploadReport } from '../utils/api';
import { Upload, CheckCircle, AlertCircle } from '@/components/icons';

interface UploadFormProps {
  onSuccess?: () => void;
  onUploadSuccess?: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Countdown effect for redirect
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      if (onSuccess) onSuccess();
      if (onUploadSuccess) onUploadSuccess();
    }
  }, [redirectCountdown, onSuccess, onUploadSuccess]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setRedirectCountdown(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/json') {
      setError('Only JSON files are allowed.');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadReport(file);
      setSuccess(`Report uploaded successfully! ${res.violationsCount} violations processed.`);
      
      // Start countdown for redirect
      setRedirectCountdown(3);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Upload AI Report</h2>
          <p className="text-black">
            Upload JSON files containing drone violation data for analysis
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Select JSON File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-black" />
                    <p className="mb-2 text-sm text-black">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-black">JSON files only</p>
                  </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {uploading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-blue-600">Uploading and processing...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">{success}</span>
              </div>
              {redirectCountdown !== null && (
                <div className="text-center">
                  <p className="text-green-700 text-sm mb-2">
                    Redirecting to dashboard in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                  <div className="w-32 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${((3 - redirectCountdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-black mb-2">Expected JSON Format:</h3>
          <pre className="text-xs text-black overflow-x-auto">
{`{
  "drone_id": "DRONE_ZONE_1",
  "date": "2025-07-10",
  "location": "Zone A",
  "violations": [
    {
      "id": "v1",
      "type": "Fire Detected",
      "timestamp": "10:32:14",
      "latitude": 23.74891,
      "longitude": 85.98523,
      "image_url": "https://via.placeholder.com/150"
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default UploadForm; 