import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Trophy,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
  Star,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Card3D } from '../ui/Card3D';
import { Button3D } from '../ui/Button3D';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { HackathonDetailsModal } from './HackathonDetailsModal';

interface ExploreHackathonsProps {
  onBack: () => void;
}

export function ExploreHackathons({ onBack }: ExploreHackathonsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [categories, setCategories] = useState([
    { id: 'all', label: 'All', count: 0 },
    { id: 'WEB_DEVELOPMENT', label: 'Web Development', count: 0 },
    { id: 'MOBILE_DEVELOPMENT', label: 'Mobile', count: 0 },
    { id: 'AI_ML', label: 'AI/ML', count: 0 },
    { id: 'BLOCKCHAIN', label: 'Blockchain', count: 0 },
    { id: 'DATA_SCIENCE', label: 'Data Science', count: 0 },
    { id: 'IOT', label: 'IoT', count: 0 },
  ]);

  useEffect(() => {
    fetchHackathons();
  }, [selectedCategory, searchQuery]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const data = await api.getHackathons(filters);
      setHackathons(data || []);
      
      // Update category counts
      const categoryCounts: Record<string, number> = {};
      data.forEach((h: any) => {
        categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
      });
      
      setCategories(prev => prev.map(cat => ({
        ...cat,
        count: cat.id === 'all' ? data.length : (categoryCounts[cat.id] || 0)
      })));
    } catch (error: any) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to load hackathons');
      setHackathons([]);
    } finally {
      setLoading(false);
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
      case 'REGISTRATION_CLOSED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'COMPLETED':
      case 'CANCELLED':
        return 'bg-slate-500/20 text-white border-slate-500/50';
      default:
        return 'bg-slate-500/20 text-white border-slate-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatPrize = (amount: number | null, currency: string = 'USD') => {
    if (!amount) return 'TBD';
    return `${currency === 'USD' ? '$' : ''}${amount.toLocaleString()}`;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            size="sm"
            onClick={onBack}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-white">Explore Hackathons</h1>
          <p className="text-white">Discover and join exciting competitions worldwide</p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <Input
              placeholder="Search hackathons..."
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 cursor-pointer transition-all whitespace-nowrap font-semibold ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600'
                }`}
              >
                {category.label} ({category.count})
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-white">Loading hackathons...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && hackathons.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold text-white mb-2">No hackathons found</h3>
            <p className="text-white/70 mb-6">Be the first to create a hackathon!</p>
            <Button3D 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
              onClick={onBack}
            >
              Go Back
            </Button3D>
          </div>
        )}

        {/* Featured Section */}
        {!loading && hackathons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Hackathons</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 perspective-3d">
              {hackathons
                .filter((h) => h.status === 'PUBLISHED' || h.status === 'REGISTRATION_OPEN')
                .slice(0, 2)
                .map((hackathon, index) => (
                <Card3D key={hackathon.id} intensity={25} flipOnHover={false}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all h-full glass shadow-3d-lg">
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                      {hackathon.bannerImageUrl && (
                        <img
                          src={hackathon.bannerImageUrl}
                          alt={hackathon.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1 text-white">{hackathon.title}</h3>
                          <p className="text-sm text-white">by {hackathon.organizer?.firstName || 'Organizer'}</p>
                        </div>
                        <Badge className={getStatusColor(hackathon.status)}>
                          {hackathon.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-white text-sm mb-4 line-clamp-2">{hackathon.description}</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">Prize: </span>
                          <span className="font-semibold text-white">{formatPrize(hackathon.prizeAmount, hackathon.prizeCurrency)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-white">Category: </span>
                          <span className="font-semibold text-white">{getCategoryLabel(hackathon.category)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span className="text-white">Deadline: </span>
                          <span className="font-semibold text-white">
                            {formatDate(hackathon.submissionDeadline || hackathon.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-white">Starts: </span>
                          <span className="font-semibold text-white">{formatDate(hackathon.startDate)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button3D 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                          onClick={() => {
                            setSelectedHackathonId(hackathon.id);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          View Details <ArrowRight className="w-4 h-4 ml-2" />
                        </Button3D>
                        {['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN'].includes(hackathon.status) && (
                          <Button3D 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                            onClick={async () => {
                              try {
                                const submissions = await api.getSubmissions({ hackathonId: hackathon.id });
                                if (submissions.length > 0) {
                                  toast.info('You have already joined this hackathon!');
                                  return;
                                }
                                await api.createSubmission({
                                  hackathonId: hackathon.id,
                                  title: `My submission for ${hackathon.title}`,
                                  description: 'Draft submission - work in progress',
                                  isDraft: true,
                                });
                                toast.success(`Successfully joined ${hackathon.title}!`);
                              } catch (error: any) {
                                if (error.message?.includes('already')) {
                                  toast.info('You have already joined this hackathon!');
                                } else {
                                  toast.error(error.message || 'Failed to join hackathon');
                                }
                              }
                            }}
                          >
                            Join
                          </Button3D>
                        )}
                      </div>
                    </div>
                  </Card>
                  </motion.div>
                </Card3D>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Hackathons */}
        {!loading && hackathons.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">All Hackathons</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-3d">
              {hackathons.map((hackathon, index) => (
              <Card3D key={hackathon.id} intensity={20}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all h-full flex flex-col glass shadow-3d">
                  <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
                    {hackathon.bannerImageUrl && (
                      <img
                        src={hackathon.bannerImageUrl}
                        alt={hackathon.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className={getStatusColor(hackathon.status)}>
                        {hackathon.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="font-bold mb-1 line-clamp-1 text-white">{hackathon.title}</h3>
                      <p className="text-xs text-white">{hackathon.organizer?.firstName || 'Organizer'}</p>
                    </div>
                    <p className="text-sm text-white mb-4 line-clamp-2 flex-1">
                      {hackathon.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Prize
                        </span>
                        <span className="font-semibold text-yellow-400">{formatPrize(hackathon.prizeAmount, hackathon.prizeCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline
                        </span>
                        <span className="font-semibold text-white">{formatDate(hackathon.submissionDeadline || hackathon.endDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Starts
                        </span>
                        <span className="font-semibold text-white">{formatDate(hackathon.startDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge className="bg-slate-800 text-white" size="sm">
                        {getCategoryLabel(hackathon.category)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button3D
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                        onClick={() => {
                          setSelectedHackathonId(hackathon.id);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        View Details <ArrowRight className="w-3 h-3 ml-2" />
                      </Button3D>
                      {['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN'].includes(hackathon.status) && (
                        <Button3D
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                          onClick={async () => {
                            try {
                              const submissions = await api.getSubmissions({ hackathonId: hackathon.id });
                              if (submissions.length > 0) {
                                toast.info('You have already joined this hackathon!');
                                return;
                              }
                              await api.createSubmission({
                                hackathonId: hackathon.id,
                                title: `My submission for ${hackathon.title}`,
                                description: 'Draft submission - work in progress',
                                isDraft: true,
                              });
                              toast.success(`Successfully joined ${hackathon.title}!`);
                            } catch (error: any) {
                              if (error.message?.includes('already')) {
                                toast.info('You have already joined this hackathon!');
                              } else {
                                toast.error(error.message || 'Failed to join hackathon');
                              }
                            }
                          }}
                        >
                          Join
                        </Button3D>
                      )}
                    </div>
                  </div>
                </Card>
                </motion.div>
              </Card3D>
              ))}
            </div>
          </div>
        )}

        {/* Hackathon Details Modal */}
        {selectedHackathonId && (
          <HackathonDetailsModal
            hackathonId={selectedHackathonId}
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedHackathonId(null);
            }}
            onJoin={() => {
              setIsDetailsModalOpen(false);
              setSelectedHackathonId(null);
              fetchHackathons(); // Refresh list
            }}
          />
        )}
      </div>
    </div>
  );
}
