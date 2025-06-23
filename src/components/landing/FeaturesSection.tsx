import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  ShieldCheckIcon,
  UsersIcon,
  CogIcon,
  ClockIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Multi-Signature Security',
    description: 'Require multiple signatures for transaction approval, eliminating single points of failure and enhancing security.',
    color: 'text-blue-600 bg-blue-100'
  },
  {
    icon: UsersIcon,
    title: 'Collaborative Management',
    description: 'Add multiple owners and set custom approval thresholds. Perfect for teams, DAOs, and organizations.',
    color: 'text-green-600 bg-green-100'
  },
  {
    icon: CogIcon,
    title: 'Flexible Configuration',
    description: 'Customize signature requirements (M-of-N) and manage owner permissions with granular control.',
    color: 'text-purple-600 bg-purple-100'
  },
  {
    icon: ClockIcon,
    title: 'Real-Time Tracking',
    description: 'Monitor transaction status, approval progress, and wallet activity with live updates.',
    color: 'text-orange-600 bg-orange-100'
  },
  {
    icon: GlobeAltIcon,
    title: 'Multi-Chain Support',
    description: 'Deploy and manage wallets across Ethereum, Polygon, Arbitrum, and other EVM-compatible networks.',
    color: 'text-indigo-600 bg-indigo-100'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Transaction History',
    description: 'Complete audit trail of all transactions with detailed logs and approval records.',
    color: 'text-teal-600 bg-teal-100'
  },
  {
    icon: BanknotesIcon,
    title: 'Asset Management',
    description: 'View balances, manage multiple tokens, and track portfolio performance across all your wallets.',
    color: 'text-emerald-600 bg-emerald-100'
  },
  {
    icon: KeyIcon,
    title: 'Non-Custodial',
    description: 'Maintain full control of your private keys. No third-party custody or centralized control.',
    color: 'text-red-600 bg-red-100'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to securely manage digital assets with confidence. 
            Built for individuals, teams, and organizations of all sizes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200 hover:border-blue-200"
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to Secure Your Assets?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust MultiGuard for their multi-signature wallet needs. 
              Get started in minutes with our intuitive interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  document.getElementById('getting-started')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started Now
              </button>
              <button 
                onClick={() => {
                  document.getElementById('about')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FeaturesSection };
