import React, { useState, useRef } from 'react';
import { Card, CardContent } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { UploadCloud, FileImage, FileVideo, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { useIncidentStore } from '../store/incidentStore';
import { useLiveMonitoringStore } from '../store/liveMonitoringStore';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  type UploadResult = {
    detections?: Array<{ detection_type: 'fire' | 'smoke'; confidence: number; frame_number?: number | null }>;
    alert_ids?: string[];
    evidence_path?: string | null;
    file_name?: string;
    events?: Array<{
      detection_type: 'fire' | 'smoke';
      confidence: number;
      frame_number?: number | null;
      evidence_path?: string | null;
    }>;
  };

  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addRecentAlert = useDashboardStore(state => state.addRecentAlert);
  const incidents = useIncidentStore(state => state.incidents);
  const setIncidents = useIncidentStore(state => state.setIncidents);
  const upsertLiveAlert = useLiveMonitoringStore(state => state.upsertLiveAlert);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const isVideo = file.type.startsWith('video');
    const endpoint = isVideo ? '/api/v1/upload/video' : '/api/v1/upload/image';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Batch Analysis</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload images or videos for offline fire and smoke detection.</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              file ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp,video/mp4,video/avi"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                {file.type.startsWith('video') ? <FileVideo size={48} className="text-primary mb-4" /> : <FileImage size={48} className="text-primary mb-4" />}
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>Cancel</Button>
                  <Button variant="primary" onClick={handleUpload} isLoading={isUploading}>
                    Run Analysis
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud size={32} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Click or drag file to upload</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  Supports JPG, PNG, WEBP images (max 20MB) and MP4, AVI videos (max 100MB).
                </p>
                <Button variant="outline" className="mt-6">Select File</Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Analysis Failed</h4>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {result && (

            <div className="mt-8 space-y-6 animate-fade-in">
              <h3 className="text-xl font-semibold border-b border-gray-100 dark:border-gray-800 pb-2">Analysis Results</h3>
              
              {result.evidence_path || ((result.events?.length ?? 0) > 0 && result.events?.[0]?.evidence_path) ? (

                <div className="bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <img
                  src={`/evidence/${(result.evidence_path ?? result.events?.[0]?.evidence_path ?? '').split('/').pop()}`} 



                    alt="Analyzed Evidence" 
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(result.detections ?? result.events ?? []).map((det, i) => (


                  <div key={i} className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <Badge type={det.detection_type}>{det.detection_type}</Badge>
                      <p className="text-sm font-medium mt-2">Confidence: {(det.confidence * 100).toFixed(1)}%</p>

                      {det.frame_number && <p className="text-xs text-gray-500 mt-1">Frame: {det.frame_number}</p>}
                    </div>
                  </div>
                ))}
                
                {(result.detections?.length === 0 && (!result.events || result.events.length === 0)) && (

                  <div className="col-span-full p-6 text-center text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    No fire or smoke detected in this file.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
