import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, Clock, XCircle, AlertCircle, Download, Eye, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface MySubmissionsProps {
  onSelectSubmission?: (submission: any) => void;
}

export function MySubmissions({ onSelectSubmission }: MySubmissionsProps = {}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      // Map API data to display format
      const mappedSubmissions = (data || []).map((sub: any) => ({
        id: sub.id,
        hackathonId: sub.hackathonId,
        projectName: sub.title,
        hackathon: sub.hackathon?.title || 'Unknown Hackathon',
        submittedDate: sub.submittedAt || sub.createdAt,
        status: sub.status?.toLowerCase().replace(/_/g, '-') || 'draft',
        aiScore: sub.aiMatchPercentage || null,
        statusSteps: getStatusSteps(sub.status),
        submission: sub, // Keep full submission object
      }));
      setSubmissions(mappedSubmissions);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const statusMap: Record<string, any[]> = {
      'DRAFT': [
        { label: 'Draft', status: 'current' },
        { label: 'AI Review', status: 'pending' },
        { label: 'Offline Review', status: 'pending' },
        { label: 'Final Result', status: 'pending' },
      ],
      'SUBMITTED': [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'current' },
        { label: 'Offline Review', status: 'pending' },
        { label: 'Final Result', status: 'pending' },
      ],
      'AI_REVIEWED': [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'current' },
        { label: 'Final Result', status: 'pending' },
      ],
      'APPROVED': [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'completed' },
        { label: 'Final Result', status: 'completed' },
      ],
      'WINNER': [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'completed' },
        { label: 'Winner!', status: 'completed' },
      ],
    };
    return statusMap[status] || statusMap['DRAFT'];
  };

  // Fallback sample data if API fails
  const sampleSubmissions = [
    {
      id: 1,
      hackathon: 'AI Innovation Challenge 2024',
      projectName: 'Smart Healthcare Assistant',
      submittedDate: '2024-12-20',
      status: 'ai-review',
      aiScore: 72,
      statusSteps: [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'current' },
        { label: 'Offline Review', status: 'pending' },
        { label: 'Final Result', status: 'pending' },
      ],
    },
    {
      id: 2,
      hackathon: 'Web3 Global Hackathon',
      projectName: 'DeFi Trading Platform',
      submittedDate: '2024-12-18',
      status: 'offline-review',
      aiScore: 85,
      statusSteps: [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'current' },
        { label: 'Final Result', status: 'pending' },
      ],
    },
    {
      id: 3,
      hackathon: 'Green Tech Challenge',
      projectName: 'Solar Energy Optimizer',
      submittedDate: '2024-12-10',
      status: 'selected',
      aiScore: 91,
      statusSteps: [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'completed' },
        { label: 'Final Result', status: 'completed' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/_/g, '-') || '';
    switch (normalizedStatus) {
      case 'ai-reviewed':
      case 'under-ai-review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'passed-to-offline-review':
      case 'under-offline-review':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'approved':
      case 'winner':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-slate-500/20 text-white border-slate-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">My Submissions</h1>
        <p className="text-white">Track your project submissions and their status</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-white">Loading submissions...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && submissions.length === 0 && (
        <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
          <FileText className="w-16 h-16 text-white mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-white">No Submissions Yet</h3>
          <p className="text-white mb-6">Start participating in hackathons to submit your projects</p>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            onClick={() => {
              if (onSelectSubmission) {
                // This will be handled by parent
                toast.info('Explore hackathons to get started!');
              }
            }}
          >
            Browse Hackathons
          </Button>
        </Card>
      )}

      {/* Submissions */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-6">
          {submissions.map((submission, index) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-white">{submission.projectName || submission.title}</h3>
                  <p className="text-white text-sm">{submission.hackathon}</p>
                  <p className="text-white text-xs mt-1">
                    {submission.submittedDate 
                      ? `Submitted: ${new Date(submission.submittedDate).toLocaleDateString()}`
                      : 'Draft'}
                  </p>
                </div>
                <Badge className={getStatusColor(submission.status)}>
                  {submission.status === 'ai-reviewed' && 'AI Reviewed'}
                  {submission.status === 'under-ai-review' && 'AI Review'}
                  {submission.status === 'passed-to-offline-review' && 'Offline Review'}
                  {submission.status === 'approved' && 'Approved ✓'}
                  {submission.status === 'winner' && 'Winner 🏆'}
                  {submission.status === 'draft' && 'Draft'}
                  {submission.status === 'submitted' && 'Submitted'}
                  {!['ai-reviewed', 'under-ai-review', 'passed-to-offline-review', 'approved', 'winner', 'draft', 'submitted'].includes(submission.status) && submission.status}
                </Badge>
              </div>

              {/* AI Score */}
              {submission.aiScore && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white mb-1">AI Review Score</p>
                      <p className="text-3xl font-bold text-white">
                        {submission.aiScore}
                        <span className="text-lg text-white">/100</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white mb-1">Requirements Match</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${submission.aiScore}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full ${
                              submission.aiScore >= 80
                                ? 'bg-green-500'
                                : submission.aiScore >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white">{submission.aiScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mb-6">
                <p className="text-sm text-white mb-4 font-semibold">Submission Timeline</p>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-700" />
                  
                  <div className="space-y-6">
                    {submission.statusSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center ${
                            step.status === 'completed'
                              ? 'bg-green-500'
                              : step.status === 'current'
                              ? 'bg-blue-500'
                              : 'bg-slate-700'
                          }`}
                        >
                          {step.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                          {step.status === 'current' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-3">
                            <p
                              className={`font-semibold ${
                                step.status === 'pending' ? 'text-white' : 'text-white'
                              }`}
                            >
                              {step.label}
                            </p>
                            {step.status === 'current' && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          {step.status === 'current' && (
                            <p className="text-sm text-white mt-1">
                              Your submission is currently being reviewed
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                  onClick={() => {
                    if (onSelectSubmission && submission.submission) {
                      onSelectSubmission(submission.submission);
                    } else {
                      toast.info('Viewing submission details');
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {submission.status === 'draft' ? 'Edit Submission' : 'View Details'}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                  onClick={() => {
                    toast.info('Download feature coming soon!');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </Card>
          </motion.div>
          ))}
        </div>
      )}

    </motion.div>
  );
}
