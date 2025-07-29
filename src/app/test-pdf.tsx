"use client";
import React, { useState } from 'react';
import { PDFProcessor } from '@/utils/pdfProcessor';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setProcessing(true);
    setError('');
    setResult('');

    try {
      let extractedText = '';

      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        // Handle text files
        const reader = new FileReader();
        extractedText = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read text file'));
          reader.readAsText(selectedFile);
        });
      } else if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        // Handle PDF files using our robust processor
        extractedText = await PDFProcessor.extractTextFromFile(selectedFile);
      } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.endsWith('.docx')) {
        // Handle DOCX files
        const mammoth = await import('mammoth');
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        throw new Error('Unsupported file format. Please use TXT, PDF, or DOCX files.');
      }

      setResult(extractedText);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          PDF Processing Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Upload File for Testing</h2>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-4">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              disabled={processing}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {processing ? (
                <div>
                  <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-blue-400 mb-2">Processing file...</div>
                </div>
              ) : file ? (
                <div>
                  <div className="text-4xl mb-4">✅</div>
                  <div className="text-lg font-medium text-green-400 mb-2">File processed!</div>
                  <div className="text-sm text-gray-400 mb-2">{file.name}</div>
                  <div className="text-xs text-gray-500">Click to choose a different file</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">📄</div>
                  <div className="text-lg font-medium text-gray-300 mb-2">Choose file to test</div>
                  <div className="text-sm text-gray-500 mb-3">PDF, DOCX, or TXT</div>
                  <div className="flex justify-center gap-2 text-xs text-gray-600">
                    <span className="bg-gray-700 px-2 py-1 rounded">TXT</span>
                    <span className="bg-gray-700 px-2 py-1 rounded">PDF</span>
                    <span className="bg-gray-700 px-2 py-1 rounded">DOCX</span>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
              <h3 className="text-red-400 font-bold mb-2">Error:</h3>
              <p className="text-red-300 whitespace-pre-line">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
              <h3 className="text-green-400 font-bold mb-2">Extracted Text:</h3>
              <div className="bg-black/30 p-4 rounded border max-h-96 overflow-y-auto">
                <pre className="text-green-300 text-sm whitespace-pre-wrap">{result}</pre>
              </div>
              <div className="mt-2 text-sm text-green-400">
                ✅ Successfully extracted {result.length} characters
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">PDF Processing Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>PDF Worker: Configured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Text Extraction: Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Error Handling: Enhanced</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
