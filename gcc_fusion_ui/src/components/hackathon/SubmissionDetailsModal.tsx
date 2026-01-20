import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Download,
  Github,
  User,
  Calendar,
  Target,
  Briefcase,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface SubmissionDetailsModalProps {
  submissionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionDetailsModal({
  submissionId,
  isOpen,
  onClose,
}: SubmissionDetailsModalProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchSubmissionDetails();
    }
  }, [isOpen, submissionId]);

  const fetchSubmissionDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmission(submissionId);
      setSubmission(data);
    } catch (error) {
      toast.error('Failed to load submission details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const submitter = submission?.submitter || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Fixed to allow scrolling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Wrapper - Improved centering and scrolling */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto min-h-full flex items-center py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full"
              >
                <Card className="w-full max-h-[90vh] bg-slate-900 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
                      <p className="text-white font-medium">Loading submission details…</p>
                    </div>
                  ) : submission ? (
                    <>
                      {/* Header - Fixed */}
                      <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800 flex-shrink-0">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-white mb-2 truncate">
                            {submission.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="font-medium text-white">{submitter.firstName} {submitter.lastName}</span>
                              {submission.type === 'TEAM' && submission.teamInfo ? (
                                <span className="text-blue-300 ml-1 font-semibold">
                                  (Team: {submission.teamInfo.name})
                                </span>
                              ) : (
                                <span className="text-green-300 ml-1 font-semibold">(Individual)</span>
                              )}
                            </span>
                            <span className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className="font-medium text-white">
                                {submission.submittedAt
                                  ? new Date(submission.submittedAt).toLocaleDateString()
                                  : 'Draft'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={onClose}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold ml-4 flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Content - Enhanced scrolling */}
                      <div 
                        className="flex-1 overflow-y-auto p-6 bg-slate-900 modal-content scrollbar-thin" 
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#475569 #1e293b',
                          maxHeight: '70vh',
                          overflowY: 'scroll'
                        }}
                      >
                        <div className="space-y-6">
                          {/* Description */}
                          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-400" />
                              Project Description
                            </h3>
                            <div className="text-white leading-relaxed whitespace-pre-wrap text-base">
                              {submission.description || 'No description provided'}
                            </div>
                          </div>

                          {/* Selected Track */}
                          {submission.selectedTrack && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                Selected Problem Statement Track
                              </h3>
                              <div className="bg-slate-700 p-4 rounded-lg">
                                <p className="text-blue-300 font-bold text-lg mb-2">
                                  Track {submission.selectedTrack}
                                </p>
                                {submission.hackathon?.tracks && submission.hackathon.tracks[submission.selectedTrack - 1] && (
                                  <p className="text-slate-200 text-base">
                                    {submission.hackathon.tracks[submission.selectedTrack - 1].title}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tech Stack */}
                          {submission.techStack && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-green-400" />
                                Technology Stack
                              </h3>
                              <div className="flex flex-wrap gap-3">
                                {submission.techStack.split(',').map((tech: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-2 bg-green-600 text-white rounded-full text-sm font-semibold"
                                  >
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Repository Link Only */}
                          {submission.repositoryUrl && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Github className="w-5 h-5 text-purple-400" />
                                Project Repository
                              </h3>
                              <a
                                href={submission.repositoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300 border border-slate-600"
                              >
                                <Github className="w-6 h-6 text-white" />
                                <span className="text-white flex-1 truncate font-medium">
                                  View on GitHub
                                </span>
                                <span className="text-slate-300 text-sm">↗</span>
                              </a>
                            </div>
                          )}

                          {/* Uploaded Files - Enhanced */}
                          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-orange-400" />
                              Uploaded Files
                            </h3>

                            {submission.files && Array.isArray(submission.files) && submission.files.length > 0 ? (
                              <div className="space-y-4">
                                {(() => {
                                  // Parse and categorize files
                                  const projectFiles: any[] = [];
                                  const presentationFiles: any[] = [];
                                  
                                  submission.files.forEach((fileStr: string, idx: number) => {
                                    let fileData: any = {};
                                    
                                    try {
                                      // Try to parse as JSON first
                                      fileData = JSON.parse(fileStr);
                                    } catch {
                                      // If not JSON, treat as simple string/object
                                      fileData = typeof fileStr === 'object' ? fileStr : { name: fileStr, url: fileStr };
                                    }
                                    
                                    // Extract file information
                                    const fileName = fileData.name || fileData.originalName || fileData.fileName || `File ${idx + 1}`;
                                    let fileUrl = fileData.downloadUrl || fileData.url || fileData.key || fileData.fileUrl || fileStr;
                                    
                                    // If the URL is a relative path, make it absolute
                                    if (fileUrl && !fileUrl.startsWith('http')) {
                                      if (fileUrl.startsWith('/')) {
                                        fileUrl = `http://localhost:3002${fileUrl}`;
                                      } else {
                                        fileUrl = `http://localhost:3002/api/v1/uploads/${fileUrl}`;
                                      }
                                    }
                                    
                                    const fileType = fileData.type || fileData.mimeType || fileData.fileType || '';
                                    const fileSize = fileData.size || fileData.fileSize || 0;
                                    
                                    // Determine if it's a presentation file based on extension
                                    const isPresentationFile = fileName.match(/\.(pdf|ppt|pptx|key|odp)$/i);
                                    
                                    const processedFile = {
                                      name: fileName,
                                      url: fileUrl,
                                      type: fileType,
                                      size: fileSize,
                                      isPresentationFile
                                    };
                                    
                                    if (isPresentationFile) {
                                      presentationFiles.push(processedFile);
                                    } else {
                                      projectFiles.push(processedFile);
                                    }
                                  });
                                  
                                  return (
                                    <>
                                      {/* Project Files */}
                                      {projectFiles.length > 0 && (
                                        <div className="bg-slate-700 p-4 rounded-lg">
                                          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-green-400" />
                                            Project Files ({projectFiles.length})
                                          </h4>
                                          <div className="space-y-3">
                                            {projectFiles.map((file, idx) => (
                                              <div
                                                key={`project-${idx}`}
                                                className="flex items-center gap-4 p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-all duration-300"
                                              >
                                                <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-white font-medium truncate">
                                                    {file.name}
                                                  </p>
                                                  {file.size > 0 && (
                                                    <p className="text-slate-300 text-sm">
                                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                  )}
                                                </div>
                                                <a
                                                  href={file.url}
                                                  download={file.name}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded text-sm flex items-center gap-2 transition-all duration-300"
                                                >
                                                  <Download className="w-4 h-4" />
                                                  Download
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Presentation Files */}
                                      {presentationFiles.length > 0 && (
                                        <div className="bg-slate-700 p-4 rounded-lg">
                                          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            Presentation Files ({presentationFiles.length})
                                          </h4>
                                          <div className="space-y-3">
                                            {presentationFiles.map((file, idx) => (
                                              <div
                                                key={`presentation-${idx}`}
                                                className="flex items-center gap-4 p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-all duration-300"
                                              >
                                                <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-white font-medium truncate">
                                                    {file.name}
                                                  </p>
                                                  {file.size > 0 && (
                                                    <p className="text-slate-300 text-sm">
                                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                  )}
                                                </div>
                                                <a
                                                  href={file.url}
                                                  download={file.name}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded text-sm flex items-center gap-2 transition-all duration-300"
                                                >
                                                  <Download className="w-4 h-4" />
                                                  Download
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-700 rounded-lg text-center">
                                <p className="text-slate-300 font-medium">
                                  No files uploaded for this submission.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-slate-700 flex justify-end bg-slate-800 flex-shrink-0">
                        <Button
                          onClick={onClose}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-white text-lg">Failed to load submission details</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
