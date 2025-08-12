import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUp,
  FileCode,
  X,
  CheckCircle,
  WarningCircle
} from "phosphor-react";
import React, { useState, useRef, useCallback } from 'react';

export interface UploadAreaProps {
  onFileSelect?: (files: File[]) => void;
  onFileContent?: (content: string, filename: string, language: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  allowMultiple?: boolean;
  showProgress?: boolean;
  className?: string;
  disabled?: boolean;
}
interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  content?: string;
  language?: string;
}
export default function UploadArea({
  onFileSelect,
  onFileContent,
  acceptedTypes = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs'],
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  allowMultiple = true,
  showProgress = true,
  className = "",
  disabled = false,
}: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Get file language based on extension
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell',
    };
    return languageMap[ext || ''] || 'text';
  };
  // Validate file
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxFileSize}MB limit` };
    }
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(extension)) {
      return { valid: false, error: `File type ${extension} not supported` };
    }
    return { valid: true };
  }, [acceptedTypes, maxFileSize]);
  // Process files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;
    const fileArray = Array.from(files);
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    setIsProcessing(true);
    const newFiles: UploadedFile[] = fileArray.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Process each file
    for (const uploadedFile of newFiles) {
      const validation = validateFile(uploadedFile.file);
      if (!validation.valid) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: validation.error }
            : f
        ));
        continue;
      }
      try {
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id ? { ...f, progress } : f
          ));
        }
        // Read file content
        const content = await readFileContent(uploadedFile.file);
        const language = getLanguageFromExtension(uploadedFile.file.name);
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'success', content, language }
            : f
        ));
        // Callback with file content
        onFileContent?.(content, uploadedFile.file.name, language);
      } catch {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: 'Failed to read file' }
            : f
        ));
      }
    }
    setIsProcessing(false);
    onFileSelect?.(fileArray);
  }, [disabled, uploadedFiles.length, maxFiles, onFileSelect, onFileContent, validateFile]);
  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };
  // Remove file
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };
  // Open file dialog
  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative min-h-[200px] p-6 rounded-lg border-2 border-dashed transition-all duration-fast
          flex flex-col items-center justify-center text-center cursor-pointer
          ${disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50' 
            : isDragOver
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
      >
        {/* Upload Icon */}
        <motion.div
          className={`
            mb-4 p-3 rounded-full
            ${isDragOver 
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            }
          `}
          animate={isDragOver ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <CloudArrowUp size={32} weight="bold" />
        </motion.div>
        {/* Upload Text */}
        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${
            isDragOver 
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {isDragOver ? 'Drop files here' : 'Upload code files'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supports: {acceptedTypes.join(', ')} • Max {maxFileSize}MB • Up to {maxFiles} files
          </p>
        </div>
        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Processing files...
              </span>
            </div>
          </motion.div>
        )}
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          aria-label="Upload code files"
        />
      </motion.div>
      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            {uploadedFiles.map((uploadedFile) => (
              <motion.div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* File Icon */}
                <div className={`
                  flex-shrink-0 p-2 rounded
                  ${uploadedFile.status === 'success' 
                    ? 'bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400'
                    : uploadedFile.status === 'error'
                      ? 'bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}>
                  {uploadedFile.status === 'success' ? (
                    <CheckCircle size={20} weight="bold" />
                  ) : uploadedFile.status === 'error' ? (
                    <WarningCircle size={20} weight="bold" />
                  ) : (
                    <FileCode size={20} />
                  )}
                </div>
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {(uploadedFile.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  {uploadedFile.status === 'uploading' && showProgress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <motion.div
                          className="bg-primary-600 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadedFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <p className="text-xs text-error-600 dark:text-error-400 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                  {uploadedFile.status === 'success' && uploadedFile.language && (
                    <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                      {uploadedFile.language} • Ready for analysis
                    </p>
                  )}
                </div>
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadedFile.id);
                  }}
                  aria-label={`Remove ${uploadedFile.file.name}`}
                  title={`Remove ${uploadedFile.file.name}`}
                  className="
                    flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100
                    dark:hover:text-gray-300 dark:hover:bg-gray-700
                    transition-colors duration-fast
                  "
                >
                  <X size={16} weight="bold" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
