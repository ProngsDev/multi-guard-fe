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
  const { isConnected, connect } = useWallet();

  const handleGetStarted = () => {
    if (isConnected) {
      // If wallet is already connected, go to dashboard
      navigate('/dashboard');
    } else {
      // If not connected, trigger wallet connection
      connect();
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
