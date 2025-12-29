/**
 * Authentication context for Supabase Auth
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient, getSession, getCurrentUser, signOut } from '@/src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/config/env';
import { authService } from '@/src/api/services';

interface AuthContextType {
  // State
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'CREATOR' | 'BRAND', name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // User info
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth state changes
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Store tokens
          if (session?.access_token) {
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
          }
          if (session?.refresh_token) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
          }
          
          // Link user to Spring Boot backend if needed
          if (session?.user) {
            await linkUserToBackend(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
          ]);
        }
        
        setLoading(false);
        setInitialized(true);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const currentSession = await getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.access_token) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, currentSession.access_token);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

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

      setSession(data.session);
      setUser(data.user);

      // Store tokens
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token);

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
  }, [linkUserToBackend]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    role: 'CREATOR' | 'BRAND',
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
            role: role,
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
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token);
      }
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }, [linkUserToBackend]);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setSession(null);
      setUser(null);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
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

