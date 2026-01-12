import { motion } from 'motion/react';
import { Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Card3D } from './ui/Card3D';
import { Button3D } from './ui/Button3D';
import type { AppPage } from '../App';

interface AppLauncherProps {
  onSelectApp: (page: AppPage) => void;
}

export function AppLauncher({ onSelectApp }: AppLauncherProps) {
  const app = {
    id: 'hackathon' as AppPage,
    title: 'AIrena',
    description: 'Modern hackathon platform with AI-powered reviews, real-time feedback, and global competitions',
    icon: Trophy,
    color: 'from-purple-500 to-pink-500',
    features: ['AI Mentor', 'Project Submission', 'Leaderboards', 'Verified Certificates'],
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

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-9 h-9" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GCC FUSION</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Your modern hackathon platform powered by AI
          </p>
        </motion.div>

        {/* App Card */}
        <div className="max-w-2xl mx-auto">
          <Card3D intensity={20}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full flex flex-col hover:border-purple-500/50 transition-all glass shadow-3d-lg">
                {/* Icon */}
                <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center glow-animated`}>
                  <app.icon className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">{app.title}</h2>
                  <p className="text-slate-400 mb-6 leading-relaxed">{app.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-slate-300">Key Features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {app.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Button */}
                <Button3D
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white border-2 border-purple-400/50 shadow-lg shadow-purple-500/20 transition-opacity"
                  onClick={() => onSelectApp(app.id)}
                >
                  Launch Platform
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button3D>
              </Card>
            </motion.div>
          </Card3D>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-slate-400 text-sm"
        >
          <p>Build. Compete. Innovate. Powered by AI.</p>
        </motion.div>
      </div>
    </div>
  );
}
