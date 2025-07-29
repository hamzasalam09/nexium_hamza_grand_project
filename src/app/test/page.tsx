"use client";
import React, { useState } from 'react';
import { PDFProcessor } from '@/utils/pdfProcessor';

export default function PDFTestPage() {
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
      console.log('Starting file processing...', selectedFile.name, selectedFile.type);
      
      let extractedText = '';

      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        // Handle text files
        const reader = new FileReader();
        extractedText = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read text file'));
          reader.readAsText(selectedFile);
        });
        console.log('Text file processed successfully');
      } else if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        // Handle PDF files using our robust processor
        console.log('Processing PDF with enhanced processor...');
        extractedText = await PDFProcessor.extractTextFromFile(selectedFile);
        console.log('PDF processed successfully');
      } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.endsWith('.docx')) {
        // Handle DOCX files
        console.log('Processing DOCX file...');
        const mammoth = await import('mammoth');
        const arrayBuffer = await selectedFile.arrayBuffer();
        const docResult = await mammoth.extractRawText({ arrayBuffer });
        extractedText = docResult.value;
        console.log('DOCX file processed successfully');
      } else {
        throw new Error('Unsupported file format. Please use TXT, PDF, or DOCX files.');
      }

      if (!extractedText.trim()) {
        throw new Error('No text content found in the file.');
      }

      setResult(extractedText);
      console.log(`File processing completed successfully. Extracted ${extractedText.length} characters.`);
    } catch (err) {
      console.error('File processing error:', err);
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            PDF Processing Test
          </h1>
          <p className="text-gray-400">
            Test the enhanced PDF processing with robust error handling
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">File Upload Test</h2>
          
          <div className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
            processing ? 'border-yellow-400 bg-yellow-400/5' : 
            file ? 'border-green-400 bg-green-400/5' : 
            'border-gray-600 hover:border-cyan-400'
          }`}>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileUpload(selectedFile);
                }
              }}
              disabled={processing}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {processing ? (
                <div>
                  <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <div className="text-lg font-medium text-yellow-400 mb-2">Processing file...</div>
                  <div className="text-sm text-gray-400">Please wait while we extract text</div>
                </div>
              ) : file ? (
                <div>
                  <div className="text-4xl mb-4">✅</div>
                  <div className="text-lg font-medium text-green-400 mb-2">File processed successfully!</div>
                  <div className="text-sm text-gray-400 mb-2">{file.name}</div>
                  <div className="text-xs text-gray-500">Click to choose a different file</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">📄</div>
                  <div className="text-lg font-medium text-gray-300 mb-2">Choose file to test PDF processing</div>
                  <div className="text-sm text-gray-500 mb-3">Supports PDF, DOCX, and TXT formats</div>
                  <div className="flex justify-center gap-2 text-xs text-gray-600">
                    <span className="bg-gray-700 px-2 py-1 rounded">TXT</span>
                    <span className="bg-red-700 px-2 py-1 rounded">PDF</span>
                    <span className="bg-blue-700 px-2 py-1 rounded">DOCX</span>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
              <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                ❌ Processing Error
              </h3>
              <p className="text-red-300 whitespace-pre-line text-sm leading-relaxed">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
              <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                ✅ Text Extracted Successfully
              </h3>
              <div className="bg-black/30 p-4 rounded border max-h-96 overflow-y-auto mb-3">
                <pre className="text-green-300 text-sm whitespace-pre-wrap font-mono">{result}</pre>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-400">
                  Successfully extracted {result.length} characters
                </span>
                <span className="text-gray-400">
                  File: {file?.name}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-purple-400">System Status</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-medium">PDF Worker</span>
              </div>
              <p className="text-sm text-gray-400">Configured with CDN + local fallback</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-medium">Text Extraction</span>
              </div>
              <p className="text-sm text-gray-400">Enhanced positioning algorithm</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-medium">Error Handling</span>
              </div>
              <p className="text-sm text-gray-400">Comprehensive retry mechanisms</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Back to Main Application
          </a>
        </div>
      </div>
    </main>
  );
}
