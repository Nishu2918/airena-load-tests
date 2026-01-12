import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, User, Building2, ArrowLeft, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { UserData } from '../App';
import { toast } from 'sonner@2.0.3';

interface AuthPageProps {
  onAuthSuccess: (user: UserData) => void;
}

type AuthMode = 'login' | 'signup';
type AuthStep = 'phone' | 'otp' | 'details';

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: ''
  });

  // Dummy OTP (in real app, this would be sent to phone)
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Generate dummy OTP
    const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(dummyOtp);
    
    toast.success(`OTP sent to ${phoneNumber}`, {
      description: `Your OTP is: ${dummyOtp} (This is a demo)`
    });
    
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp !== generatedOtp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }

    if (mode === 'login') {
      // Check if user exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const user = existingUsers.find((u: any) => u.phone === phoneNumber);
      
      if (user) {
        toast.success('Login successful!');
        onAuthSuccess(user);
      } else {
        toast.error('Account not found. Please sign up first.');
        setMode('signup');
        setStep('details');
      }
    } else {
      // Signup - proceed to details
      toast.success('OTP verified!');
      setStep('details');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.businessName) {
      toast.error('Please fill all required fields');
      return;
    }

    const newUser: UserData = {
      name: formData.name,
      email: formData.email,
      phone: phoneNumber,
      businessName: formData.businessName
    };

    // Save to localStorage
    const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(existingUsers));

    toast.success('Account created successfully!');
    onAuthSuccess(newUser);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
    } else if (step === 'details') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4"
            >
              <Smartphone className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-gray-900 mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'otp' && 'Enter the OTP sent to your phone'}
              {step === 'details' && 'Complete your profile'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Phone Number Step */}
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-10"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendOtp}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Send OTP
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {mode === 'login' 
                        ? "Don't have an account? Sign Up" 
                        : 'Already have an account? Login'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-gray-500 mt-2">
                      Sent to +91 {phoneNumber}
                    </p>
                  </div>

                  <Button 
                    onClick={handleVerifyOtp}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Verify OTP
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      onClick={handleSendOtp}
                      variant="outline"
                      className="flex-1"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Details Step (Signup Only) */}
            {step === 'details' && mode === 'signup' && (
              <motion.div
                key="details"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="Enter business name"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Create Account
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Demo Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg text-center"
        >
          <p className="text-gray-600">
            💡 Demo Mode: OTP will be displayed in the notification
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
