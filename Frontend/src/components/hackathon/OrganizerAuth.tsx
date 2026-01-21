import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, Briefcase, Award, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface OrganizerAuthProps {
  onAuthSuccess: (data: any) => void;
  onBack: () => void;
}

export function OrganizerAuth({ onAuthSuccess, onBack }: OrganizerAuthProps) {
  console.log('🔄 OrganizerAuth: Component rendering');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin'); // Tab state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  });

  // Check for pending host request data and pre-fill form (optional now)
  useEffect(() => {
    const pendingRequest = localStorage.getItem('pending_host_request');
    if (pendingRequest) {
      try {
        const requestData = JSON.parse(pendingRequest);
        console.log('🔄 Found pending host request:', requestData);
        
        // Pre-fill form with request data
        setFormData(prev => ({
          ...prev,
          organizationName: requestData.formData?.organizationName || '',
          email: requestData.formData?.contactEmail || '',
          firstName: requestData.formData?.firstName || '',
          lastName: requestData.formData?.lastName || '',
        }));
        
        // Set to signup tab since they're creating a new account
        setActiveTab('signup');
        
        console.log('✅ Host request details loaded and form pre-filled');
      } catch (error) {
        console.error('Error parsing pending request:', error);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'signin') {
        // Login existing organizer
        const response = await api.login(formData.email, formData.password);
        api.setToken(response.accessToken);
        
        // Check if user is organizer
        if (response.user.role.toLowerCase() !== 'organizer') {
          toast.error('This login is for organizers only. Please use the regular login for participants.');
          setLoading(false);
          return;
        }
        
        onAuthSuccess({
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName}`,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role.toLowerCase(),
          status: response.user.status,
          isNewUser: false,
        });
        toast.success('Welcome back!');
      } else {
        // Register new organizer
        const response = await api.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        api.setToken(response.accessToken);
        
        // Automatically set role to organizer
        try {
          await api.updateProfile({ role: 'ORGANIZER' });
          console.log('✅ Role updated to organizer');
          
          // Clear any pending request
          localStorage.removeItem('pending_host_request');
          toast.success('Account created! You can now create hackathons.');
          
          onAuthSuccess({
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: 'organizer',
            status: response.user.status,
            isNewUser: true,
            organizationName: formData.organizationName,
          });
        } catch (error) {
          console.error('Error updating role:', error);
          toast.warning('Account created, but there was an issue setting your role. Please contact support.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
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

        <Card className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-700/50 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {activeTab === 'signin' ? (
                <Briefcase className="w-8 h-8 text-white" />
              ) : (
                <Award className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              {activeTab === 'signin' ? 'Organizer Login' : 'Join as Organizer'}
            </h1>
            <p className="text-white">
              {activeTab === 'signin'
                ? 'Welcome back! Sign in to manage your hackathons.' 
                : 'Create your account to start hosting hackathons.'
              }
            </p>
            
            {/* Pending Request Indicator */}
            {activeTab === 'signup' && typeof window !== 'undefined' && localStorage.getItem('pending_host_request') && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-white">
                  ✅ <strong>Host request details loaded!</strong> Your form has been pre-filled with your request information.
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white font-semibold">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white font-semibold">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="organizationName" className="text-white font-semibold">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Your Company or Organization"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-white font-semibold">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white font-semibold">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  {activeTab === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
          </form>

          {/* Note */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-white">
              <strong>Note:</strong> This is the organizer portal. If you're a participant looking to join hackathons, 
              please use the regular login from the main page.
            </p>
          </div>
        </Card>

        {/* AI Assistant Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
            </motion.div>
            <span className="text-sm text-white">Ready to host amazing hackathons</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}