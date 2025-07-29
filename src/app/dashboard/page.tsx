"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import ReactMarkdown from 'react-markdown';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

interface Resume {
  _id: string;
  jobTitle: string;
  tailoredResume: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    const getSessionAndResumes = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        
        if (data.user) {
          try {
            const res = await fetch(`/api/resume?userId=${data.user.id}`);
            
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const json = await res.json();
            
            if (json.success) {
              setResumes(json.resumes || []);
            } else {
              console.warn('Database fetch failed:', json.error);
              // Don't show error for database issues, just set empty array
              setResumes([]);
              if (json.error.includes('Database error') || json.error.includes('SSL')) {
                console.log('Database temporarily unavailable, working in offline mode');
              } else {
                setError(json.error || 'Failed to fetch resumes');
              }
            }
          } catch (fetchError) {
            console.error('Failed to fetch resumes:', fetchError);
            // Don't show error for network/database issues
            setResumes([]);
            console.log('Working in offline mode due to database connectivity issues');
          }
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        setError('Authentication failed');
      }
      
      setLoading(false);
    };
    
    getSessionAndResumes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading Neural Network...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
          <p className="text-gray-300 mb-6">Neural link required to access dashboard</p>
          <Link href="/" className="cyber-btn-primary">
            Connect to Network
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 holographic">
            Neural Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Manage your AI-tailored resumes from the cosmic interface
          </p>
        </div>

        {/* User Info */}
        <div className="cyber-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 font-medium">Neural Link Active:</span>
              <span className="text-white font-bold">{user.email}</span>
            </div>
            <div className="text-sm text-gray-400">
              {resumes.length} Resume{resumes.length !== 1 ? 's' : ''} Stored
            </div>
          </div>
        </div>

        {error ? (
          <div className="cyber-card p-8 text-center">
            <div className="text-red-400 text-xl mb-4">System Error</div>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="cyber-card p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">
              No Resumes Found
            </h3>
            <p className="text-gray-300 mb-6">
              Start tailoring your first resume with our cosmic AI system
            </p>
            <Link href="/" className="cyber-btn-primary">
              Create First Resume
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {resumes.map((resume) => (
              <div key={resume._id} className="cyber-card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold mb-2 glow-text-cyan">
                      {resume.jobTitle || 'Untitled Position'}
                    </h3>
                    <p className="text-gray-400 text-sm font-mono">
                      Created: {new Date(resume.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="cyber-btn-primary"
                      onClick={() => setSelectedResume(resume)}
                    >
                      View
                    </button>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(resume.tailoredResume)}`}
                      download={`${resume.jobTitle || 'resume'}_${resume._id}.txt`}
                      className="cyber-btn-secondary"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resume Modal */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="cyber-card w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-cyan-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 glow-text-cyan">
                      {selectedResume.jobTitle || 'Untitled Position'}
                    </h2>
                    <p className="text-gray-400 text-sm font-mono">
                      {new Date(selectedResume.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white text-2xl"
                    onClick={() => setSelectedResume(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Raw Content */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-pink-400">
                      Raw Content
                    </h3>
                    <textarea
                      className="cyber-input w-full h-64 resize-none text-sm"
                      value={selectedResume.tailoredResume}
                      readOnly
                    />
                  </div>
                  
                  {/* Markdown Preview */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-purple-400">
                      Rendered Preview
                    </h3>
                    <div className="bg-black/30 border border-cyan-500/30 rounded-lg p-4 h-64 overflow-y-auto">
                      <div className="prose prose-sm max-w-none text-gray-300">
                        <ReactMarkdown>{selectedResume.tailoredResume}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
