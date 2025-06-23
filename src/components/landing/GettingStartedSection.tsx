import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useWallet } from '@/hooks';
import {
  WalletIcon,
  PlusIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const steps = [
  {
    icon: WalletIcon,
    title: 'Connect Your Wallet',
    description: 'Connect your Web3 wallet (MetaMask, WalletConnect, etc.) to get started.',
    action: 'Connect Wallet'
  },
  {
    icon: PlusIcon,
    title: 'Create Multi-Sig Wallet',
    description: 'Set up your first multi-signature wallet with custom owners and approval thresholds.',
    action: 'Create Wallet'
  },
  {
    icon: UsersIcon,
    title: 'Add Team Members',
    description: 'Invite team members and configure signature requirements for enhanced security.',
    action: 'Manage Signers'
  },
  {
    icon: CheckCircleIcon,
    title: 'Start Transacting',
    description: 'Submit transactions and collaborate with your team for secure asset management.',
    action: 'Send Transaction'
  }
];

const faqs = [
  {
    question: 'What is a multi-signature wallet?',
    answer: 'A multi-signature wallet requires multiple private keys to authorize transactions, providing enhanced security by eliminating single points of failure.'
  },
  {
    question: 'How many signatures can I require?',
    answer: 'You can configure any M-of-N signature scheme, such as 2-of-3, 3-of-5, or any combination that fits your security needs.'
  },
  {
    question: 'Which networks are supported?',
    answer: 'MultiGuard supports Ethereum, Polygon, Arbitrum, Optimism, and other EVM-compatible networks.'
  },
  {
    question: 'Is my wallet truly decentralized?',
    answer: 'Yes, MultiGuard is completely non-custodial. You maintain full control of your private keys and wallet ownership.'
  }
];

const GettingStartedSection: React.FC = () => {
  const { connect, isConnected, isLoading } = useWallet();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => {
    if (!isConnected) {
      connect();
    } else {
      // Navigate to dashboard or create wallet page
      window.location.href = '/create';
    }
  };

  return (
    <section id="getting-started" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-gray-600">
            Setting up your first multi-signature wallet is simple and straightforward. 
            Follow these steps to enhance your digital asset security.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === 0 && !isConnected;
            
            return (
              <Card 
                key={index} 
                className={`relative text-center transition-all duration-300 hover:shadow-lg ${
                  isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="absolute top-4 right-4 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4">
                    {step.description}
                  </p>
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={index === 0 ? handleGetStarted : undefined}
                    disabled={index > 0 && !isConnected}
                  >
                    {index === 0 && isLoading ? 'Connecting...' : step.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Secure Your Digital Assets?
          </h3>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust MultiGuard for their multi-signature wallet needs. 
            Start protecting your assets with enterprise-grade security today.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-base"
          >
            <span className="flex items-center space-x-2">
              <span>{isConnected ? 'Go to Dashboard' : 'Get Started Now'}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 pr-4">{faq.question}</h4>
                    <QuestionMarkCircleIcon 
                      className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                  {openFaq === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { GettingStartedSection };
