import React, { useState } from 'react';
import { Plus, Upload, Loader2, Award, X, MapPin, Calendar, Target, Scale, Phone, Mail, User, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';

// Create Hackathon Form Component
export function CreateHackathonForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingProblemStatement, setUploadingProblemStatement] = useState(false);
    const [formData, setFormData] = useState({
      // Basic Information
      title: '',
      problemStatementUrl: '',
      whyParticipate: '',
      category: 'WEB_DEVELOPMENT',
      
      // Problem Statement Tracks (up to 5)
      problemStatementTracks: [] as Array<{
        trackNumber: number;
        trackTitle: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        description?: string;
      }>,
      numberOfTracks: 1, // New field to control how many tracks to show
      
      // Timeline & Dates
      registrationStart: '',
      registrationEnd: '',
      startDate: '',
      endDate: '',
      submissionDeadline: '',
      
      // Financial & Team Details
      registrationFee: '',
      prizeCurrency: 'USD',
      prizeAmount: '',
      minTeamSize: 1,
      maxTeamSize: 5,
      allowIndividual: true,
      
      // Venue & Location
      venue: '',
      isVirtual: false,
      
      // Timeline/Roadmap
      timeline: [] as Array<{
        phase: string;
        description: string;
        startDate: string;
        endDate: string;
      }>,
      
      // Outcomes & Judging
      expectedOutcome: '',
      judgingCriteria: [] as Array<{
        criterion: string;
        description: string;
        weight: number;
      }>,
      
      // Legal & Contact
      termsAndConditions: '',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
      
      // Technical Details (keeping existing)
      requirements: { description: '', technologies: [], deliverables: [] },
      rules: '',
      guidelines: '',
      bannerImageUrl: '',
      logoImageUrl: '',
      
      // Judges (keeping existing)
      judges: [] as Array<{
        name: string;
        email: string;
        bio: string;
        expertise: string;
        linkedinUrl?: string;
        profileImageUrl?: string;
      }>,
    });
  
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setUploadingBanner(true);
      try {
        toast.loading('Uploading banner image...', { id: 'banner-upload' });
        const result = await api.uploadFile(file, 'hackathons/banners');
        setFormData({ ...formData, bannerImageUrl: result.file.url });
        toast.success('Banner image uploaded successfully!', { id: 'banner-upload' });
      } catch (error: any) {
        toast.error(`Failed to upload banner: ${error.message}`, { id: 'banner-upload' });
        console.error('Banner upload error:', error);
      } finally {
        setUploadingBanner(false);
      }
    };
    
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size must be less than 5MB');
        return;
      }
      
      setUploadingLogo(true);
      try {
        toast.loading('Uploading logo...', { id: 'logo-upload' });
        const result = await api.uploadFile(file, 'hackathons/logos');
        setFormData({ ...formData, logoImageUrl: result.file.url });
        toast.success('Logo uploaded successfully!', { id: 'logo-upload' });
      } catch (error: any) {
        toast.error(`Failed to upload logo: ${error.message}`, { id: 'logo-upload' });
        console.error('Logo upload error:', error);
      } finally {
        setUploadingLogo(false);
      }
    };

    const handleProblemStatementUpload = async (e: React.ChangeEvent<HTMLInputElement>, trackNumber: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid document file (PPT, Word, Excel, or PDF)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Document size must be less than 10MB');
        return;
      }
      
      setUploadingProblemStatement(true);
      try {
        toast.loading(`Uploading problem statement for Track ${trackNumber}...`, { id: `problem-statement-upload-${trackNumber}` });
        const result = await api.uploadFile(file, 'hackathons/problem-statements');
        
        // Update the specific track
        const updatedTracks = [...formData.problemStatementTracks];
        const existingTrackIndex = updatedTracks.findIndex(t => t.trackNumber === trackNumber);
        
        const trackData = {
          trackNumber,
          trackTitle: `Track ${trackNumber}`,
          fileName: file.name,
          fileUrl: result.file.url,
          fileType: file.type,
          fileSize: file.size,
          description: '',
        };
        
        if (existingTrackIndex >= 0) {
          updatedTracks[existingTrackIndex] = trackData;
        } else {
          updatedTracks.push(trackData);
        }
        
        setFormData({ ...formData, problemStatementTracks: updatedTracks });
        toast.success(`Problem statement for Track ${trackNumber} uploaded successfully!`, { id: `problem-statement-upload-${trackNumber}` });
      } catch (error: any) {
        toast.error(`Failed to upload Track ${trackNumber}: ${error.message}`, { id: `problem-statement-upload-${trackNumber}` });
        console.error('Problem statement upload error:', error);
      } finally {
        setUploadingProblemStatement(false);
      }
    };

    const updateTrackTitle = (trackNumber: number, title: string) => {
      const updatedTracks = [...formData.problemStatementTracks];
      const trackIndex = updatedTracks.findIndex(t => t.trackNumber === trackNumber);
      
      if (trackIndex >= 0) {
        updatedTracks[trackIndex].trackTitle = title;
        setFormData({ ...formData, problemStatementTracks: updatedTracks });
      }
    };

    const updateTrackDescription = (trackNumber: number, description: string) => {
      const updatedTracks = [...formData.problemStatementTracks];
      const trackIndex = updatedTracks.findIndex(t => t.trackNumber === trackNumber);
      
      if (trackIndex >= 0) {
        updatedTracks[trackIndex].description = description;
        setFormData({ ...formData, problemStatementTracks: updatedTracks });
      }
    };

    const removeTrack = (trackNumber: number) => {
      const updatedTracks = formData.problemStatementTracks.filter(t => t.trackNumber !== trackNumber);
      setFormData({ ...formData, problemStatementTracks: updatedTracks });
    };

    const addJudge = () => {
      setFormData({
        ...formData,
        judges: [
          ...formData.judges,
          {
            name: '',
            email: '',
            bio: '',
            expertise: '',
            linkedinUrl: '',
            profileImageUrl: '',
          },
        ],
      });
    };

    const removeJudge = (index: number) => {
      setFormData({
        ...formData,
        judges: formData.judges.filter((_, i) => i !== index),
      });
    };

    const updateJudge = (index: number, field: string, value: string) => {
      const updatedJudges = [...formData.judges];
      updatedJudges[index] = { ...updatedJudges[index], [field]: value };
      setFormData({ ...formData, judges: updatedJudges });
    };

    const addTimelinePhase = () => {
      setFormData({
        ...formData,
        timeline: [
          ...formData.timeline,
          {
            phase: '',
            description: '',
            startDate: '',
            endDate: '',
          },
        ],
      });
    };

    const removeTimelinePhase = (index: number) => {
      setFormData({
        ...formData,
        timeline: formData.timeline.filter((_, i) => i !== index),
      });
    };

    const updateTimelinePhase = (index: number, field: string, value: string) => {
      const updatedTimeline = [...formData.timeline];
      updatedTimeline[index] = { ...updatedTimeline[index], [field]: value };
      setFormData({ ...formData, timeline: updatedTimeline });
    };

    const addJudgingCriterion = () => {
      setFormData({
        ...formData,
        judgingCriteria: [
          ...formData.judgingCriteria,
          {
            criterion: '',
            description: '',
            weight: 0,
          },
        ],
      });
    };

    const removeJudgingCriterion = (index: number) => {
      setFormData({
        ...formData,
        judgingCriteria: formData.judgingCriteria.filter((_, i) => i !== index),
      });
    };

    const updateJudgingCriterion = (index: number, field: string, value: string | number) => {
      const updatedCriteria = [...formData.judgingCriteria];
      updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
      setFormData({ ...formData, judgingCriteria: updatedCriteria });
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        // Verify user role before creating
        const currentUser = await api.getCurrentUser();
        if (currentUser.role !== 'ORGANIZER' && currentUser.role !== 'ADMIN') {
          toast.error('You need ORGANIZER role to create hackathons. Please update your role in Profile Settings.');
          setLoading(false);
          return;
        }

        // Validate required problem statement tracks
        if (!formData.problemStatementTracks || formData.problemStatementTracks.length === 0) {
          toast.error('Please upload at least one problem statement track.');
          setLoading(false);
          return;
        }

        // Validate that all selected tracks have been uploaded
        const uploadedTracks = formData.problemStatementTracks.length;
        if (uploadedTracks < formData.numberOfTracks) {
          toast.error(`Please upload all ${formData.numberOfTracks} problem statement tracks.`);
          setLoading(false);
          return;
        }
  
        // Convert datetime-local to ISO string format
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          // datetime-local format is YYYY-MM-DDTHH:mm, convert to ISO
          return new Date(dateString).toISOString();
        };
  
        const hackathonData = {
          ...formData,
          registrationStart: formatDate(formData.registrationStart),
          registrationEnd: formatDate(formData.registrationEnd),
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
          submissionDeadline: formatDate(formData.submissionDeadline),
          prizeAmount: formData.prizeAmount ? parseFloat(formData.prizeAmount) : undefined,
          registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : undefined,
          minTeamSize: formData.minTeamSize || 1,
          maxTeamSize: formData.maxTeamSize || 5,
        };
  
        await api.createHackathon(hackathonData);
        toast.success('Hackathon created successfully! You can publish it from the dashboard.');
        onSuccess();
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create hackathon';
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          toast.error('You need ORGANIZER role to create hackathons. Please update your role in Profile Settings.');
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* 1. Name of the Hackathon */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-400" />
            Hackathon Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-white font-semibold">Hackathon Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., AI Innovation Challenge 2024"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-white font-semibold">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                required
              >
                <option value="WEB_DEVELOPMENT">Web Development</option>
                <option value="MOBILE_DEVELOPMENT">Mobile Development</option>
                <option value="AI_ML">AI/ML</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="CYBERSECURITY">Cybersecurity</option>
                <option value="GAME_DEVELOPMENT">Game Development</option>
                <option value="BLOCKCHAIN">Blockchain</option>
                <option value="IOT">IoT</option>
                <option value="OPEN_INNOVATION">Open Innovation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. About the Hackathon - Problem Statement Tracks */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Problem Statement Tracks</h3>
          <p className="text-white/90 mb-4">Upload problem statement tracks for participants to choose from.</p>
          
          {/* Number of Tracks Selector */}
          <div className="mb-6">
            <Label className="text-white font-semibold mb-2 block">Number of Tracks</Label>
            <select
              value={formData.numberOfTracks}
              onChange={(e) => {
                const newNumber = parseInt(e.target.value);
                // Remove tracks that exceed the new number
                const filteredTracks = formData.problemStatementTracks.filter(t => t.trackNumber <= newNumber);
                setFormData({ 
                  ...formData, 
                  numberOfTracks: newNumber,
                  problemStatementTracks: filteredTracks
                });
              }}
              className="bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num} Track{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/70 mt-1">Select how many problem statement tracks you want to create</p>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: formData.numberOfTracks }, (_, index) => {
              const trackNumber = index + 1;
              const existingTrack = formData.problemStatementTracks.find(t => t.trackNumber === trackNumber);
              
              return (
                <div key={trackNumber} className="border border-slate-600 rounded-lg p-4 bg-slate-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">Track {trackNumber}</h4>
                    {existingTrack && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => removeTrack(trackNumber)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {existingTrack ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white font-semibold">Track Title</Label>
                        <Input
                          value={existingTrack.trackTitle}
                          onChange={(e) => updateTrackTitle(trackNumber, e.target.value)}
                          placeholder={`Track ${trackNumber} Title`}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder-white/60"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white font-semibold">Description (Optional)</Label>
                        <Input
                          value={existingTrack.description || ''}
                          onChange={(e) => updateTrackDescription(trackNumber, e.target.value)}
                          placeholder="Brief description of this track..."
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder-white/60"
                        />
                      </div>
                      
                      <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                        <p className="text-sm text-green-400 mb-1">✓ Document uploaded successfully</p>
                        <p className="text-xs text-white/80 mb-2">{existingTrack.fileName}</p>
                        <a 
                          href={existingTrack.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          View uploaded document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor={`problemStatement-${trackNumber}`} 
                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center py-3">
                          <Upload className="w-5 h-5 mb-1 text-slate-300" />
                          <p className="text-sm text-slate-300">
                            <span className="font-semibold">Upload</span> Track {trackNumber}
                          </p>
                          <p className="text-xs text-slate-300">PPT, Word, Excel, PDF (MAX. 10MB)</p>
                        </div>
                        <input 
                          id={`problemStatement-${trackNumber}`}
                          type="file" 
                          className="hidden" 
                          accept=".ppt,.pptx,.doc,.docx,.xls,.xlsx,.pdf"
                          onChange={(e) => handleProblemStatementUpload(e, trackNumber)}
                          disabled={uploadingProblemStatement}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-white/70 mt-3">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Participants will select one track during registration. At least one track is required.
          </p>
        </div>

        {/* 3. Why Participate */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Why Participate</h3>
          <div>
            <Label htmlFor="whyParticipate" className="text-white font-semibold">Benefits & Motivation *</Label>
            <textarea
              id="whyParticipate"
              value={formData.whyParticipate}
              onChange={(e) => setFormData({ ...formData, whyParticipate: e.target.value })}
              rows={4}
              placeholder="Explain the benefits, learning opportunities, networking, prizes, and career advantages..."
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 4. Registration Fees & 5. Team Size */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Registration & Team Details</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="registrationFee" className="text-white font-semibold">Registration Fee</Label>
              <Input
                id="registrationFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.registrationFee}
                onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                placeholder="e.g., 10.00 (0 for free)"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="minTeamSize" className="text-white font-semibold">Min Team Size *</Label>
              <Input
                id="minTeamSize"
                type="number"
                min="1"
                value={formData.minTeamSize}
                onChange={(e) => setFormData({ ...formData, minTeamSize: parseInt(e.target.value) || 1 })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="maxTeamSize" className="text-white font-semibold">Max Team Size *</Label>
              <Input
                id="maxTeamSize"
                type="number"
                min="1"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) || 5 })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={formData.allowIndividual}
                onChange={(e) => setFormData({ ...formData, allowIndividual: e.target.checked })}
                className="rounded border-slate-600 bg-slate-800"
              />
              Allow individual participation
            </label>
          </div>
        </div>

        {/* 6. Venue */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Venue
          </h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-white mb-4">
                <input
                  type="checkbox"
                  checked={formData.isVirtual}
                  onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800"
                />
                Virtual Event
              </label>
            </div>
            <div>
              <Label htmlFor="venue" className="text-white font-semibold">
                {formData.isVirtual ? 'Platform/Link *' : 'Venue Address *'}
              </Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder={formData.isVirtual ? "e.g., Zoom, Discord, or platform link" : "e.g., Tech Hub, 123 Innovation Street, City"}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* 7. Timeline (Dates) */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Timeline & Important Dates
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="registrationStart" className="text-white font-semibold">Registration Start *</Label>
              <Input
                id="registrationStart"
                type="datetime-local"
                value={formData.registrationStart}
                onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="registrationEnd" className="text-white font-semibold">Registration End *</Label>
              <Input
                id="registrationEnd"
                type="datetime-local"
                value={formData.registrationEnd}
                onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="startDate" className="text-white font-semibold">Hackathon Start *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-white font-semibold">Hackathon End *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="submissionDeadline" className="text-white font-semibold">Submission Deadline *</Label>
              <Input
                id="submissionDeadline"
                type="datetime-local"
                value={formData.submissionDeadline}
                onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="prizeAmount" className="text-white font-semibold">Prize Amount</Label>
              <Input
                id="prizeAmount"
                type="number"
                value={formData.prizeAmount}
                onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                placeholder="e.g., 50000"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Timeline Roadmap */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Detailed Timeline/Roadmap</h4>
            <Button
              type="button"
              onClick={addTimelinePhase}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>
          
          {formData.timeline.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-white mb-2">No timeline phases added yet</p>
              <p className="text-slate-300 text-sm">Add phases like "Registration", "Development", "Judging", etc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.timeline.map((phase, index) => (
                <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-semibold">Phase {index + 1}</h5>
                    <Button
                      type="button"
                      onClick={() => removeTimelinePhase(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-white font-medium">Phase Name *</Label>
                      <Input
                        value={phase.phase}
                        onChange={(e) => updateTimelinePhase(index, 'phase', e.target.value)}
                        placeholder="e.g., Registration, Development, Judging"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Description *</Label>
                      <Input
                        value={phase.description}
                        onChange={(e) => updateTimelinePhase(index, 'description', e.target.value)}
                        placeholder="Brief description of this phase"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white font-medium">Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={phase.startDate}
                        onChange={(e) => updateTimelinePhase(index, 'startDate', e.target.value)}
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">End Date</Label>
                      <Input
                        type="datetime-local"
                        value={phase.endDate}
                        onChange={(e) => updateTimelinePhase(index, 'endDate', e.target.value)}
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Expected Outcome */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            Expected Outcome
          </h3>
          <div>
            <Label htmlFor="expectedOutcome" className="text-white font-semibold">What should participants achieve? *</Label>
            <textarea
              id="expectedOutcome"
              value={formData.expectedOutcome}
              onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
              rows={4}
              placeholder="Describe the expected deliverables, prototypes, solutions, or innovations participants should create..."
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 9. Judging Criteria */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-400" />
              Judging Criteria
            </h3>
            <Button
              type="button"
              onClick={addJudgingCriterion}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </div>
          
          {formData.judgingCriteria.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
              <Scale className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-white mb-2">No judging criteria added yet</p>
              <p className="text-slate-400 text-sm">Add criteria like "Innovation", "Technical Implementation", "User Experience", etc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.judgingCriteria.map((criterion, index) => (
                <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-semibold">Criterion {index + 1}</h5>
                    <Button
                      type="button"
                      onClick={() => removeJudgingCriterion(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white font-medium">Criterion Name *</Label>
                      <Input
                        value={criterion.criterion}
                        onChange={(e) => updateJudgingCriterion(index, 'criterion', e.target.value)}
                        placeholder="e.g., Innovation, Technical Quality"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Weight (%) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(e) => updateJudgingCriterion(index, 'weight', parseInt(e.target.value) || 0)}
                        placeholder="e.g., 25"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Description *</Label>
                      <Input
                        value={criterion.description}
                        onChange={(e) => updateJudgingCriterion(index, 'description', e.target.value)}
                        placeholder="What will be evaluated"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Judges Section (keeping existing) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-400" />
              Judges
            </h3>
            <Button
              type="button"
              onClick={addJudge}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Judge
            </Button>
          </div>
          
          {formData.judges.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-white mb-2">No judges added yet</p>
              <p className="text-slate-400 text-sm">Add judges who will evaluate the submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.judges.map((judge, index) => (
                <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Judge {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeJudge(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white font-medium">Name *</Label>
                      <Input
                        value={judge.name}
                        onChange={(e) => updateJudge(index, 'name', e.target.value)}
                        placeholder="Judge's full name"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Email *</Label>
                      <Input
                        type="email"
                        value={judge.email}
                        onChange={(e) => updateJudge(index, 'email', e.target.value)}
                        placeholder="judge@example.com"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-white font-medium">Expertise *</Label>
                    <Input
                      value={judge.expertise}
                      onChange={(e) => updateJudge(index, 'expertise', e.target.value)}
                      placeholder="e.g., AI/ML, Web Development, Product Management"
                      className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-white font-medium">Bio *</Label>
                    <textarea
                      value={judge.bio}
                      onChange={(e) => updateJudge(index, 'bio', e.target.value)}
                      rows={3}
                      placeholder="Brief bio about the judge's background and experience..."
                      className="mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-white font-medium">LinkedIn URL</Label>
                      <Input
                        type="url"
                        value={judge.linkedinUrl}
                        onChange={(e) => updateJudge(index, 'linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Profile Image URL</Label>
                      <Input
                        type="url"
                        value={judge.profileImageUrl}
                        onChange={(e) => updateJudge(index, 'profileImageUrl', e.target.value)}
                        placeholder="https://example.com/profile.jpg"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 10. Terms and Conditions */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Terms and Conditions</h3>
          <div>
            <Label htmlFor="termsAndConditions" className="text-white font-semibold">Terms & Conditions *</Label>
            <textarea
              id="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              rows={6}
              placeholder="Enter the terms and conditions, rules, intellectual property rights, code of conduct, etc..."
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 11. Contact Information */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contactPerson" className="text-white font-semibold">Contact Person *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Full name of contact person"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactEmail" className="text-white font-semibold">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@organization.com"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-white font-semibold">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Additional Details</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="rules" className="text-white font-semibold">Rules & Guidelines *</Label>
              <textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                rows={3}
                placeholder="List key rules, submission guidelines, and participation requirements..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <Label htmlFor="guidelines" className="text-white font-semibold">Technical Guidelines</Label>
              <textarea
                id="guidelines"
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                rows={3}
                placeholder="Technical requirements, allowed technologies, submission format, etc..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bannerImage" className="text-white font-semibold">Banner Image</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="bannerImage"
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-white text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-sm">Upload Banner Image</span>
                      </>
                    )}
                  </div>
                  <input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={uploadingBanner}
                  />
                </label>
              </div>
              {formData.bannerImageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.bannerImageUrl} 
                    alt="Banner preview" 
                    className="w-full h-32 object-cover rounded-md border border-slate-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFormData({ ...formData, bannerImageUrl: '' })}
                    className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                  >
                    Remove Banner
                  </Button>
                </div>
              )}
              <p className="text-xs text-white">Or enter URL below</p>
              <Input
                id="bannerImageUrl"
                type="url"
                value={formData.bannerImageUrl}
                onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="logoImage" className="text-white font-semibold">Logo Image</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="logoImage"
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-white text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-sm">Upload Logo</span>
                      </>
                    )}
                  </div>
                  <input
                    id="logoImage"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              {formData.logoImageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.logoImageUrl} 
                    alt="Logo preview" 
                    className="w-24 h-24 object-contain rounded-md border border-slate-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logoImageUrl: '' })}
                    className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                  >
                    Remove Logo
                  </Button>
                </div>
              )}
              <p className="text-xs text-white">Or enter URL below</p>
              <Input
                id="logoImageUrl"
                type="url"
                value={formData.logoImageUrl}
                onChange={(e) => setFormData({ ...formData, logoImageUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Hackathon
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border-2 border-slate-600 hover:bg-slate-800 text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }
  