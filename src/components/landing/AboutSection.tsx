import React from 'react';
import { Card, CardContent } from '@/components/ui';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
  CogIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const benefits = [
  {
    title: 'Enhanced Security',
    description: 'Multi-signature technology eliminates single points of failure, requiring multiple approvals for transactions.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Team Collaboration',
    description: 'Perfect for organizations, DAOs, and teams that need shared control over digital assets.',
    icon: UsersIcon
  },
  {
    title: 'Flexible Control',
    description: 'Set custom approval thresholds and manage permissions with granular control over your wallet.',
    icon: CogIcon
  }
];

const stats = [
  { label: 'Wallets Created', value: '10,000+' },
  { label: 'Assets Secured', value: '$50M+' },
  { label: 'Transactions Processed', value: '100,000+' },
  { label: 'Networks Supported', value: '10+' }
];

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              The Future of 
              <span className="text-blue-600"> Secure</span> Digital Asset Management
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              MultiGuard revolutionizes how individuals and organizations manage their digital assets. 
              Our multi-signature wallet technology provides enterprise-grade security while maintaining 
              the simplicity and accessibility that modern users demand.
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => {
                document.getElementById('getting-started')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              <span>Start securing your assets today</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Visual Content */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">How MultiGuard Works</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Your Wallet</h4>
                    <p className="text-sm text-gray-600">Set up a multi-signature wallet with custom owners and approval thresholds.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Submit Transactions</h4>
                    <p className="text-sm text-gray-600">Propose transactions that require approval from multiple wallet owners.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Collect Approvals</h4>
                    <p className="text-sm text-gray-600">Owners review and approve transactions until the threshold is met.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Execute Securely</h4>
                    <p className="text-sm text-gray-600">Once approved, transactions execute automatically on the blockchain.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Trusted by the Community
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { AboutSection };
