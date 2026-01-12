import { useState } from 'react';
import { HackathonLanding } from './HackathonLanding';
import { HackathonAuth } from './HackathonAuth';
import { OnboardingFlow } from './OnboardingFlow';
import { ParticipantDashboard } from './ParticipantDashboard';
import { ExploreHackathons } from './ExploreHackathons';
import { Toaster } from '../ui/sonner';
import { api } from '../../utils/api';

type Page = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'explore';

export function HackathonApp() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageHistory, setPageHistory] = useState<Page[]>(['landing']);
  const [userData, setUserData] = useState<any>(null);

  const navigateTo = (page: Page) => {
    setPageHistory(prev => [...prev, page]);
    setCurrentPage(page);
  };

  const navigateBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      // If no history, go to landing
      setPageHistory(['landing']);
      setCurrentPage('landing');
    }
  };

  const handleAuthSuccess = (data: any) => {
    setUserData(data);
    // Always show onboarding (role selection) for both new and existing users
    navigateTo('onboarding');
  };

  const handleOnboardingComplete = async (data: any) => {
    // Refresh user data from backend to get updated role
    try {
      const updatedUser = await api.getCurrentUser();
      setUserData({ 
        ...userData, 
        ...data,
        role: updatedUser.role?.toLowerCase() || data.role,
        status: updatedUser.status,
      });
    } catch (error) {
      // If refresh fails, use the data from onboarding
      console.warn('Failed to refresh user data:', error);
      setUserData({ ...userData, ...data });
    }
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setPageHistory(['landing']);
    setCurrentPage('landing');
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      
      {currentPage === 'landing' && (
        <HackathonLanding onNavigate={navigateTo} />
      )}
      
      {currentPage === 'auth' && (
        <HackathonAuth
          onAuthSuccess={handleAuthSuccess}
          onBack={navigateBack}
        />
      )}
      
      {currentPage === 'onboarding' && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onBack={navigateBack}
          userRole={userData?.role}
        />
      )}
      
      {currentPage === 'dashboard' && userData && (
        <ParticipantDashboard
          userData={userData}
          onLogout={handleLogout}
          onBack={navigateBack}
        />
      )}

      {currentPage === 'explore' && (
        <ExploreHackathons onBack={navigateBack} />
      )}
    </>
  );
}