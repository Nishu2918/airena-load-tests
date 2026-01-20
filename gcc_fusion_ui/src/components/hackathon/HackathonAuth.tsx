import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, ArrowRight, Github, Chrome, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';

interface HackathonAuthProps {
  onAuthSuccess: (userData: any) => void;
  onBack: () => void;
}

export function HackathonAuth({ onAuthSuccess, onBack }: HackathonAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login - go directly to dashboard
        const response = await api.login(formData.email, formData.password);
        api.setToken(response.accessToken);
        onAuthSuccess({
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName}`,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role.toLowerCase(),
          status: response.user.status,
          isNewUser: false, // Existing user logging in
        });
        toast.success('Login successful!');
      } else {
        // Register - go directly to dashboard
        const [firstName, ...lastNameParts] = formData.firstName.split(' ');
        const lastName = lastNameParts.join(' ') || formData.lastName || '';
        
        const response = await api.register({
          email: formData.email,
          password: formData.password,
          firstName: firstName || formData.firstName,
          lastName: lastName,
        });
        api.setToken(response.accessToken);
        onAuthSuccess({
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName}`,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role.toLowerCase(),
          status: response.user.status,
          isNewUser: true, // New user registration
        });
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
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
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button onClick={onBack} className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AIrena
            </span>
          </button>
          <p className="text-white">Join the future of hackathons</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800">
            {/* Toggle */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-800/50 rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md transition-all font-semibold ${
                  isLogin ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' : 'hover:bg-slate-800 text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md transition-all font-semibold ${
                  !isLogin ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' : 'hover:bg-slate-800 text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {!isLogin && (
                  <>
                    <div>
                      <Label htmlFor="firstName" className="text-white font-semibold">First Name</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          className="pl-10 bg-slate-800/50 border-slate-600 focus:border-blue-400 text-white placeholder:text-white/70"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white font-semibold">Last Name</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          className="pl-10 bg-slate-800/50 border-slate-600 focus:border-blue-400 text-white placeholder:text-white/70"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email" className="text-white font-semibold">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-slate-800/50 border-slate-600 focus:border-blue-400 text-white placeholder:text-white/70"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white font-semibold">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-800/50 border-slate-600 focus:border-blue-400 text-white placeholder:text-white/70"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-white">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <button type="button" className="text-blue-400 hover:text-blue-300 font-semibold">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin ? 'Logging in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Login' : 'Create Account'} <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900 text-white">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                  >
                    <Chrome className="w-5 h-5 mr-2" />
                    Google
                  </Button>
                </div>
              </motion.form>
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* AI Assistant Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0, x: 50, y: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="fixed bottom-8 right-8"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 cursor-pointer hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
