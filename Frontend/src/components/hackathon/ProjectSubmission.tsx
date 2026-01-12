import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Github,
  Link,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  Download,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Card3D } from '../ui/Card3D';
import { Button3D } from '../ui/Button3D';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface ProjectSubmissionProps {
  onComplete: () => void;
  hackathonId?: string;
  submissionId?: string; // For editing existing submission
}

export function ProjectSubmission({ onComplete, hackathonId, submissionId }: ProjectSubmissionProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [hackathonData, setHackathonData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    demoLink: '',
    videoUrl: '',
    presentationUrl: '',
  });

  // Load hackathon data
  useEffect(() => {
    if (hackathonId) {
      api.getHackathon(hackathonId)
        .then((hackathon) => {
          setHackathonData(hackathon);
        })
        .catch((error) => {
          console.error('Failed to load hackathon:', error);
          toast.error('Failed to load hackathon details');
        });
    }
  }, [hackathonId]);

  // Load existing submission if editing
  useEffect(() => {
    if (submissionId) {
      api.getSubmission(submissionId).then((submission: any) => {
        setFormData({
          title: submission.title || '',
          description: submission.description || '',
          techStack: '',
          githubLink: submission.repositoryUrl || '',
          demoLink: submission.liveUrl || '',
          videoUrl: submission.videoUrl || '',
          presentationUrl: submission.presentationUrl || '',
        });
        if (submission.files && typeof submission.files === 'string') {
          try {
            const files = JSON.parse(submission.files);
            setFileUrls(Array.isArray(files) ? files : []);
          } catch {
            setFileUrls([]);
          }
        }
      }).catch(console.error);
    }
  }, [submissionId]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Upload files to Backblaze B2 via backend
    for (const file of files) {
      try {
        toast.loading(`Uploading ${file.name}...`, { id: `upload-${file.name}` });
        
        // Upload file to backend (which uploads to Backblaze B2)
        const result = await api.uploadFile(file, 'submissions');
        
        // Store file metadata with actual Backblaze URL
        const fileMetadata = JSON.stringify({
          name: file.name,
          size: result.file.size,
          type: result.file.mimeType,
          uploadedAt: new Date().toISOString(),
          url: result.file.url, // Actual Backblaze B2 URL
          key: result.file.key, // Storage key
        });

        setUploadedFiles(prev => [...prev, file]);
        setFileUrls(prev => [...prev, fileMetadata]);
        
        toast.success(`✅ ${file.name} uploaded successfully!`, { id: `upload-${file.name}` });
        toast.success(`📦 Stored at: ${result.file.url}`, { duration: 5000 });
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`, { id: `upload-${file.name}` });
        console.error('Upload error:', error);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Upload files to Backblaze B2 via backend
    for (const file of files) {
      try {
        toast.loading(`Uploading ${file.name}...`, { id: `upload-${file.name}` });
        
        // Upload file to backend (which uploads to Backblaze B2)
        const result = await api.uploadFile(file, 'submissions');
        
        // Store file metadata with actual Backblaze URL
        const fileMetadata = JSON.stringify({
          name: file.name,
          size: result.file.size,
          type: result.file.mimeType,
          uploadedAt: new Date().toISOString(),
          url: result.file.url, // Actual Backblaze B2 URL
          key: result.file.key, // Storage key
        });

        setUploadedFiles(prev => [...prev, file]);
        setFileUrls(prev => [...prev, fileMetadata]);
        
        toast.success(`✅ ${file.name} uploaded successfully!`, { id: `upload-${file.name}` });
        toast.success(`📦 Stored at: ${result.file.url}`, { duration: 5000 });
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`, { id: `upload-${file.name}` });
        console.error('Upload error:', error);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Validate GitHub URL format
  const isValidGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
    return githubRegex.test(url);
  };

  const handleAnalyze = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description');
      return;
    }
    
    // Move to file upload step (step 2)
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!hackathonId) {
      toast.error('Hackathon ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert file metadata to array for backend
      // Backend expects files as array of objects or JSON string
      const filesArray = fileUrls.length > 0 
        ? fileUrls.map(url => {
            // If it's already a JSON string (metadata), parse it to object
            // Otherwise, create metadata object
            try {
              const parsed = JSON.parse(url);
              // Return as object so backend can stringify the whole array
              return parsed;
            } catch {
              // Not JSON, create metadata object
              return { url, uploadedAt: new Date().toISOString() };
            }
          })
        : [];

      const submissionData = {
        hackathonId,
        title: formData.title,
        description: formData.description,
        repositoryUrl: formData.githubLink || undefined,
        liveUrl: formData.demoLink || undefined,
        // Removed videoUrl and presentationUrl as per user request
        files: filesArray,
        isDraft: false, // Final submission
      };

      // Get current user info for debugging
      const currentUser = await api.getCurrentUser().catch(() => null);
      console.log('👤 Current user when creating submission:', currentUser);
      console.log('📝 Submission data:', { hackathonId, title: formData.title });
      
      if (submissionId) {
        await api.updateSubmission(submissionId, submissionData);
        toast.success('Submission updated successfully!');
      } else {
        console.log('🆕 Creating new submission...');
        console.log('📦 Files being submitted:', filesArray?.length || 0);
        console.log('📦 File URLs:', filesArray);
        
        const result = await api.createSubmission(submissionData);
        console.log('✅ Submission created:', result);
        console.log('✅ Submission ID:', result.id);
        console.log('✅ Submitter ID:', result.submitterId);
        console.log('✅ Submitter Email:', result.submitter?.email);
        
        toast.success('Submission created successfully!');
        toast.success(`Submission ID: ${result.id}`, { duration: 5000 });
      }
      
      setStep(3);
    } catch (error: any) {
      console.error('❌ Submission creation failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        submissionData: submissionData
      });
      toast.error(error.message || 'Failed to submit project');
      toast.error('Check console for details', { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8 perspective-3d">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all transform-3d ${
                    step >= s
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent glow-animated shadow-3d'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                  animate={{
                    scale: step === s ? [1, 1.1, 1] : 1,
                    rotateY: step === s ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 2, repeat: step === s ? Infinity : 0 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {step > s ? <CheckCircle2 className="w-6 h-6 text-white" /> : <span className="font-bold text-white">{s}</span>}
                </motion.div>
                {s < 4 && (
                  <motion.div
                    className={`w-16 h-1 mx-2 rounded transition-all ${
                      step > s ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-700'
                    }`}
                    animate={{
                      scaleX: step > s ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-white font-semibold">
            {step === 1 && 'Project Details'}
            {step === 2 && 'Upload Files'}
            {step === 3 && 'Submit & Track'}
          </p>
        </div>

        <div>
          {/* Step 1: Project Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 text-white">Tell us about your project</h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-white">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="My Awesome Project"
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, the problem it solves, and its impact..."
                      className="mt-2 bg-slate-800/50 border-slate-600 min-h-32 text-white placeholder:text-slate-400"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="techStack" className="text-white">Technology Stack *</Label>
                    <Input
                      id="techStack"
                      placeholder="React, Node.js, MongoDB, etc."
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                      value={formData.techStack}
                      onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button3D
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.description}
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button3D>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Upload Files */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card3D intensity={20}>
                <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                    <h2 className="text-2xl font-bold mb-6 text-white">Upload Your Project Files</h2>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="github" className="text-white">GitHub Repository *</Label>
                      <div className="relative mt-2">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white z-10" />
                        <Input
                          id="github"
                          placeholder="https://github.com/username/repo"
                          className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                          value={formData.githubLink}
                          onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                          required
                        />
                      </div>
                      {formData.githubLink && !isValidGitHubUrl(formData.githubLink) && (
                        <p className="text-xs text-red-400 mt-1">Please enter a valid GitHub repository URL</p>
                      )}
                      <p className="text-xs text-white/70 mt-1">Required: Provide your project's GitHub repository link</p>
                    </div>

                    <div>
                      <Label htmlFor="demo" className="text-white">Live Demo Link</Label>
                      <div className="relative mt-2">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                        <Input
                          id="demo"
                          placeholder="https://your-demo.com"
                          className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                          value={formData.demoLink}
                          onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* File Upload */}
                    <Card3D intensity={15}>
                      <div>
                        <Label className="text-white">Project Files *</Label>
                        <p className="text-xs text-white/70 mb-2">Required: Upload your project files (code, documentation, etc.)</p>
                        <motion.div 
                          className="mt-2 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer glass shadow-3d"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => document.getElementById('file-upload')?.click()}
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10');
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
                          }}
                        >
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.zip,.rar,.7z,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md,.txt,.png,.jpg,.jpeg"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Upload className="w-12 h-12 text-white mx-auto mb-3" />
                          </motion.div>
                          <p className="text-sm text-white mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-white">
                            Code files, PDF, ZIP, or Images (Max 50MB)
                          </p>
                        </motion.div>
                        
                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm text-white/70 mb-2 font-semibold">Uploaded Files ({uploadedFiles.length}):</p>
                            {uploadedFiles.map((file, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                                    <p className="text-xs text-white/70">
                                      {(file.size / 1024).toFixed(2)} KB
                                      {file.type && ` • ${file.type.split('/')[1]?.toUpperCase() || 'FILE'}`}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            ))}
                            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <p className="text-sm text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {uploadedFiles.length} file(s) ready to submit
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card3D>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button3D size="lg" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button3D>
                    <Button3D
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                      onClick={() => {
                        if (!hackathonId) {
                          toast.error('Hackathon ID is required');
                          return;
                        }
                        if (!formData.title || !formData.description) {
                          toast.error('Please fill in title and description first');
                          return;
                        }
                        if (!formData.githubLink) {
                          toast.error('GitHub repository link is required');
                          return;
                        }
                        if (!isValidGitHubUrl(formData.githubLink)) {
                          toast.error('Please enter a valid GitHub repository URL');
                          return;
                        }
                        if (uploadedFiles.length === 0) {
                          toast.error('Please upload at least one project file');
                          return;
                        }
                        // Skip AI review step, go directly to submit
                        setStep(3);
                      }}
                      disabled={!formData.title || !formData.description || !formData.githubLink || uploadedFiles.length === 0}
                    >
                      Continue to Submit <ArrowRight className="w-5 h-5 ml-2" />
                    </Button3D>
                  </div>
                </Card>
              </Card3D>
            </motion.div>
          )}

          {/* Step 3: Submission Complete */}
          {step === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>

                <h2 className="text-3xl font-bold mb-4 text-white">Submission Successful! 🎉</h2>
                <p className="text-white mb-8 max-w-md mx-auto">
                  Your project has been submitted for review. You'll receive email notifications as it progresses through each stage.
                </p>

                {/* Status Timeline */}
                <Card className="p-6 bg-slate-900/50 border-slate-800 mb-8 text-left">
                  <h3 className="font-bold mb-4 text-white">What happens next?</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Submitted', status: 'completed', desc: 'Your project has been received' },
                      { label: 'Review', status: 'current', desc: 'Judges are evaluating your submission' },
                      { label: 'Final Result', status: 'pending', desc: 'Winners will be announced' },
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.status === 'completed'
                              ? 'bg-green-500'
                              : step.status === 'current'
                              ? 'bg-blue-500'
                              : 'bg-slate-700'
                          }`}
                        >
                          {step.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                          {step.status === 'current' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles className="w-4 h-4" /></motion.div>}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{step.label}</p>
                          <p className="text-sm text-white">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Button3D
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                  onClick={onComplete}
                >
                  Go to Dashboard
                </Button3D>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
