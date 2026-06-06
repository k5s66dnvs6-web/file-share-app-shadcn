"use client";

import React, { useState } from 'react';
import { Upload, File, Share2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setFiles([{ name: 'presentation.pdf', size: '2.4 MB', date: new Date().toLocaleDateString() }, ...files]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-semibold text-slate-900">File Share</h1>
          <p className="text-sm text-slate-500">Upload and share your files instantly</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div 
            onClick={handleUpload}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isUploading ? 'bg-slate-50 border-blue-400' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
          >
            <Upload className={`w-10 h-10 mb-3 ${isUploading ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-700">{isUploading ? 'Uploading...' : 'Click to upload files'}</p>
            <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-slate-900 px-1">Recent Files</h2>
            {files.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No files uploaded yet</p>
            ) : (
              files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <File className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> All systems online
          </span>
          <button className="text-xs font-medium text-blue-600 hover:underline">View Settings</button>
        </div>
      </div>
      <p className="mt-8 text-xs text-slate-400">Built with shadcn/ui and Next.js</p>
    </div>
  );
}