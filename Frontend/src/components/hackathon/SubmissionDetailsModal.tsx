import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  Github,
  Globe,
  User,
  Calendar,
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
          {/* Backdrop (does NOT block scroll) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 pointer-events-none"
          />

          {/* Modal Wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl"
            >
              <Card className="w-full max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
                    <p className="text-white">Loading submission details…</p>
                  </div>
                ) : submission ? (
                  <>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {submission.title}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-slate-300 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4 text-slate-300" />
                            {submitter.firstName} {submitter.lastName}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-slate-300" />
                            {submission.submittedAt
                              ? new Date(submission.submittedAt).toLocaleDateString()
                              : 'Not submitted'}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={onClose}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-gradient-to-br from-slate-900 to-slate-950">
                      <div className="space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Description
                          </h3>
                          <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">
                            {submission.description || 'No description provided'}
                          </p>
                        </div>

                        {/* Links */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Project Links
                          </h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {submission.repositoryUrl && (
                              <a
                                href={submission.repositoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                              >
                                <Github className="w-5 h-5 text-white" />
                                <span className="text-white flex-1 truncate">
                                  GitHub Repository
                                </span>
                                <ExternalLink className="w-4 h-4 text-slate-300" />
                              </a>
                            )}
                            {submission.liveUrl && (
                              <a
                                href={submission.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                              >
                                <Globe className="w-5 h-5 text-white" />
                                <span className="text-white flex-1 truncate">
                                  Live Demo
                                </span>
                                <ExternalLink className="w-4 h-4 text-slate-300" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Files */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            Uploaded Project Files
                          </h3>

                          {submission.files && Array.isArray(submission.files) && submission.files.length > 0 ? (
                            <div className="space-y-2">
                              {submission.files.map((file: any, idx: number) => {
                                // CRITICAL: Prefer downloadUrl (SAS URL) over url
                                const name = file.name || 'File';
                                const url = file.downloadUrl || file.url || `/api/v1/uploads/${file.id}/download`;
                                        
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                                  >
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    <div className="flex-1 truncate">
                                      <p className="text-white font-medium truncate">
                                        {name}
                                      </p>
                                    </div>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold rounded text-sm flex items-center gap-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                              <p className="text-slate-200 text-sm">
                                No files uploaded for this submission.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-700 flex justify-end">
                      <Button
                        onClick={onClose}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                      >
                        Close
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-white">
                    Failed to load submission details
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
