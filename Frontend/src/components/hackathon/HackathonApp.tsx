import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { HackathonLanding } from './HackathonLanding';
import { HackathonAuth } from './HackathonAuth';
import { OrganizerAuth } from './OrganizerAuth';
import { ParticipantDashboard } from './ParticipantDashboard';
import { ExploreHackathons } from './ExploreHackathons';
import { Toaster } from '../ui/sonner';
import { api } from '../../utils/api';

// Protected Route Component
function ProtectedRoute({ children, userData }: { children: React.ReactNode; userData: any }) {
  if (!userData) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

// Auth Route Component (redirect to dashboard if already logged in)
function AuthRoute({ children, userData }: { children: React.ReactNode; userData: any }) {
  console.log('🔄 AuthRoute: userData check:', { hasUserData: !!userData, userData });
  if (userData) {
    console.log('🔄 AuthRoute: User logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  console.log('🔄 AuthRoute: No user data, rendering children');
  return <>{children}</>;
}

// Main App Content Component
function AppContent() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing user session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUserData = localStorage.getItem('user_data');
        
        if (token && storedUserData) {
          // Verify token is still valid
          const currentUser = await api.getCurrentUser();
          const parsedUserData = JSON.parse(storedUserData);
          
          // Update user data with fresh data from backend
          const updatedUserData = {
            ...parsedUserData,
            role: currentUser.role?.toLowerCase() || parsedUserData.role,
            status: currentUser.status,
          };
          
          setUserData(updatedUserData);
          localStorage.setItem('user_data', JSON.stringify(updatedUserData));
          
          // If user is on landing page but has valid session, redirect to dashboard
          if (location.pathname === '/') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // No valid session, redirect to landing if on protected route
          if (location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/organizer-auth' && location.pathname !== '/explore') {
            console.log('🔄 No valid session, redirecting from protected route:', location.pathname);
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        // Token invalid or expired, clear everything
        console.log('No valid session found');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        api.clearToken();
        
        // Redirect to landing if on protected route
        if (location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/organizer-auth' && location.pathname !== '/explore') {
          console.log('🔄 Token invalid, redirecting from protected route:', location.pathname);
          navigate('/', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, [navigate, location.pathname]);

  const handleAuthSuccess = (data: any) => {
    console.log('🔄 HackathonApp: handleAuthSuccess called with:', data);
    setUserData(data);
    // Store user data in localStorage for other components to access
    localStorage.setItem('user_data', JSON.stringify(data));
    
    // Check for pending registration
    const pendingHackathonId = localStorage.getItem('pending_registration_hackathon');
    console.log('🔍 HackathonApp: Checking for pending registration:', pendingHackathonId);
    if (pendingHackathonId) {
      console.log('🔄 HackathonApp: Found pending registration for hackathon:', pendingHackathonId);
      // Don't auto-register, instead navigate to the hackathon details to show registration modal
      localStorage.removeItem('pending_registration_hackathon');
      (window as any).toast?.info?.('Please complete your registration for the hackathon.');
      // Navigate to the specific hackathon details page with a flag to force registration flow
      console.log('🔄 HackathonApp: Navigating to explore with forceRegistration=true');
      navigate(`/explore?hackathon=${pendingHackathonId}&forceRegistration=true`);
    } else {
      // Skip onboarding and go directly to dashboard
      console.log('🔄 HackathonApp: No pending registration, navigating to dashboard after auth success');
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setUserData(null);
    // Clear user data from localStorage
    localStorage.removeItem('user_data');
    api.clearToken();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      
      <Routes>
        {/* Landing Page */}
        <Route 
          path="/" 
          element={
            <AuthRoute userData={userData}>
              <HackathonLanding onNavigate={(page) => {
                console.log('🔄 HackathonApp: onNavigate called with page:', page);
                navigate(`/${page}`);
              }} />
            </AuthRoute>
          } 
        />
        
        {/* Auth Page */}
        <Route 
          path="/auth" 
          element={
            <AuthRoute userData={userData}>
              <HackathonAuth
                onAuthSuccess={handleAuthSuccess}
                onBack={() => navigate('/')}
              />
            </AuthRoute>
          } 
        />
        
        {/* Organizer Auth Page */}
        <Route 
          path="/organizer-auth" 
          element={
            <AuthRoute userData={userData}>
              <OrganizerAuth
                onAuthSuccess={handleAuthSuccess}
                onBack={() => {
                  console.log('🔄 HackathonApp: OrganizerAuth onBack called');
                  navigate('/');
                }}
              />
            </AuthRoute>
          } 
        />
        
        {/* Dashboard - Main dashboard page */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab={userData?.role?.toLowerCase() === 'participant' ? 'hackathons' : 'dashboard'}
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard sub-pages */}
        <Route 
          path="/participants" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="participants"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-hackathons" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="my-hackathons"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/submissions" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="submissions"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/create-hackathon" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="create-hackathon"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/submissions-review" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="submissions-review"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="analytics"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ai-mentor" 
          element={
            <ProtectedRoute userData={userData}>
              <ParticipantDashboard
                userData={userData}
                onLogout={handleLogout}
                onBack={() => navigate('/')}
                initialTab="ai-mentor"
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/explore" 
          element={
            <ExploreHackathons 
              onBack={() => navigate('/')} 
              onNavigateToAuth={(returnUrl, hackathonId) => {
                // Save return URL and hackathon ID for after login
                if (returnUrl) {
                  localStorage.setItem('auth_return_url', returnUrl);
                }
                if (hackathonId) {
                  localStorage.setItem('pending_registration_hackathon', hackathonId);
                }
                navigate('/auth');
              }}
            />
          } 
        />
        
        {/* Catch all - redirect to landing */}
        <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function HackathonApp() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}