import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface SubscriptionPageProps {
  onSubscriptionSuccess: () => void;
  onBack: () => void;
}

type Plan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice: number;
  discount: number;
  icon: typeof Sparkles;
  popular?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    id: '1month',
    name: '1 Month',
    duration: '1 month',
    price: 1999,
    originalPrice: 1999,
    discount: 0,
    icon: Sparkles,
    features: [
      'Unlimited members',
      'Payment tracking',
      'Email notifications',
      'Basic reports',
      'Mobile access'
    ]
  },
  {
    id: '3months',
    name: '3 Months',
    duration: '3 months',
    price: 5697,
    originalPrice: 5997,
    discount: 5,
    icon: Zap,
    features: [
      'Everything in 1 Month',
      'WhatsApp notifications',
      'Advanced reports',
      'Priority support',
      'Custom branding'
    ]
  },
  {
    id: '6months',
    name: '6 Months',
    duration: '6 months',
    price: 10795,
    originalPrice: 11994,
    discount: 10,
    icon: Crown,
    popular: true,
    features: [
      'Everything in 3 Months',
      'Auto reminders',
      'Excel export',
      'Payment slips',
      'API access'
    ]
  },
  {
    id: '12months',
    name: '1 Year',
    duration: '12 months',
    price: 20390,
    originalPrice: 23988,
    discount: 15,
    icon: Crown,
    features: [
      'Everything in 6 Months',
      'Dedicated support',
      'Custom integrations',
      'Analytics dashboard',
      'Free updates'
    ]
  }
];

export function SubscriptionPage({ onSubscriptionSuccess, onBack }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('6months');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success('Subscription activated successfully!', {
        description: 'Welcome to PayTrack Pro'
      });
      setIsProcessing(false);
      onSubscriptionSuccess();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
            <Sparkles className="w-3 h-3 mr-1" />
            Special Launch Pricing
          </Badge>
          <h1 className="text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your business. All plans include full access to features 
            with no hidden fees.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-indigo-600 shadow-xl scale-105'
                    : 'hover:shadow-lg hover:scale-102'
                } ${plan.popular ? 'border-indigo-600' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    plan.popular 
                      ? 'from-indigo-600 to-purple-600' 
                      : 'from-gray-600 to-gray-700'
                  } flex items-center justify-center`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  {plan.discount > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Save {plan.discount}%
                    </Badge>
                  )}
                </div>

                <h3 className="text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-900">₹{plan.price.toLocaleString()}</span>
                    {plan.discount > 0 && (
                      <span className="text-gray-400 line-through">
                        ₹{plan.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">for {plan.duration}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-indigo-50">
            <h3 className="text-gray-900 mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6">
              All plans include a 7-day money-back guarantee.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onBack}
                variant="outline"
              >
                Go Back
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Processing...
                  </>
                ) : (
                  'Continue to Payment'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-12 text-gray-500"
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>7-Day Money Back</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}