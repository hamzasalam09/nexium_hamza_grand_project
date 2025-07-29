"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [tailoringLoading, setTailoringLoading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getSession();
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Handle resume tailoring
  const handleTailorResume = async () => {
    if (!user || !resumeText.trim() || !jobDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setTailoringLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jobDescription,
          jobTitle: jobTitle || 'Position'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTailoredResume(data.tailoredResume);
        
        // Try to save to database (optional)
        try {
          const saveResponse = await fetch('/api/resume', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              tailoredResume: data.tailoredResume,
              jobTitle: jobTitle || 'Untitled Position',
              originalResume: resumeText,
              jobDescription: jobDescription
            }),
          });

          if (!saveResponse.ok) {
            console.warn('Failed to save resume to database, but continuing...');
            const errorData = await saveResponse.text();
            console.warn('Save error details:', errorData);
          }
        } catch (saveError) {
          console.warn('Database save error:', saveError);
        }
        
        // Show results regardless of save status
        setShowJobModal(false);
        setShowResultsModal(true);
      } else {
        alert(`Error: ${data.error || 'Failed to tailor resume'}`);
      }
    } catch (error) {
      console.error('Tailoring error:', error);
      alert('Failed to tailor resume. Please check your connection.');
    }
    setTailoringLoading(false);
  };

  // Resume formatting function
  const formatResumeForDisplay = (resumeText: string) => {
    const lines = resumeText.split('\n');
    const formattedLines: Array<{ type: string; content: string; level?: number }> = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Detect different types of content
      if (
        trimmedLine.toUpperCase() === trimmedLine && 
        trimmedLine.length < 80 && 
        !trimmedLine.includes('@') &&
        !trimmedLine.includes('(') &&
        !trimmedLine.includes('|') &&
        !trimmedLine.includes(':') &&
        (trimmedLine.includes('EXPERIENCE') ||
         trimmedLine.includes('EDUCATION') ||
         trimmedLine.includes('SKILLS') ||
         trimmedLine.includes('SUMMARY') ||
         trimmedLine.includes('OBJECTIVE') ||
         trimmedLine.includes('CERTIFICATION') ||
         trimmedLine.includes('PROJECT') ||
         trimmedLine.includes('CONTACT') ||
         trimmedLine.includes('ACHIEVEMENT') ||
         trimmedLine.includes('QUALIFICATION') ||
         trimmedLine.includes('PROFESSIONAL') ||
         trimmedLine.includes('TECHNICAL') ||
         trimmedLine.includes('WORK') ||
         trimmedLine.includes('CORE') ||
         trimmedLine.includes('COMPETENCIES'))
      ) {
        // Main section headings (all caps, contains key resume sections)
        formattedLines.push({ type: 'heading', content: trimmedLine, level: 1 });
      } else if (
        trimmedLine.toUpperCase() === trimmedLine && 
        trimmedLine.length < 50 && 
        !trimmedLine.includes('@') &&
        !trimmedLine.includes('(') &&
        !trimmedLine.includes('|')
      ) {
        // Other headings (all caps, short)
        formattedLines.push({ type: 'heading', content: trimmedLine, level: 1 });
      } else if (
        trimmedLine.endsWith(':') || 
        (trimmedLine.includes('|') && (trimmedLine.includes('20') || trimmedLine.includes('19'))) ||
        (line.length < 100 && !line.startsWith('•') && !line.startsWith('-') && index > 0 && 
         (trimmedLine.includes('|') || trimmedLine.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i)))
      ) {
        // Subheadings (job titles, education entries, etc.)
        formattedLines.push({ type: 'subheading', content: trimmedLine, level: 2 });
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        // Bullet points
        formattedLines.push({ type: 'bullet', content: trimmedLine.substring(1).trim() });
      } else if (trimmedLine.includes('@') || 
                 (trimmedLine.includes('(') && trimmedLine.includes(')')) ||
                 trimmedLine.match(/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/)) {
        // Contact info (email, phone, etc.)
        formattedLines.push({ type: 'contact', content: trimmedLine });
      } else {
        // Regular paragraph text
        formattedLines.push({ type: 'paragraph', content: trimmedLine });
      }
    });
    
    return formattedLines;
  };

  // File processing functions
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        // Handle plain text files
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        // Handle .docx files using mammoth
        try {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          if (!result.value.trim()) {
            throw new Error('No text content found in document');
          }
          
          resolve(result.value);
        } catch (error) {
          console.error('DOCX processing error:', error);
          reject(new Error(`Failed to process Word document: ${(error as Error).message}. Please try converting to TXT format.`));
        }
      } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
        // .doc files are more complex to parse, show helpful error
        reject(new Error('Legacy .doc files are not supported. Please save as .docx or convert to TXT format.'));
      } else {
        reject(new Error('Unsupported file format. Please use TXT or DOCX files only.'));
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    setFileProcessing(true);
    setResumeFile(file);
    
    try {
      console.log('Starting file upload processing for:', file.name, file.type, file.size);
      const extractedText = await extractTextFromFile(file);
      
      if (!extractedText.trim()) {
        throw new Error('The file appears to be empty or contains no readable text.');
      }
      
      setResumeText(extractedText);
      console.log('File processed successfully:', file.name, 'Text length:', extractedText.length);
    } catch (error) {
      console.error('File processing error:', error);
      const errorMessage = (error as Error).message;
      
      // Show user-friendly error messages with specific guidance
      if (errorMessage.includes('No text content') || errorMessage.includes('empty') || errorMessage.includes('No text extracted')) {
        alert(`📝 Empty File Content\n\n${errorMessage}\n\nPlease ensure:\n• The file contains actual text\n• The file is not corrupted\n• You have the correct file format\n• Try converting to TXT format`);
      } else if (errorMessage.includes('Invalid') || errorMessage.includes('format') || errorMessage.includes('Unsupported')) {
        alert(`❌ Invalid File Format\n\n${errorMessage}\n\nSupported formats:\n• TXT (plain text)\n• DOCX (Microsoft Word)`);
      } else {
        alert(`⚠️ File Processing Error\n\n${errorMessage}\n\nGeneral troubleshooting:\n• Try refreshing the page\n• Ensure the file contains readable text\n• Check that the file is not corrupted\n• Convert to TXT format if needed`);
      }
      
      setResumeFile(null);
      setResumeText('');
    }
    
    setFileProcessing(false);
  };

  // Download functions
  const downloadAsTxt = () => {
    // Format the resume for better plain text readability
    const formattedItems = formatResumeForDisplay(tailoredResume);
    
    const plainTextContent = formattedItems.map(item => {
      switch (item.type) {
        case 'heading':
          return `\n${item.content}\n${'='.repeat(item.content.length)}\n`;
        case 'subheading':
          return `\n${item.content}\n${'-'.repeat(Math.min(item.content.length, 50))}\n`;
        case 'bullet':
          return `• ${item.content}`;
        case 'contact':
          return item.content;
        case 'paragraph':
          return `\n${item.content}\n`;
        default:
          return item.content;
      }
    }).join('\n').replace(/\n{3,}/g, '\n\n');
    
    const element = document.createElement('a');
    const file = new Blob([plainTextContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${(jobTitle || 'professional-resume').replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsWord = () => {
    // Format the content to match the exact preview styling
    const formattedItems = formatResumeForDisplay(tailoredResume);
    
    const htmlContent = formattedItems.map(item => {
      switch (item.type) {
        case 'heading':
          // Match: text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300 uppercase tracking-wide
          return `<h1 style="font-size: 16pt; font-weight: bold; color: #111827; margin: 0 0 16pt 0; padding-bottom: 8pt; border-bottom: 2pt solid #d1d5db; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Calibri', sans-serif;">${item.content}</h1>`;
        case 'subheading':
          // Match: text-lg font-semibold text-gray-800 mb-2 mt-4
          return `<h2 style="font-size: 14pt; font-weight: 600; color: #1f2937; margin: 16pt 0 8pt 0; font-family: 'Calibri', sans-serif;">${item.content}</h2>`;
        case 'bullet':
          // Match: flex items-start mb-1 ml-4, text-blue-600 mr-2 mt-1.5, text-gray-700 leading-relaxed
          return `<p style="margin: 4pt 0 4pt 16pt; text-indent: -8pt; color: #374151; font-size: 11pt; line-height: 1.5; font-family: 'Calibri', sans-serif;"><span style="color: #2563eb; font-weight: bold;">• </span>${item.content}</p>`;
        case 'contact':
          // Match: text-gray-600 mb-1 text-sm
          return `<p style="margin: 4pt 0; color: #4b5563; font-size: 10pt; font-family: 'Calibri', sans-serif;">${item.content}</p>`;
        case 'paragraph':
          // Match: text-gray-700 mb-2 leading-relaxed
          return `<p style="margin: 8pt 0; color: #374151; font-size: 11pt; line-height: 1.5; font-family: 'Calibri', sans-serif;">${item.content}</p>`;
        default:
          // Match: text-gray-700 mb-1
          return `<p style="margin: 4pt 0; color: #374151; font-size: 11pt; font-family: 'Calibri', sans-serif;">${item.content}</p>`;
      }
    }).join('\n');

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${jobTitle || 'Professional Resume'}</title>
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1in 1in 1in 1in;
            }
            body { 
              font-family: 'Calibri', sans-serif; 
              font-size: 11pt; 
              line-height: 1.5; 
              margin: 0;
              padding: 24pt;
              color: #374151;
              background-color: #ffffff;
              width: 100%;
            }
            h1, h2, h3 { 
              margin-top: 0; 
              font-family: 'Calibri', sans-serif; 
            }
            p {
              margin: 0;
              font-family: 'Calibri', sans-serif;
            }
            /* Ensure consistent spacing and colors that match the preview */
            * {
              box-sizing: border-box;
            }
            /* Remove any default margins for consistent layout */
            html, body {
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div style="background-color: #ffffff; padding: 24pt; min-height: 100%; border-radius: 8pt; box-shadow: 0 1pt 3pt rgba(0,0,0,0.1);">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${(jobTitle || 'professional-resume').replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').toLowerCase()}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Clean up the blob URL
    setTimeout(() => {
      URL.revokeObjectURL(element.href);
    }, 1000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if Supabase is configured properly
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }

      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      });
      if (error) {
        console.error('Auth error:', error.message);
        // Show user-friendly error message
        if (error.message.includes('Failed to fetch')) {
          alert('🔗 Connection Error: Please check your internet connection or try again later.');
        } else {
          alert(`Authentication Error: ${error.message}`);
        }
      } else {
        alert('✅ Magic link sent! Check your email inbox.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('🚨 System Error: Unable to send magic link. Please check your configuration.');
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Matrix Grid Overlay */}
      <div className="fixed inset-0 z-0 cyber-grid opacity-20"></div>
      
      {/* Scan Lines Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
      }}></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Logo/Brand */}
            <div className="mb-12">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 border border-cyan-400/30 rounded-full text-sm text-cyan-400 font-mono mb-8 cyber-glow">
                  AI-POWERED NEURAL NETWORK
                </span>
              </div>
              <h1 className="cyber-title text-7xl md:text-9xl font-black mb-6 leading-none">
                RESUME <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 cyber-glow">TAILOR</span>
              </h1>
              <h2 className="text-3xl md:text-5xl text-gray-300 mb-8 font-light tracking-wide">
                Cosmic AI Resume Builder
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                Create, tailor, and manage your resumes with AI. Stand out with a futuristic, 
                professional look—powered by the latest tech and cosmic inspiration.
              </p>
            </div>

            {/* Auth Section */}
            {!user ? (
              <div className="cyber-card p-10 mb-16 max-w-lg mx-auto backdrop-blur-md">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-pink-500/20 flex items-center justify-center border border-cyan-400/30">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/50 animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-cyan-400 cyber-glow">Access Neural Network</h3>
                  <p className="text-gray-400 text-sm">Initialize quantum connection protocol</p>
                </div>
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 text-left">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="cyber-input w-full text-lg py-4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cyber-btn-primary w-full text-lg py-4 font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        Establishing Connection...
                      </span>
                    ) : (
                      <>Send Magic Link ⚡</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="cyber-card p-10 mb-16 max-w-4xl mx-auto backdrop-blur-md">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400/20 to-cyan-400/20 flex items-center justify-center border border-green-400/50">
                    <div className="w-8 h-8 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-green-400 cyber-glow">Welcome, {user.email?.split('@')[0]}</h3>
                  <p className="text-purple-400 text-lg mb-6">Your AI-Powered Resume Dashboard</p>
                  <p className="text-gray-300 mb-8">
                    Easily upload, tailor, and manage your resumes for every job opportunity. Let AI help you stand out!
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="cyber-btn-primary px-8 py-6 text-xl font-bold"
                  >
                    <div className="text-2xl mb-2">📄</div>
                    Upload Resume File
                    <div className="text-sm font-normal opacity-80 mt-1">Start tailoring your resume with AI</div>
                  </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View Dashboard →
                  </button>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="mb-20">
              <button className="cyber-btn-glow text-2xl px-16 py-6 font-bold tracking-wide">
                Build Your Resume
                <span className="ml-3 text-3xl">⚡</span>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 border border-purple-400/30 rounded-full text-sm text-purple-400 font-mono mb-8">
                NEURAL CAPABILITIES
              </span>
              <h2 className="cyber-title text-5xl md:text-7xl text-center mb-6">
                Features
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Advanced AI algorithms designed for professional excellence
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* AI-Powered Tailoring */}
              <div className="cyber-card p-12 text-center group hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-cyan-400/20 hover:shadow-2xl">
                <div className="text-7xl mb-8 group-hover:animate-bounce">⚡</div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 border border-cyan-400/30 rounded-full text-xs text-cyan-400 font-mono mb-6">
                    AI ALGORITHM v2.1
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-cyan-400 group-hover:glow-text-cyan transition-all duration-300">
                  AI-Powered Tailoring
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  Instantly adapt your resume for any job with smart, AI-driven suggestions 
                  powered by advanced neural networks.
                </p>
                <div className="cyber-stat bg-gradient-to-r from-cyan-400/10 to-cyan-400/5 rounded-lg p-4">
                  <div className="text-cyan-400 font-mono text-4xl font-bold">680</div>
                  <div className="text-cyan-400/70 text-sm font-mono">PROCESSING UNITS</div>
                </div>
              </div>

              {/* Secure & Private */}
              <div className="cyber-card p-12 text-center group hover:border-pink-400/50 transition-all duration-500 hover:scale-105 hover:shadow-pink-400/20 hover:shadow-2xl">
                <div className="text-7xl mb-8 group-hover:animate-pulse">🔒</div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 border border-pink-400/30 rounded-full text-xs text-pink-400 font-mono mb-6">
                    QUANTUM ENCRYPTION
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-pink-400 group-hover:glow-text-pink transition-all duration-300">
                  Secure &amp; Private
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  Your data is encrypted with military-grade security and never shared. 
                  You&apos;re always in complete control.
                </p>
                <div className="cyber-stat bg-gradient-to-r from-pink-400/10 to-pink-400/5 rounded-lg p-4">
                  <div className="text-pink-400 font-mono text-4xl font-bold">512</div>
                  <div className="text-pink-400/70 text-sm font-mono">BIT ENCRYPTION</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="cyber-card p-8 text-center group hover:border-purple-400/50 transition-all duration-300">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h4 className="text-xl font-bold text-purple-400 mb-3">Smart Matching</h4>
                <p className="text-gray-400 leading-relaxed">
                  AI analyzes job requirements and optimizes your resume for maximum compatibility
                </p>
              </div>
              
              <div className="cyber-card p-8 text-center group hover:border-cyan-400/50 transition-all duration-300">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📝</div>
                <h4 className="text-xl font-bold text-cyan-400 mb-3">Live Preview</h4>
                <p className="text-gray-400 leading-relaxed">
                  Real-time resume editing with instant visual feedback and format optimization
                </p>
              </div>
              
              <div className="cyber-card p-8 text-center group hover:border-pink-400/50 transition-all duration-300">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📱</div>
                <h4 className="text-xl font-bold text-pink-400 mb-3">Mobile Ready</h4>
                <p className="text-gray-400 leading-relaxed">
                  Fully responsive design that works perfectly on all devices and screen sizes
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="fixed top-20 right-10 w-3 h-3 bg-cyan-400 rounded-full opacity-70 cyber-float"></div>
      <div className="fixed top-40 left-20 w-2 h-2 bg-pink-500 rounded-full opacity-50 cyber-float" style={{animationDelay: '1s'}}></div>
      <div className="fixed bottom-20 right-20 w-4 h-4 bg-purple-400 rounded-full opacity-40 cyber-float" style={{animationDelay: '2s'}}></div>
      <div className="fixed top-1/2 left-10 w-1 h-1 bg-blue-400 rounded-full opacity-60 cyber-float" style={{animationDelay: '3s'}}></div>
      <div className="fixed bottom-1/3 left-1/2 w-2 h-2 bg-green-400 rounded-full opacity-30 cyber-float" style={{animationDelay: '4s'}}></div>

      {/* Upload Resume Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="cyber-card w-full max-w-2xl">
            <div className="p-6 border-b border-cyan-500/30">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-purple-400">Upload Your Resume</h2>
                <button
                  className="text-gray-400 hover:text-white text-2xl"
                  onClick={() => {
                    setShowUploadModal(false);
                    setResumeText('');
                    setResumeFile(null);
                  }}
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 mt-2">Upload your resume in supported formats to get started.</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Upload Resume File
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    fileProcessing ? 'border-yellow-400/50 bg-yellow-400/5' : 
                    resumeFile ? 'border-green-400/50 bg-green-400/5' : 
                    'border-gray-600 hover:border-cyan-400/50'
                  }`}>
                    <input
                      type="file"
                      accept=".docx,.txt"
                      className="hidden"
                      id="resume-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      disabled={fileProcessing}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      {fileProcessing ? (
                        <div>
                          <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <div className="text-lg font-medium text-yellow-400 mb-2">Processing file...</div>
                          <div className="text-sm text-gray-400">Please wait while we extract text from your resume</div>
                        </div>
                      ) : resumeFile ? (
                        <div>
                          <div className="text-4xl mb-4">✅</div>
                          <div className="text-lg font-medium text-green-400 mb-2">File uploaded successfully!</div>
                          <div className="text-sm text-gray-400 mb-2">{resumeFile.name}</div>
                          <div className="text-xs text-gray-500">Click to choose a different file</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl mb-4">📄</div>
                          <div className="text-lg font-medium text-gray-300 mb-2">Choose resume file</div>
                          <div className="text-sm text-gray-500 mb-3">Drag & drop or click to browse</div>
                          <div className="flex justify-center gap-2 text-xs text-gray-600">
                            <span className="bg-gray-700 px-2 py-1 rounded">TXT</span>
                            <span className="bg-gray-700 px-2 py-1 rounded">DOCX</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Supported formats: .docx and .txt files</div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                {/* Resume preview */}
                {resumeText && (
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Resume Preview</h4>
                    <div className="text-xs text-gray-300 max-h-20 overflow-y-auto bg-black/30 p-3 rounded border">
                      {resumeText.substring(0, 300)}
                      {resumeText.length > 300 && '...'}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    className="cyber-btn-secondary flex-1 py-3"
                    onClick={() => {
                      setShowUploadModal(false);
                      setResumeText('');
                      setResumeFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="cyber-btn-primary flex-1 py-3"
                    onClick={() => {
                      setShowUploadModal(false);
                      setShowJobModal(true);
                    }}
                    disabled={!resumeText.trim() || fileProcessing}
                  >
                    {fileProcessing ? 'Processing...' : 'Continue to Job Details'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Description Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="cyber-card w-full max-w-3xl">
            <div className="p-6 border-b border-cyan-500/30">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-purple-400">Add Job Details</h2>
                <button
                  className="text-gray-400 hover:text-white text-2xl"
                  onClick={() => setShowJobModal(false)}
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 mt-2">Provide job details to customize your resume with AI.</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="cyber-input w-full"
                    placeholder="e.g. Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Job Description *
                  </label>
                  <textarea
                    className="cyber-input w-full h-40 resize-none"
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-cyan-400 mb-2">Your Resume Preview</h4>
                  <div className="text-xs text-gray-400 max-h-20 overflow-y-auto">
                    {resumeText.substring(0, 200)}...
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    className="cyber-btn-secondary flex-1 py-3"
                    onClick={() => setShowJobModal(false)}
                  >
                    Back
                  </button>
                  <button
                    className="cyber-btn-primary flex-1 py-3"
                    onClick={() => handleTailorResume()}
                    disabled={!jobDescription.trim() || tailoringLoading}
                  >
                    {tailoringLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        AI Processing...
                      </span>
                    ) : (
                      '🚀 Tailor with AI'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="cyber-card w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-cyan-500/30">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-green-400">✅ Resume Tailored Successfully!</h2>
                  <p className="text-gray-400 mt-1">Your AI-optimized resume for: {jobTitle || 'Position'}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <span>🔍</span>
                    Preview Fullscreen
                  </button>
                  <button
                    className="text-gray-400 hover:text-white text-2xl"
                    onClick={() => {
                      setShowResultsModal(false);
                      setResumeText('');
                      setJobDescription('');
                      setJobTitle('');
                      setTailoredResume('');
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Original Resume */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-cyan-400">
                    📄 Original Resume
                  </h3>
                  <div className="bg-gray-100 text-black p-6 rounded-lg h-64 overflow-y-auto border shadow-lg">
                    <div className="resume-content">
                      {formatResumeForDisplay(resumeText).map((item, index) => {
                        switch (item.type) {
                          case 'heading':
                            return (
                              <h1 key={index} className="text-xl font-bold text-gray-800 mb-3 pb-2 border-b border-gray-400 uppercase tracking-wide">
                                {item.content}
                              </h1>
                            );
                          case 'subheading':
                            return (
                              <h2 key={index} className="text-base font-semibold text-gray-700 mb-2 mt-3">
                                {item.content}
                              </h2>
                            );
                          case 'bullet':
                            return (
                              <div key={index} className="flex items-start mb-1 ml-4">
                                <span className="text-gray-500 mr-2 mt-1.5">•</span>
                                <span className="text-gray-600 leading-relaxed text-sm">{item.content}</span>
                              </div>
                            );
                          case 'contact':
                            return (
                              <p key={index} className="text-gray-500 mb-1 text-xs">
                                {item.content}
                              </p>
                            );
                          case 'paragraph':
                            return (
                              <p key={index} className="text-gray-600 mb-2 leading-relaxed text-sm">
                                {item.content}
                              </p>
                            );
                          default:
                            return (
                              <p key={index} className="text-gray-600 mb-1 text-sm">
                                {item.content}
                              </p>
                            );
                        }
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Tailored Resume */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-400">
                    ✨ AI-Tailored Resume
                  </h3>
                  <div className="bg-white text-black p-6 rounded-lg h-64 overflow-y-auto border shadow-lg">
                    <div className="resume-content">
                      {formatResumeForDisplay(tailoredResume).map((item, index) => {
                        switch (item.type) {
                          case 'heading':
                            return (
                              <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300 uppercase tracking-wide">
                                {item.content}
                              </h1>
                            );
                          case 'subheading':
                            return (
                              <h2 key={index} className="text-lg font-semibold text-gray-800 mb-2 mt-4">
                                {item.content}
                              </h2>
                            );
                          case 'bullet':
                            return (
                              <div key={index} className="flex items-start mb-1 ml-4">
                                <span className="text-blue-600 mr-2 mt-1.5">•</span>
                                <span className="text-gray-700 leading-relaxed">{item.content}</span>
                              </div>
                            );
                          case 'contact':
                            return (
                              <p key={index} className="text-gray-600 mb-1 text-sm">
                                {item.content}
                              </p>
                            );
                          case 'paragraph':
                            return (
                              <p key={index} className="text-gray-700 mb-2 leading-relaxed">
                                {item.content}
                              </p>
                            );
                          default:
                            return (
                              <p key={index} className="text-gray-700 mb-1">
                                {item.content}
                              </p>
                            );
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Options */}
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4 text-yellow-400">💾 Download Options</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => downloadAsTxt()}
                    className="cyber-btn-primary p-4 text-center"
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-bold">Download as TXT</div>
                    <div className="text-xs opacity-80">Plain text format</div>
                  </button>
                  
                  <button
                    onClick={() => downloadAsWord()}
                    className="cyber-btn-danger p-4 text-center"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="font-bold">Download as Word</div>
                    <div className="text-xs opacity-80">Matches preview formatting</div>
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  className="cyber-btn-secondary flex-1 py-3"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  View Dashboard
                </button>
                <button
                  className="cyber-btn-primary flex-1 py-3"
                  onClick={() => {
                    setShowResultsModal(false);
                    setResumeText('');
                    setJobDescription('');
                    setJobTitle('');
                    setTailoredResume('');
                    setShowUploadModal(true);
                  }}
                >
                  Create Another Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Resume Preview Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Professional Resume Preview</h2>
                <p className="text-gray-300 text-sm">{jobTitle || 'Position'} - AI Tailored</p>
              </div>
              <button
                onClick={() => setShowFullscreen(false)}
                className="text-gray-300 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-gray-700 rounded"
              >
                ×
              </button>
            </div>
            <div className="p-8 max-h-[85vh] overflow-y-auto bg-white">
              <div className="max-w-3xl mx-auto">
                {formatResumeForDisplay(tailoredResume).map((item, index) => {
                  switch (item.type) {
                    case 'heading':
                      return (
                        <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600 uppercase tracking-wide">
                          {item.content}
                        </h1>
                      );
                    case 'subheading':
                      return (
                        <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-6 border-l-4 border-blue-500 pl-4">
                          {item.content}
                        </h2>
                      );
                    case 'bullet':
                      return (
                        <div key={index} className="flex items-start mb-2 ml-6">
                          <span className="text-blue-600 mr-3 mt-2 text-lg">•</span>
                          <span className="text-gray-700 leading-relaxed text-base">{item.content}</span>
                        </div>
                      );
                    case 'contact':
                      return (
                        <p key={index} className="text-gray-600 mb-2 text-base">
                          {item.content}
                        </p>
                      );
                    case 'paragraph':
                      return (
                        <p key={index} className="text-gray-700 mb-3 leading-relaxed text-base">
                          {item.content}
                        </p>
                      );
                    default:
                      return (
                        <p key={index} className="text-gray-700 mb-2 text-base">
                          {item.content}
                        </p>
                      );
                  }
                })}
              </div>
            </div>
            <div className="bg-gray-100 p-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowFullscreen(false);
                  downloadAsTxt();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                📄 Download TXT
              </button>
              <button
                onClick={() => {
                  setShowFullscreen(false);
                  downloadAsWord();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                📝 Download Word
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
