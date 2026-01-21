import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Briefcase, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface HostRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNeedAuth?: () => void; // Callback when user needs to authenticate
}

export function HostRequestModal({ isOpen, onClose, onSuccess, onNeedAuth }: HostRequestModalProps) {
  const [step, setStep] = useState(2); // Skip role selection, go directly to request details
  const [selectedRole, setSelectedRole] = useState('organizer'); // Default to organizer role
  const [formData, setFormData] = useState({
    organizationName: '',
    contactEmail: '',
    phoneNumber: '',
    hackathonTitle: '',
    description: '',
    expectedParticipants: '',
    duration: '',
    budget: '',
    experience: '',
    registrationStartDate: '',
    registrationEndDate: '',
    hackathonStartDate: '',
    hackathonEndDate: '',
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'organizer',
      icon: Briefcase,
      title: 'Organizer',
      description: 'Host and manage hackathons for your organization',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // For testing purposes, we'll allow any date combinations
      // In production, you might want to add validation warnings instead of auto-clearing
      
      return newData;
    });
  };

  const handleSubmitRequest = async () => {
    console.log('🚀 handleSubmitRequest called');
    setLoading(true);
    
    // Define roleMap outside try block so it's accessible in catch
    const roleMap: Record<string, string> = {
      'organizer': 'ORGANIZER',
    };
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('🔄 Submitting host request...', { selectedRole, formData });
      console.log('🔑 Auth check:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        token: token ? token.substring(0, 20) + '...' : 'MISSING'
      });
      
      if (!token || !userData) {
        // User is not logged in - this is expected for new organizers
        // Store the request data and proceed to organizer auth
        console.log('🔄 No auth found - proceeding to organizer account creation');
        
        // Store the request data in localStorage for later use
        localStorage.setItem('pending_host_request', JSON.stringify({
          role: selectedRole,
          formData: formData,
          timestamp: new Date().toISOString()
        }));
        
        // Don't show any toast message here - just proceed to auth
        console.log('✅ Request data saved, navigating to organizer auth');
        console.log('🔄 Calling onNeedAuth callback...');
        
        // Add a small delay to ensure the modal closes properly before navigation
        setTimeout(() => {
          if (onNeedAuth) {
            console.log('✅ onNeedAuth callback exists, calling it now');
            onNeedAuth(); // Navigate to organizer auth
          } else {
            console.log('⚠️ onNeedAuth callback not found, using onSuccess fallback');
            onSuccess(); // Fallback
          }
        }, 100);
        return;
      }
      
      // User is already logged in - update their role
      const backendRole = roleMap[selectedRole];
      console.log('🔄 User already logged in - updating role to:', backendRole);
      
      if (backendRole) {
        const result = await api.updateProfile({ role: backendRole });
        console.log('✅ Profile update result:', result);
        
        // Update localStorage with new role
        const userDataObj = JSON.parse(userData);
        userDataObj.role = selectedRole;
        localStorage.setItem('user_data', JSON.stringify(userDataObj));
        
        toast.success(`Request approved! You can now create hackathons as ${selectedRole}.`);
        console.log('✅ Calling onSuccess callback for logged in user');
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Error submitting request:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        selectedRole,
        backendRole: roleMap[selectedRole]
      });
      
      // Handle specific error cases
      if (error.message?.includes('Unauthorized') || error.message?.includes('login')) {
        // Store the request data and proceed to organizer auth
        localStorage.setItem('pending_host_request', JSON.stringify({
          role: selectedRole,
          formData: formData,
          timestamp: new Date().toISOString()
        }));
        
        // Don't show any toast message here - just proceed to auth
        console.log('✅ Request data saved, navigating to organizer auth');
        
        // Add a small delay to ensure the modal closes properly before navigation
        setTimeout(() => {
          if (onNeedAuth) {
            console.log('✅ onNeedAuth callback exists (error case), calling it now');
            onNeedAuth(); // Navigate to organizer auth
          } else {
            console.log('⚠️ onNeedAuth callback not found (error case), using onSuccess fallback');
            onSuccess(); // Fallback
          }
        }, 100);
      } else {
        toast.error(error.message || 'Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Request to Host Hackathons</h2>
              <p className="text-white mt-1">Join our community of hackathon organizers and judges</p>
            </div>
            <Button
              size="sm"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white">
                ✓
              </div>
              <div className="w-16 h-1 bg-blue-500" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between text-sm text-white">
              <span>Organizer Role</span>
              <span>Request Details</span>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">What role are you interested in?</h3>
                <p className="text-white">Choose the role that best fits your goals</p>
              </div>

              <div className="grid gap-4">
                {roles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-6 cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/25'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                          <role.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white">{role.title}</h4>
                          <p className="text-white text-sm">{role.description}</p>
                        </div>
                        {selectedRole === role.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                disabled={!selectedRole}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Simple Request Form */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Request to Host Hackathons</h3>
                <p className="text-white">Tell us a bit about yourself and your organization</p>
              </div>

              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orgName" className="text-white font-semibold">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="Your company or organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white font-semibold">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-white font-semibold">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-white font-semibold">Experience Level</Label>
                    <select
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white"
                    >
                      <option value="">Select experience</option>
                      <option value="beginner">First time organizing</option>
                      <option value="intermediate">1-3 hackathons organized</option>
                      <option value="advanced">4+ hackathons organized</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white font-semibold">
                    Why do you want to host hackathons?
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white min-h-[100px]"
                    placeholder="Tell us about your goals, target audience, and why you want to organize hackathons..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                  onClick={handleSubmitRequest}
                  disabled={loading || !formData.organizationName || !formData.contactEmail}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>What happens next:</strong><br/>
                  • Your request will be reviewed (auto-approved for now)<br/>
                  • You'll create your organizer account<br/>
                  • Once approved, you can create and manage hackathons<br/>
                  • You'll have access to participant management and analytics
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}