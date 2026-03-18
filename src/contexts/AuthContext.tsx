import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { SaaSOrganization } from '../types';
import { saasService } from '../services/saasService';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'Ativo' | 'Inativo';
  role: 'USER' | 'ADMIN' | 'MASTER';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: SaaSOrganization | null;
  userOrgs: SaaSOrganization[];
  switchOrg: (orgId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global state to prevent redundant fetches across mounts (StrictMode protection)
let globalUser: User | null = null;
let globalInFlightPromise: Promise<User | null> | null = null;
let lastFetchTimestamp = 0;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [currentOrg, setCurrentOrg] = useState<SaaSOrganization | null>(null);
  const [userOrgs, setUserOrgs] = useState<SaaSOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(!globalUser);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // OPTIMISTIC: Use metadata role to resolve loading instantly
          const metadataRole = session.user.user_metadata?.role;
          if (metadataRole) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'Usuário',
              email: session.user.email!,
              status: 'Ativo',
              role: metadataRole as any,
            });
            setIsLoading(false);
          }
          
          // Background fetch for full profile
          const profile = await getProfile(session.user.id, session.user.email!);
          if (profile) {
            setUser(profile);
          }

          // Load Organizations
          const orgs = await saasService.getUserOrganizations();
          setUserOrgs(orgs);
          
          if (orgs.length > 0) {
            const savedOrgId = localStorage.getItem('activeOrgId');
            const activeOrg = orgs.find(o => o.id === savedOrgId) || orgs[0];
            setCurrentOrg(activeOrg);
          }
          
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;
      
      if (session?.user) {
        const metadataRole = session.user.user_metadata?.role;
        if (metadataRole) {
           setUser(prev => ({
             ...prev,
             id: session.user.id,
             email: session.user.email!,
             role: metadataRole as any,
             name: prev?.name || 'Usuário',
             status: 'Ativo'
           }));
           setIsLoading(false);
        }
        const profile = await getProfile(session.user.id, session.user.email!);
        if (profile) setUser(profile);
      } else {
        globalUser = null;
        setUser(null);
        setIsLoading(false);
      }
    });

    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const getProfile = async (id: string, email: string): Promise<User | null> => {
    const now = Date.now();
    if (globalUser && (now - lastFetchTimestamp < 15000)) {
      return globalUser;
    }

    if (globalInFlightPromise) {
      return globalInFlightPromise;
    }

    globalInFlightPromise = (async () => {
      // Background fetch: don't block UI if we already have some user data
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Background Timeout')), 10000));
      
      try {
        const fetchPromise = supabase.from('profiles').select('*').eq('id', id).single();
        const { data, error } = await Promise.race([fetchPromise, timeout]) as any;

        if (error) throw error;
        
        if (data) {
          const profile: User = {
            id: data.id,
            name: data.full_name || 'Usuário',
            email: email,
            status: data.is_active ? 'Ativo' : 'Inativo',
            role: data.role as any,
            avatar_url: data.avatar_url
          };
          globalUser = profile;
          lastFetchTimestamp = Date.now();
          return profile;
        }
        return null;
      } catch (err) {
        // Silently fail for background fetch to avoid bothering user
        return null;
      } finally {
        globalInFlightPromise = null;
      }
    })();

    return globalInFlightPromise;
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentOrg(null);
    setUserOrgs([]);
    localStorage.removeItem('activeOrgId');
  };

  const switchOrg = async (orgId: string) => {
    const org = userOrgs.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('activeOrgId', org.id);
      // Optional: Refresh data or redirect to dashboard
      window.location.reload(); 
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentOrg,
      userOrgs,
      switchOrg,
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
