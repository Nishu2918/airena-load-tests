import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { ArrowRight, Shield, Users, TrendingUp, Bell, FileText, Smartphone, Zap, CheckCircle, Star, Sparkles, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useRef, useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const pricingInView = useInView(pricingRef, { once: true });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Easily add, edit, and track all your members in one centralized dashboard',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Automated WhatsApp notifications for pending and overdue payments',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      icon: FileText,
      title: 'Instant Reports',
      description: 'Export payment data to Excel with customizable date ranges',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.3
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is safe with encrypted storage and backup options',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.4
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Access your dashboard anywhere, anytime on any device',
      gradient: 'from-indigo-500 to-purple-500',
      delay: 0.5
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for instant loading and smooth interactions',
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.6
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Gym Owner',
      image: '👨‍💼',
      content: 'PayTrack Pro has revolutionized how I manage my gym memberships. The automated reminders alone save me hours every week!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Coaching Center Director',
      image: '👩‍💼',
      content: 'The export feature and payment tracking are game-changers. I can now focus on teaching instead of chasing payments.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Co-working Space Manager',
      image: '👨‍💻',
      content: 'Simple, powerful, and exactly what I needed. The WhatsApp integration is brilliant!',
      rating: 5
    }
  ];

  const plans = [
    { duration: '1 Month', price: 1999, popular: false },
    { duration: '3 Months', price: 5997, discount: '5% OFF', popular: true },
    { duration: '6 Months', price: 11994, discount: '10% OFF', popular: false },
    { duration: '12 Months', price: 23988, discount: '15% OFF', popular: false }
  ];

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10
  }));

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />
        
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            x: mousePosition.x / 50,
            y: mousePosition.y / 50
          }}
        />
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: 0,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75"
                />
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.5)',
                      '0 0 60px rgba(139, 92, 246, 0.8)',
                      '0 0 20px rgba(139, 92, 246, 0.5)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"
                >
                  <TrendingUp className="w-7 h-7 text-white" />
                </motion.div>
              </div>
              <span className="text-white text-xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                PayTrack Pro
              </span>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="container mx-auto px-4 pt-20 pb-32">
          <motion.div style={{ y, opacity }} className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={heroInView ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    rotate: [0],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="relative px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-xl border border-white/20 flex items-center gap-2"
                >
                  <motion.div
                    animate={{
                      rotate: [0],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                  <span className="text-white">Admin Payment Management System</span>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight"
            >
              <motion.span
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent inline-block"
                style={{ backgroundSize: '200% auto' }}
              >
                Manage Payments
              </motion.span>
              <br />
              <motion.span
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block"
                style={{ backgroundSize: '200% auto' }}
              >
                Like Never Before
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl text-slate-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The most powerful admin dashboard to track payments, manage members, 
              and automate reminders. Built for modern businesses.
            </motion.p>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-2xl shadow-purple-500/50"
                >
                  Start Free Trial
                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1 }}
              className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-200"
            >
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </motion.div>
                <span className="text-slate-200">No credit card required</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </motion.div>
                <span className="text-slate-200">Setup in 2 minutes</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Dashboard Preview */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={heroInView ? { y: 0, opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-20 relative"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-30"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8">
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i === 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      boxShadow: [
                        '0 10px 30px rgba(99, 102, 241, 0.3)',
                        '0 20px 60px rgba(99, 102, 241, 0.5)',
                        '0 10px 30px rgba(99, 102, 241, 0.3)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4"
                  >
                    <div className="text-slate-200 mb-2">Total Revenue</div>
                    <motion.div 
                      className="text-white text-2xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ₹1.2M
                    </motion.div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      boxShadow: [
                        '0 10px 30px rgba(168, 85, 247, 0.3)',
                        '0 20px 60px rgba(168, 85, 247, 0.5)',
                        '0 10px 30px rgba(168, 85, 247, 0.3)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4"
                  >
                    <div className="text-slate-200 mb-2">Active Members</div>
                    <motion.div 
                      className="text-white text-2xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    >
                      847
                    </motion.div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      boxShadow: [
                        '0 10px 30px rgba(236, 72, 153, 0.3)',
                        '0 20px 60px rgba(236, 72, 153, 0.5)',
                        '0 10px 30px rgba(236, 72, 153, 0.3)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    className="bg-gradient-to-br from-pink-600 to-red-600 rounded-xl p-4"
                  >
                    <div className="text-slate-200 mb-2">Pending</div>
                    <motion.div 
                      className="text-white text-2xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    >
                      23
                    </motion.div>
                  </motion.div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        x: [0, 5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
                          animate={{ rotate: [0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        />
                        <div>
                          <motion.div 
                            className="h-3 w-24 bg-gray-600 rounded mb-2"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <motion.div 
                            className="h-2 w-16 bg-gray-600 rounded"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                          />
                        </div>
                      </div>
                      <motion.div 
                        className="h-3 w-20 bg-green-500 rounded"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={featuresInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-xl border border-white/20"
            >
              <span className="text-white">Powerful Features</span>
            </motion.div>
            <motion.h2 
              className="text-5xl md:text-6xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: '200% auto' }}
            >
              Everything You Need
            </motion.h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              Built with modern technology and designed for maximum efficiency
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={featuresInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="relative group p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                  
                  {/* Animated border */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20`}
                    animate={{
                      backgroundPosition: ['0%', '100%', '0%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ backgroundSize: '200% auto' }}
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 0, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      >
                        <feature.icon className="w-7 h-7 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    <h3 className="text-white text-xl mb-3">{feature.title}</h3>
                    <p className="text-slate-200 leading-relaxed">{feature.description}</p>
                    
                    <motion.div
                      className="mt-4 text-indigo-400 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-indigo-400">Learn more</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <motion.h2 
                className="text-5xl md:text-6xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: '200% auto' }}
              >
                Loved by Businesses
              </motion.h2>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                Join thousands of happy customers managing their payments effortlessly
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-slate-100 mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="text-4xl"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                      >
                        {testimonial.image}
                      </motion.div>
                      <div>
                        <div className="text-white">{testimonial.name}</div>
                        <div className="text-slate-200 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section ref={pricingRef} className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={pricingInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl md:text-6xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: '200% auto' }}
            >
              Simple Pricing
            </motion.h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              Choose the plan that works best for you. No hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={pricingInView ? { y: 0, opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <Card className={`relative p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/20' : ''
                }`}>
                  {plan.popular && (
                    <motion.div
                      animate={{ 
                        y: [0, -5, 0],
                        boxShadow: [
                          '0 10px 30px rgba(99, 102, 241, 0.3)',
                          '0 20px 60px rgba(99, 102, 241, 0.6)',
                          '0 10px 30px rgba(99, 102, 241, 0.3)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                    >
                      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm">
                        Most Popular
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="text-slate-200 mb-2">{plan.duration}</div>
                  <motion.div 
                    className="text-white text-4xl mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    ₹{plan.price.toLocaleString('en-IN')}
                  </motion.div>
                  {plan.discount && (
                    <motion.div 
                      className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm mb-4"
                      animate={{
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 10px rgba(34, 197, 94, 0.3)',
                          '0 0 20px rgba(34, 197, 94, 0.5)',
                          '0 0 10px rgba(34, 197, 94, 0.3)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {plan.discount}
                    </motion.div>
                  )}
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={onGetStarted}
                      className={`w-full mt-4 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                          : 'bg-white/10 hover:bg-white/20'
                      } text-white border-0`}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-32">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: '200% auto' }}
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl"
            />
            
            <div className="relative z-10 text-center py-20 px-6">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
              </motion.div>
              
              <motion.h2 
                className="text-5xl md:text-6xl text-white mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ready to Get Started?
              </motion.h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of businesses already using PayTrack Pro to manage their payments effortlessly
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="text-lg px-10 py-7 bg-white text-indigo-600 hover:bg-gray-100 border-0 shadow-2xl"
                  >
                    Start Your Free Trial
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 backdrop-blur-xl bg-white/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(139, 92, 246, 0.5)',
                        '0 0 40px rgba(139, 92, 246, 0.8)',
                        '0 0 20px rgba(139, 92, 246, 0.5)',
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-white">PayTrack Pro</span>
                </div>
                <p className="text-slate-200 text-sm">
                  The ultimate payment management solution for modern businesses.
                </p>
              </div>
              
              <div>
                <h4 className="text-white mb-4">Product</h4>
                <ul className="space-y-2 text-slate-200 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white mb-4">Company</h4>
                <ul className="space-y-2 text-slate-200 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white mb-4">Support</h4>
                <ul className="space-y-2 text-slate-200 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10 text-center text-slate-200 text-sm">
              <p>© 2025 PayTrack Pro. All rights reserved. | Developed by <a href="https://www.sashai.tech/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">SashAi</a></p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
