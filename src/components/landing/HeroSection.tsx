import React from 'react';
import { Button } from '@/components/ui';
import { useWallet } from '@/hooks';
import { 
  ShieldCheckIcon, 
  UsersIcon, 
  LockClosedIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { connect, isLoading, isConnected } = useWallet();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      connect();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Secure Your
              <span className="text-blue-600 block">Digital Assets</span>
              with MultiGuard
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Enterprise-grade multi-signature wallet management. Protect your cryptocurrency 
              with advanced security protocols and collaborative transaction approval.
            </p>

            {/* Key benefits */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Bank-Grade Security</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <UsersIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Multi-Signature Control</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <LockClosedIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Decentralized</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 text-base px-8 py-3"
              >
                <span>{isConnected ? 'Go to Dashboard' : 'Connect Wallet'}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="text-base px-8 py-3"
              >
                Learn More
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Trusted by organizations worldwide</p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                <div className="text-xs font-semibold text-gray-400 tracking-wider">ETHEREUM</div>
                <div className="text-xs font-semibold text-gray-400 tracking-wider">POLYGON</div>
                <div className="text-xs font-semibold text-gray-400 tracking-wider">ARBITRUM</div>
                <div className="text-xs font-semibold text-gray-400 tracking-wider">OPTIMISM</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-lg">
              {/* Main card */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <LockClosedIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">MultiSig Wallet</h3>
                      <p className="text-sm text-gray-500">3 of 5 signatures required</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Balance</span>
                    <span className="font-semibold text-gray-900">$125,430.50</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Pending Transaction</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        2/3 Approved
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Send 10 ETH to 0x1234...</p>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
