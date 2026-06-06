"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  File, 
  Share2, 
  Download, 
  Trash2, 
  CheckCircle2, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Plus
} from 'lucide-react';

interface LocalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  date: string;
  progress: number;
  status: 'uploading' | 'completed';
}

export default function Home() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const newFile: LocalFile = {
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      date: new Date().toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      progress: 0,
      status: 'uploading'
    };

    setFiles(prev => [newFile, ...prev]);

    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 30;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress: 100, status: 'completed' } : f
        ));
        showToast(`Đã tải lên: ${file.name}`);
      } else {
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress: currentProgress } : f
        ));
      }
    }, 400);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const deleteFile = (id: string) => {
    const fileToDelete = files.find(f => f.id === id);
    if (fileToDelete) {
      URL.revokeObjectURL(fileToDelete.url);
      setFiles(prev => prev.filter(f => f.id !== id));
      showToast("Đã xóa tệp tin");
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    showToast("Đã sao chép liên kết chia sẻ");
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-4 h-4 text-pink-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-900' : 'bg-white border-red-100 text-red-900'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chia sẻ tệp tin</h1>
            <p className="text-slate-500 mt-1">Tải lên và quản lý tệp tin của bạn một cách bảo mật.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm shadow-blue-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tải lên mới
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-4 space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all h-[320px] ${
                dragActive 
                ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
                : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                onChange={onFileChange}
                className="hidden" 
              />
              
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-base font-semibold text-slate-900">
                  {dragActive ? 'Thả tệp vào đây' : 'Kéo thả tệp tin'}
                </p>
                <p className="text-sm text-slate-500 px-4">
                  Hoặc nhấn để chọn tệp từ máy tính. Hỗ trợ mọi định dạng.
                </p>
              </div>

              {dragActive && (
                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl pointer-events-none" />
              )}
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-blue-900">Lưu trữ tạm thời</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Tệp tin của bạn được lưu trữ trong bộ nhớ trình duyệt và sẽ tự động biến mất khi bạn đóng tab.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Tệp tin gần đây</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                  {files.length} TỆP
                </span>
              </div>

              <div className="divide-y divide-slate-50 min-h-[400px]">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <File className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">Chưa có tệp tin nào được tải lên</p>
                    <p className="text-xs text-slate-400 mt-1">Các tệp bạn tải lên sẽ xuất hiện tại đây</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg border border-slate-100 bg-white flex items-center justify-center shrink-0 shadow-sm">
                          {getFileIcon(file.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">{file.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                              file.status === 'completed' ? 'text-emerald-600' : 'text-blue-600'
                            }`}>
                              {file.status === 'completed' ? 'Hoàn thành' : `Đang tải ${Math.round(file.progress)}%`}
                            </span>
                          </div>

                          {file.status === 'uploading' && (
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.status === 'completed' && (
                            <>
                              <a 
                                href={file.url} 
                                download={file.name}
                                className="p-2 hover:bg-white hover:text-blue-600 text-slate-400 rounded-lg transition-all border border-transparent hover:border-slate-100"
                                title="Tải về"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button 
                                onClick={() => copyLink(file.id)}
                                className="p-2 hover:bg-white hover:text-blue-600 text-slate-400 rounded-lg transition-all border border-transparent hover:border-slate-100"
                                title="Sao chép liên kết"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => deleteFile(file.id)}
                            className="p-2 hover:bg-white hover:text-red-600 text-slate-400 rounded-lg transition-all border border-transparent hover:border-slate-100"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-center">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          Phát triển bởi <span className="text-slate-900">Poke Engine</span> • 2026
        </p>
      </footer>
    </div>
  );
}