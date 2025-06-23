import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingLayout } from '@/components/layout';
import { 
  HeroSection, 
  FeaturesSection, 
  AboutSection, 
  GettingStartedSection 
} from '@/components/landing';
import { useWallet } from '@/hooks';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  const handleGetStarted = () => {
    if (isConnected) {
      // If wallet is already connected, go to dashboard
      navigate('/dashboard');
    } else {
      // If not connected, the wallet connection will be handled by the components
      // After connection, user will be redirected via the routing logic in App.tsx
    }
  };

  return (
    <LandingLayout onGetStarted={handleGetStarted}>
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <AboutSection />
      <GettingStartedSection />
    </LandingLayout>
  );
};

export default LandingPage;
