"use client";
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import mammoth from 'mammoth';

// Configure worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export default function DocumentViewerModal({ isOpen, onClose, fileUrl, fileType, fileName }: DocumentViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState(1.0);
  const [docxHtml, setDocxHtml] = useState<string>('');
  const [loadingDocx, setLoadingDocx] = useState(false);

  const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(fileUrl)}`;

  React.useEffect(() => {
    if (isOpen && fileType === 'docx') {
      setLoadingDocx(true);
      fetch(proxyUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then(result => {
          setDocxHtml(result.value);
          setLoadingDocx(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingDocx(false);
        });
    }
  }, [isOpen, fileUrl, fileType]);

  if (!isOpen) return null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8" onContextMenu={(e) => e.preventDefault()}>
      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h3 className="font-semibold text-gray-800 truncate pr-4">{fileName}</h3>
          <div className="flex items-center gap-4">
            {fileType === 'pdf' && (
              <div className="flex items-center gap-2">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 hover:bg-gray-100 rounded">
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1 hover:bg-gray-100 rounded">
                  <ZoomIn size={18} />
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 select-none">
          {fileType === 'pdf' ? (
            <div className="flex justify-center">
              <div className="shadow-lg">
                <Document
                  file={proxyUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}
                  error={<div className="p-8 text-red-500">Failed to load PDF.</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white"
                  />
                </Document>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 shadow-lg max-w-3xl w-full mx-auto rounded-lg min-h-full">
              {loadingDocx ? (
                <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
              ) : (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: docxHtml }} />
              )}
            </div>
          )}
        </div>

        {/* Footer Controls (PDF only) */}
        {fileType === 'pdf' && numPages > 0 && (
          <div className="flex items-center justify-center gap-6 p-4 border-t border-gray-200 shrink-0 bg-white">
            <button 
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-medium text-sm text-gray-700">
              Page {pageNumber} of {numPages}
            </span>
            <button 
              onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
