/**
 * Authentication context for Supabase Auth
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Alert } from 'react-native';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient, getSession, getCurrentUser, signOut } from '@/src/lib/supabase';
import { isSupabaseConfigured } from '@/src/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/config/env';
import { authService } from '@/src/api/services';
import { deleteSecureItem, setSecureItem } from '@/src/lib/secureStore';
import { useApp } from '@/src/context';

interface AuthContextType {
  // State
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  devLogin: () => void;
  
  // User info
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CREATOR_ONLY_MESSAGE = 'This app is for creators only. Please use the Brand Dashboard.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { resetAppState } = useApp();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setSession(null);
      setUser(null);
      await deleteSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
      await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER]);
      await resetAppState();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const enforceCreatorOnly = useCallback(async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) return true;
    const role = (supabaseUser.user_metadata?.role as string | undefined) ?? (supabaseUser.app_metadata?.role as string | undefined);
    if (role && role !== 'CREATOR') {
      Alert.alert('CreatorX', CREATOR_ONLY_MESSAGE);
      await handleSignOut();
      return false;
    }
    return true;
  }, [handleSignOut]);

  const initializeAuth = useCallback(async () => {
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, skipping auth initialization');
      if (isMountedRef.current) {
        setSession(null);
        setUser(null);
        setLoading(false);
        setInitialized(true);
      }
      return;
    }

    try {
      const currentSession = await getSession();
      if (currentSession?.user && !(await enforceCreatorOnly(currentSession.user))) {
        return;
      }
      if (isMountedRef.current) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
      
      if (currentSession?.access_token) {
        await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, currentSession.access_token);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      if (isMountedRef.current) {
        setSession(null);
        setUser(null);
      }
    }
    if (isMountedRef.current) {
      setLoading(false);
      setInitialized(true);
    }
  }, [enforceCreatorOnly]);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth state changes
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!(await enforceCreatorOnly(session?.user ?? null))) {
            if (isMountedRef.current) {
              setLoading(false);
              setInitialized(true);
            }
            return;
          }
          if (isMountedRef.current) {
            setSession(session);
            setUser(session?.user ?? null);
          }
          
          // Store tokens
          if (session?.access_token) {
            await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
          }
          if (session?.refresh_token) {
            await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
          }
          
          // Link user to Spring Boot backend if needed
          if (session?.user) {
            await linkUserToBackend(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMountedRef.current) {
            setSession(null);
            setUser(null);
          }
          await deleteSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
          await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
          await AsyncStorage.multiRemove([STORAGE_KEYS.USER]);
          await resetAppState();
        }
        
        if (isMountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [enforceCreatorOnly, initializeAuth]);

  const linkUserToBackend = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Check if user is already linked
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.supabaseUserId === supabaseUser.id) {
          return; // Already linked
        }
      }

      // Link user to backend
      await authService.linkSupabaseUser({
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        role: supabaseUser.user_metadata?.role || 'CREATOR',
      });

      // Store user info
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: supabaseUser.id,
        email: supabaseUser.email,
        supabaseUserId: supabaseUser.id,
      }));
    } catch (error) {
      console.error('Error linking user to backend:', error);
      // Don't throw - user can still use the app
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error('No session returned from sign in');
      }

      if (!(await enforceCreatorOnly(data.user))) {
        return;
      }

      setSession(data.session);
      setUser(data.user);

      // Store tokens
      await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
      await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token);

      // Link to backend
      if (data.user) {
        await linkUserToBackend(data.user);
      }
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, [enforceCreatorOnly, linkUserToBackend]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Register in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'CREATOR',
            phone: phone,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user returned from sign up');
      }

      // Link to Spring Boot backend
      await linkUserToBackend(data.user);

      // Note: Session might be null if email confirmation is required
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
        await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token);
      }
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }, [linkUserToBackend]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'creatorx://reset-password',
      });
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to send password reset email');
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to update password');
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  }, []);

  const devLogin = useCallback(() => {
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@creatorx.app',
      email_confirmed_at: new Date().toISOString(),
      user_metadata: { name: 'Dev User', role: 'CREATOR' },
      app_metadata: { role: 'CREATOR' },
    } as unknown as SupabaseUser;
    
    const mockSession = {
      access_token: 'dev-token',
      refresh_token: 'dev-refresh',
      user: mockUser,
    } as unknown as Session;
    
    setUser(mockUser);
    setSession(mockSession);
    console.log('Dev login activated');
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut: handleSignOut,
    resetPassword,
    updatePassword,
    refreshSession,
    devLogin,
    isAuthenticated: !!session && !!user,
    isEmailVerified: user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
