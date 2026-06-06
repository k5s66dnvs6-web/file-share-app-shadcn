"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  File, 
  Share2, 
  Trash2, 
  Download, 
  CheckCircle2, 
  FileText, 
  X, 
  Clock, 
  HardDrive,
  Copy,
  Info
} from 'lucide-react';

interface StoredFile {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  data: string; // Base64
}

export default function Home() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('file-share-data');
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load files", e);
      }
    }

    // Check for shared file in URL hash
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#file=')) {
        const fileId = hash.replace('#file=', '');
        const savedFiles = JSON.parse(localStorage.getItem('file-share-data') || '[]');
        const sharedFile = savedFiles.find((f: StoredFile) => f.id === fileId);
        if (sharedFile) {
          showToast(`Viewing shared file: ${sharedFile.name}`, 'info');
        } else {
          showToast("Shared file not found in your local storage.", 'error');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save to localStorage whenever files change
  useEffect(() => {
    localStorage.setItem('file-share-data', JSON.stringify(files));
  }, [files]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let uploadedFiles: File[] = [];
    
    if ('files' in e.target && (e.target as HTMLInputElement).files) {
      uploadedFiles = Array.from((e.target as HTMLInputElement).files || []);
    } else if ('dataTransfer' in e && (e as React.DragEvent).dataTransfer.files) {
      e.preventDefault();
      uploadedFiles = Array.from((e as React.DragEvent).dataTransfer.files);
    }

    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const newStoredFiles: StoredFile[] = [];
      for (const file of uploadedFiles) {
        const base64 = await fileToBase64(file);
        newStoredFiles.push({
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: formatSize(file.size),
          type: file.type,
          date: new Date().toLocaleDateString('vi-VN'),
          data: base64
        });
      }

      setFiles(prev => [...newStoredFiles, ...prev]);
      setUploadProgress(100);
      showToast(`Đã tải lên ${uploadedFiles.length} tệp thành công!`);
    } catch (err) {
      showToast("Lỗi khi tải tệp lên. Vui lòng thử lại.", 'error');
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const downloadFile = (file: StoredFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đang tải xuống: ${file.name}`);
  };

  const copyShareLink = (fileId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#file=${fileId}`;
    navigator.clipboard.writeText(url);
    showToast("Đã sao chép liên kết vào bộ nhớ tạm!");
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    showToast("Đã xóa tệp.", 'info');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-50/50 blur-[120px]" />
      </div>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="flex flex-col items-center mb-16 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm transition-transform hover:scale-105 duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Local Persistence Active</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
            Lưu Trữ Tệp Tin
          </h1>
          <p className="text-lg text-slate-500 max-w-lg">
            Tải lên, quản lý và chia sẻ tệp tin của bạn. <br/>
            <span className="text-sm italic font-medium text-amber-600 flex items-center justify-center mt-2">
              <Info className="w-3 h-3 mr-1" /> Lưu ý: Tệp được lưu trực tiếp trong trình duyệt của bạn.
            </span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Upload Section */}
          <div className="lg:col-span-4 space-y-6">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative bg-white border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
                isUploading 
                ? 'border-indigo-400 bg-indigo-50/30' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 hover:shadow-2xl hover:shadow-indigo-100/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                multiple
              />
              
              <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${
                isUploading ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:rotate-6'
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              
              <p className="text-base font-semibold text-slate-800">
                {isUploading ? 'Đang tải lên...' : 'Chọn hoặc thả tệp'}
              </p>
              <p className="text-xs text-slate-400 mt-2">Dung lượng tối đa 5MB/tệp</p>
              
              {isUploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 rounded-b-3xl overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Storage Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold flex items-center text-slate-800 mb-4">
                <HardDrive className="w-4 h-4 mr-2" /> Trình trạng lưu trữ
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Browser Storage</span>
                  <span className="text-indigo-600">{files.length} tệp</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className="h-full bg-indigo-400"
                    style={{ width: `${Math.min(files.length * 10, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Vì đây là ứng dụng tĩnh, dữ liệu của bạn được lưu trong <b>LocalStorage</b>. 
                  Nếu bạn xóa lịch sử duyệt web, các tệp này sẽ biến mất.
                </p>
              </div>
            </div>
          </div>

          {/* Files List Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200/60">
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Tệp tin gần đây</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Manage your local drive</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {files.length} Total
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {files.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <FileText className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-sm font-medium">Danh sách tệp trống</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="group p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-indigo-50/30 transition-colors">
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <div className="relative">
                          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/60 group-hover:border-indigo-200 transition-colors">
                            <File className="w-6 h-6 text-indigo-500" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-xs">{file.name}</h3>
                          <p className="text-[11px] font-medium text-slate-400 flex items-center">
                            {file.size} <span className="mx-1.5 text-slate-300">•</span> {file.date}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => downloadFile(file)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all active:scale-95 group/btn"
                          title="Tải về"
                        >
                          <Download className="w-4 h-4" />
                          <span className="ml-2 text-xs font-bold sm:hidden">Tải về</span>
                        </button>
                        <button 
                          onClick={() => copyShareLink(file.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all active:scale-95 group/btn"
                          title="Sao chép liên kết"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="ml-2 text-xs font-bold sm:hidden">Chia sẻ</span>
                        </button>
                        <button 
                          onClick={() => deleteFile(file.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all active:scale-95 group/btn"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-2 text-xs font-bold sm:hidden">Xóa</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 mb-12 text-center opacity-30">
        <div className="flex items-center justify-center space-x-2 grayscale">
          <HardDrive className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Next.js Client-Side Virtual Drive</span>
        </div>
      </footer>

      {/* Modern Custom Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-500">
          <div className={`relative px-6 py-4 rounded-3xl shadow-2xl flex items-center space-x-4 border ${
            toast.type === 'error' ? 'bg-white border-rose-100 text-rose-600' : 
            toast.type === 'info' ? 'bg-white border-indigo-100 text-indigo-600' :
            'bg-indigo-600 border-indigo-400 text-white'
          }`}>
            {toast.type === 'error' ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <p className="text-sm font-bold">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}