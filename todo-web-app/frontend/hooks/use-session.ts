import { useState, useEffect } from 'react';
import { User } from '../lib/types';
import { apiClient } from '../lib/api-client';

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const useSession = (): SessionState => {
  const [session, setSession] = useState<SessionState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token && apiClient.isAuthenticated()) {
        try {
          // Try to fetch user profile to validate the token and get user info
          const response = await apiClient.getProfile();
          if (response.data) {
            setSession({
              user: {
                id: response.data.id,
                email: response.data.email,
                created_at: response.data.created_at,
                
              },
              isAuthenticated: true,
              loading: false,
            });
          } else {
            // Token exists but user fetch failed, so clear invalid token
            localStorage.removeItem('access_token');
            setSession({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        } catch (error) {
          // Token exists but validation failed, so clear invalid token
          localStorage.removeItem('access_token');
          setSession({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } else {
        setSession({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initializeSession();
  }, []);

  return session;
};

export default useSession;