import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy,
  Calendar,
  Clock,
  Users,
  Target,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Github,
  ExternalLink,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface HackathonDetailsModalProps {
  hackathonId: string;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (hackathonId: string, submissionId?: string) => void;
}

export function HackathonDetailsModal({ hackathonId, isOpen, onClose, onJoin }: HackathonDetailsModalProps) {
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userSubmission, setUserSubmission] = useState<any>(null);

  useEffect(() => {
    if (isOpen && hackathonId) {
      fetchHackathonDetails();
      checkIfJoined();
      fetchUserRole();
    }
  }, [isOpen, hackathonId]);

  const fetchUserRole = async () => {
    try {
      const user = await api.getCurrentUser();
      setUserRole(user.role?.toLowerCase() || '');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchHackathonDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getHackathon(hackathonId);
      setHackathon(data);
    } catch (error: any) {
      toast.error('Failed to load hackathon details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfJoined = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      // Check registration status via participants API
      const participants = await api.getHackathonParticipants(hackathonId);
      const participant = participants.find((p: any) => p.id === currentUser.id);
      const isRegistered = !!participant;
      setHasJoined(isRegistered);
      
      // Check if user has submission
      if (isRegistered && participant.hasSubmission) {
        const submissions = await api.getSubmissions({ hackathonId, userId: currentUser.id });
        setUserSubmission(submissions[0] || null);
      } else {
        setUserSubmission(null);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      // Fallback: check submissions
      try {
        const submissions = await api.getSubmissions({ hackathonId });
        setHasJoined(submissions.length > 0);
        setUserSubmission(submissions[0] || null);
      } catch (e) {
        console.error('Error checking submissions:', e);
      }
    }
  };

  const handleRegister = async () => {
    if (!hackathon) return;
    
    setIsJoining(true);
    try {
      // PHASE 1: REGISTRATION - Register for hackathon
      await api.registerForHackathon(hackathon.id);
      setHasJoined(true);
      toast.success(`Successfully registered for ${hackathon.title}!`);
      await checkIfJoined(); // Refresh status
      
      // Trigger parent component refresh if onJoin callback exists
      if (onJoin) {
        // Small delay to ensure backend has processed the registration
        setTimeout(() => {
          onJoin(hackathon.id, undefined);
        }, 500);
      }
    } catch (error: any) {
      if (error.message?.includes('already')) {
        toast.info('You are already registered for this hackathon!');
        setHasJoined(true);
        await checkIfJoined();
      } else {
        toast.error(error.message || 'Failed to register for hackathon');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handlePublish = async () => {
    if (!hackathon) return;
    try {
      await api.updateHackathonStatus(hackathon.id, 'PUBLISHED');
      toast.success('Hackathon published successfully!');
      await fetchHackathonDetails(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish hackathon');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
      case 'REGISTRATION_OPEN':
      case 'IN_PROGRESS':
      case 'SUBMISSION_OPEN':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-white border-slate-500/50';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category?.replace(/_/g, ' ') || category;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 shadow-2xl flex flex-col" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div className="p-12 text-center flex-shrink-0">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-white">Loading hackathon details...</p>
                </div>
              ) : hackathon ? (
                <>
                  {/* Header - Fixed */}
                  <div className="relative flex-shrink-0">
                    {/* Banner Image */}
                    <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                      {hackathon.bannerImageUrl ? (
                        <img
                          src={hackathon.bannerImageUrl}
                          alt={hackathon.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-24 h-24 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                      
                      {/* Close Button */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                      >
                        <X className="w-5 h-5" />
                      </Button>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={getStatusColor(hackathon.status)}>
                          {hackathon.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {/* Title */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{hackathon.title}</h2>
                        <p className="text-white">by {hackathon.organizer?.firstName} {hackathon.organizer?.lastName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content - Scrollable */}
                  <div 
                    className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 bg-gradient-to-br from-slate-900 to-slate-950"
                    data-scrollable
                    style={{ maxHeight: 'calc(90vh - 350px)', WebkitOverflowScrolling: 'touch' }}
                  >
                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">About</h3>
                      <p className="text-white leading-relaxed">{hackathon.description}</p>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-semibold">Prize</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {hackathon.prizeAmount 
                            ? `${hackathon.prizeCurrency === 'USD' ? '$' : ''}${hackathon.prizeAmount.toLocaleString()}`
                            : 'TBD'}
                        </p>
                      </Card>

                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-semibold">Category</span>
                        </div>
                        <p className="text-xl font-bold text-white">{getCategoryLabel(hackathon.category)}</p>
                      </Card>

                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-green-400" />
                          <span className="text-white font-semibold">Registration</span>
                        </div>
                        <p className="text-sm text-white">
                          {formatDate(hackathon.registrationStart)} - {formatDate(hackathon.registrationEnd)}
                        </p>
                      </Card>

                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-semibold">Hackathon Dates</span>
                        </div>
                        <p className="text-sm text-white">
                          {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                        </p>
                      </Card>

                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-red-400" />
                          <span className="text-white font-semibold">Submission Deadline</span>
                        </div>
                        <p className="text-sm text-white">{formatDate(hackathon.submissionDeadline)}</p>
                      </Card>

                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-5 h-5 text-cyan-400" />
                          <span className="text-white font-semibold">Team Size</span>
                        </div>
                        <p className="text-sm text-white">
                          {hackathon.minTeamSize === hackathon.maxTeamSize
                            ? `${hackathon.minTeamSize} ${hackathon.minTeamSize === 1 ? 'person' : 'people'}`
                            : `${hackathon.minTeamSize}-${hackathon.maxTeamSize} people`}
                          {hackathon.allowIndividual && ' (Individual allowed)'}
                        </p>
                      </Card>
                    </div>

                    {/* Rules & Guidelines */}
                    {(hackathon.rules || hackathon.guidelines) && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {hackathon.rules && (
                          <Card className="p-4 bg-slate-800/50 border-slate-700">
                            <h4 className="text-lg font-bold text-white mb-2">Rules</h4>
                            <p className="text-white text-sm whitespace-pre-line">{hackathon.rules}</p>
                          </Card>
                        )}
                        {hackathon.guidelines && (
                          <Card className="p-4 bg-slate-800/50 border-slate-700">
                            <h4 className="text-lg font-bold text-white mb-2">Guidelines</h4>
                            <p className="text-white text-sm whitespace-pre-line">{hackathon.guidelines}</p>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Requirements */}
                    {hackathon.requirements && (
                      <Card className="p-4 bg-slate-800/50 border-slate-700">
                        <h4 className="text-lg font-bold text-white mb-3">Requirements</h4>
                        <div className="text-white/80 text-sm">
                          {typeof hackathon.requirements === 'string' ? (
                            (() => {
                              try {
                                const req = JSON.parse(hackathon.requirements);
                                return (
                                  <div className="space-y-2">
                                    {req.description && <p>{req.description}</p>}
                                    {req.technologies && Array.isArray(req.technologies) && (
                                      <div>
                                        <p className="font-semibold mb-1">Technologies:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {req.technologies.map((tech: string, i: number) => (
                                            <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                              {tech}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {req.deliverables && Array.isArray(req.deliverables) && (
                                      <div>
                                        <p className="font-semibold mb-1">Deliverables:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {req.deliverables.map((del: string, i: number) => (
                                            <li key={i}>{del}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch {
                                return <p>{hackathon.requirements}</p>;
                              }
                            })()
                          ) : (
                            <p>{JSON.stringify(hackathon.requirements)}</p>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="flex gap-3 p-6 pt-4 border-t border-slate-700 flex-shrink-0 bg-slate-900/50">
                      {/* Show Publish button for organizers if hackathon is DRAFT */}
                      {userRole === 'organizer' && hackathon.status === 'DRAFT' && (
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                          onClick={handlePublish}
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Publish Hackathon
                        </Button>
                      )}
                      
                      {/* Registration/Submission button for participants */}
                      {userRole !== 'organizer' && hackathon && (() => {
                        const now = new Date();
                        const submissionStart = new Date(hackathon.startDate);
                        const submissionEnd = new Date(hackathon.submissionDeadline);
                        const isSubmissionWindowOpen = now >= submissionStart && now <= submissionEnd;
                        const isSubmissionLocked = now > submissionEnd;
                        
                        if (!hasJoined) {
                          // NOT REGISTERED - Show Register button
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={handleRegister}
                              disabled={isJoining || hackathon.status === 'COMPLETED'}
                            >
                              {isJoining ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <Users className="w-5 h-5 mr-2" />
                                  Register
                                </>
                              )}
                            </Button>
                          );
                        } else if (!isSubmissionWindowOpen && now < submissionStart) {
                          // REGISTERED BUT BEFORE SUBMISSION WINDOW
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              disabled
                            >
                              <Clock className="w-5 h-5 mr-2" />
                              Submission Opens Soon
                            </Button>
                          );
                        } else if (isSubmissionWindowOpen && !userSubmission) {
                          // REGISTERED, SUBMISSION WINDOW OPEN, NO SUBMISSION
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={() => {
                                if (onJoin) {
                                  onJoin(hackathon.id, undefined);
                                }
                                onClose();
                              }}
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              Submit Project
                            </Button>
                          );
                        } else if (userSubmission && !isSubmissionLocked) {
                          // HAS SUBMISSION, STILL EDITABLE
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={() => {
                                if (onJoin) {
                                  onJoin(hackathon.id, userSubmission.id);
                                }
                                onClose();
                              }}
                            >
                              <Edit className="w-5 h-5 mr-2" />
                              Edit Submission
                            </Button>
                          );
                        } else if (userSubmission && isSubmissionLocked) {
                          // HAS SUBMISSION, LOCKED
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={() => {
                                if (onJoin) {
                                  onJoin(hackathon.id, userSubmission.id);
                                }
                                onClose();
                              }}
                            >
                              <Eye className="w-5 h-5 mr-2" />
                              View Submission
                            </Button>
                          );
                        } else {
                          // REGISTERED, NO SUBMISSION (fallback)
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={() => {
                                if (onJoin) {
                                  onJoin(hackathon.id, undefined);
                                }
                                onClose();
                              }}
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              Submit Project
                            </Button>
                          );
                        }
                      })()}
                      
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                        onClick={onClose}
                      >
                        Close
                      </Button>
                    </div>

                    {/* Status Messages */}
                    {hackathon.status === 'DRAFT' && userRole !== 'organizer' && (
                      <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <p className="text-sm text-yellow-400">
                          This hackathon is still in draft mode. You can join for testing purposes.
                        </p>
                      </div>
                    )}
                    {hackathon.status === 'DRAFT' && userRole === 'organizer' && (
                      <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-start gap-2 flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-400">
                          This hackathon is in draft mode. Publish it to make it available to participants.
                        </p>
                      </div>
                    )}
                    {hackathon.status === 'COMPLETED' && (
                      <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-start gap-2 flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-400">
                          This hackathon has been completed. Registration is closed.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-white">Failed to load hackathon details</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                    onClick={onClose}
                  >
                    Close
                  </Button>
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

