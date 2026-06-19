import React, { useState, useRef } from 'react';
import { Card, CardContent } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { UploadCloud, FileImage, FileVideo, CheckCircle2, AlertTriangle, Loader2, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400 tracking-tight">Batch Analysis</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Upload visual evidence for deep neural network scanning.</p>
        </motion.div>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32"></div>

        <CardContent className="p-8 relative z-10">
          <motion.div 
            className={`border-2 border-dashed rounded-3xl p-12 transition-all duration-300 relative overflow-hidden group ${
              isDragging 
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 scale-[1.02]' 
                : 'border-gray-300 dark:border-gray-700 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,video/mp4,video/avi"
            />
            
            {file ? (
              <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shadow-sm">
                    {file.type.startsWith('video') ? <FileVideo size={28} /> : <FileImage size={28} />}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-bold text-lg truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => { setFile(null); setResult(null); }} className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    Change
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-xl px-6 shadow-md transition-all hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <><Loader2 size={18} className="animate-spin" /> Scanning...</>
                    ) : (
                      <><UploadCloud size={18} /> Run Analysis</>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center cursor-pointer relative z-10" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <UploadCloud size={36} className="text-rose-500 dark:text-rose-400 drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Drag & Drop visual evidence</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto text-center font-medium">
                  Support for high-res <span className="text-rose-500 font-semibold">JPG, PNG, WEBP</span> or <span className="text-rose-500 font-semibold">MP4, AVI</span> video feeds.
                </p>
                <Button variant="outline" className="mt-8 rounded-xl px-8 border-gray-300 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400">
                  Browse Files
                </Button>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400"
              >
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Analysis Terminated</h4>
                  <p className="text-sm mt-1 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {isUploading && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-8 flex flex-col items-center justify-center py-10"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-rose-200 dark:border-rose-900/50 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity size={32} className="text-rose-500 animate-pulse" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Neural Network Active</h4>
                <p className="text-sm text-gray-500 font-medium">Extracting frames and identifying thermal signatures...</p>
              </motion.div>
            )}

            {result && !isUploading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-10 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-rose-500" size={20} /> Analysis Results
                  </h3>
                </div>
                
                {result.evidence_path || ((result.events?.length ?? 0) > 0 && result.events?.[0]?.evidence_path) ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 dark:bg-[#0a0a0f] rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800 p-2"
                  >
                    <img
                      src={`/evidence/${(result.evidence_path ?? result.events?.[0]?.evidence_path ?? '').split('/').pop()}`} 
                      alt="Analyzed Evidence" 
                      className="w-full h-auto object-contain max-h-[600px] rounded-xl"
                    />
                  </motion.div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(result.detections ?? result.events ?? []).map((det, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                      className="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-slate-950 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${det.detection_type === 'fire' ? 'bg-rose-500' : 'bg-orange-500'}`}></div>
                      <CheckCircle2 size={24} className="text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <Badge type={det.detection_type} className="mb-2 shadow-sm">{det.detection_type}</Badge>
                        <div className="flex items-end justify-between mt-1">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Confidence</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{(det.confidence * 100).toFixed(1)}%</p>
                          </div>
                          {det.frame_number && <Badge type="default" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-[10px]">FRM: {det.frame_number}</Badge>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {(result.detections?.length === 0 && (!result.events || result.events.length === 0)) && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="col-span-full p-10 text-center text-gray-500 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-emerald-50 mb-1">System All Clear</h4>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">No thermal or particulate anomalies detected.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
