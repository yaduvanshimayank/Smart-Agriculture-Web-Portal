import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

const DEMO_STORAGE_KEY = 'agri_demo_users';
const DEMO_SESSION_KEY = 'agri_demo_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Load user profile from Supabase `profiles` table
  const fetchProfile = useCallback(async (userId, userEmail, userMeta = {}) => {
    if (!isConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile from Supabase:', error.message);
      }

      if (data) {
        setProfile(data);
        return data;
      }

      // If profile record does not exist yet (e.g. trigger not yet created in Supabase),
      // create the profile row gracefully via RLS INSERT policy
      const fallbackProfile = {
        id: userId,
        full_name: userMeta?.full_name || userMeta?.name || (userEmail ? userEmail.split('@')[0] : 'Farm Manager'),
        email: userEmail,
        farm_name: 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
        role: 'Agricultural Lead & Farm Manager',
        theme: localStorage.getItem('agri_theme') || 'light',
        audio_muted: localStorage.getItem('agri_muted') === 'true',
        updated_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('profiles')
        .upsert(fallbackProfile)
        .select()
        .single();

      if (!insertError && insertedData) {
        setProfile(insertedData);
        return insertedData;
      }

      setProfile(fallbackProfile);
      return fallbackProfile;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      return null;
    }
  }, [isConfigured]);

  // Initialize session & register auth listener
  useEffect(() => {
    let mounted = true;

    // Check if URL has recovery tokens or password reset parameters
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      setIsRecoveryMode(true);
    }

    if (isConfigured && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session: initSession }, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn('Error getting Supabase session:', error.message);
        }
        if (initSession) {
          setSession(initSession);
          setUser(initSession.user);
          fetchProfile(initSession.user.id, initSession.user.email, initSession.user.user_metadata);
        }
        setLoading(false);
      });

      // 2. Listen to Auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
        }

        if (currentSession?.user) {
          await fetchProfile(
            currentSession.user.id, 
            currentSession.user.email, 
            currentSession.user.user_metadata
          );
        } else {
          setProfile(null);
        }

        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Local fallback / demo mode when Supabase credentials are not yet entered
      try {
        const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setUser(parsed.user);
          setProfile(parsed.profile);
          setSession(parsed.session);
        }
      } catch (e) {
        console.error('Demo auth parse error:', e);
      }
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [isConfigured, fetchProfile]);

  /**
   * Register a new user
   */
  const signUp = async ({ email, password, fullName, rememberMe = true }) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            name: fullName.trim(),
            farm_name: 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
            role: 'Agricultural Lead & Farm Manager'
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        throw error;
      }

      // Check if email confirmation is required (user exists but no active session)
      const needsEmailVerification = !data.session;

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
      }

      return {
        user: data.user,
        session: data.session,
        needsEmailVerification
      };
    } else {
      // Demo mode fallback registration
      const users = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
      const normalizedEmail = email.trim().toLowerCase();

      if (users.find(u => u.email === normalizedEmail)) {
        const error = new Error('User already registered');
        error.status = 400;
        throw error;
      }

      const dummyId = 'demo-usr-' + Date.now();
      const newUser = {
        id: dummyId,
        email: normalizedEmail,
        password, // demo only
        user_metadata: { full_name: fullName.trim() },
        created_at: new Date().toISOString()
      };
      const newProfile = {
        id: dummyId,
        full_name: fullName.trim(),
        email: normalizedEmail,
        farm_name: 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
        role: 'Agricultural Lead & Farm Manager',
        theme: 'light',
        audio_muted: false,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(users));

      const demoSessionData = {
        access_token: 'demo-token-' + Date.now(),
        user: newUser,
        profile: newProfile
      };

      if (rememberMe) {
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          user: newUser,
          profile: newProfile,
          session: demoSessionData
        }));
      }

      setUser(newUser);
      setProfile(newProfile);
      setSession(demoSessionData);

      return {
        user: newUser,
        session: demoSessionData,
        needsEmailVerification: false
      };
    }
  };

  /**
   * Log in an existing user
   */
  const signIn = async ({ email, password, rememberMe = true }) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        // Fallback: Check if this is a registered demo user or the demo operator
        const users = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
        const normalizedEmail = email.trim().toLowerCase();
        const customOpPwd = localStorage.getItem('agri_demo_operator_pwd');
        const isOperator = normalizedEmail === 'operator@farmmesh.in' && (password === 'GreenFarmer2026!#' || password === customOpPwd || (!customOpPwd && password.length >= 6));
        const found = users.find(u => u.email === normalizedEmail && u.password === password);

        if (found || isOperator) {
          const userObj = found || {
            id: 'demo-operator-101',
            email: 'operator@farmmesh.in',
            user_metadata: { full_name: 'Lead Agronomist & Farm Operator' }
          };
          const demoProfile = {
            id: userObj.id,
            full_name: userObj.user_metadata?.full_name || 'Farmer',
            email: userObj.email,
            farm_name: 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
            role: 'Agricultural Lead & Farm Manager',
            theme: localStorage.getItem('agri_theme') || 'light',
            audio_muted: localStorage.getItem('agri_muted') === 'true'
          };
          const demoSession = {
            access_token: 'demo-token-' + Date.now(),
            user: userObj,
            profile: demoProfile
          };
          if (rememberMe) {
            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
              user: userObj,
              profile: demoProfile,
              session: demoSession
            }));
          }
          setUser(userObj);
          setProfile(demoProfile);
          setSession(demoSession);
          return { user: userObj, session: demoSession };
        }

        throw error;
      }

      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);

      return {
        user: data.user,
        session: data.session
      };
    } else {
      // Demo mode login
      const users = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
      const normalizedEmail = email.trim().toLowerCase();
      const customOpPwd = localStorage.getItem('agri_demo_operator_pwd');
      const isOperator = normalizedEmail === 'operator@farmmesh.in' && (password === 'GreenFarmer2026!#' || password === customOpPwd || (!customOpPwd && password.length >= 6));
      const found = users.find(u => u.email === normalizedEmail && u.password === password);

      if (!found && !isOperator) {
        const err = new Error('Invalid login credentials');
        err.status = 400;
        throw err;
      }

      const userObj = found || {
        id: 'demo-operator-101',
        email: 'operator@farmmesh.in',
        user_metadata: { full_name: 'Lead Agronomist & Farm Operator' }
      };

      const demoProfile = {
        id: userObj.id,
        full_name: userObj.user_metadata?.full_name || 'Farmer',
        email: userObj.email,
        farm_name: 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
        role: 'Agricultural Lead & Farm Manager',
        theme: localStorage.getItem('agri_theme') || 'light',
        audio_muted: localStorage.getItem('agri_muted') === 'true'
      };

      const demoSession = {
        access_token: 'demo-token-' + Date.now(),
        user: userObj,
        profile: demoProfile
      };

      if (rememberMe) {
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          user: userObj,
          profile: demoProfile,
          session: demoSession
        }));
      }

      setUser(userObj);
      setProfile(demoProfile);
      setSession(demoSession);

      return { user: userObj, session: demoSession };
    }
  };

  /**
   * One-click demo sign in for instant portal access
   */
  const signInWithDemo = async () => {
    const demoUser = {
      id: 'demo-operator-101',
      email: 'operator@farmmesh.in',
      user_metadata: { full_name: 'Lead Agronomist & Farm Operator' }
    };
    const demoProfile = {
      id: 'demo-operator-101',
      full_name: 'Lead Agronomist & Farm Operator',
      email: 'operator@farmmesh.in',
      farm_name: 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
      role: 'Agricultural Lead & Farm Manager',
      theme: localStorage.getItem('agri_theme') || 'light',
      audio_muted: localStorage.getItem('agri_muted') === 'true'
    };
    const demoSession = {
      access_token: 'demo-token-' + Date.now(),
      user: demoUser,
      profile: demoProfile
    };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      user: demoUser,
      profile: demoProfile,
      session: demoSession
    }));
    setUser(demoUser);
    setProfile(demoProfile);
    setSession(demoSession);
    return { user: demoUser, session: demoSession };
  };

  /**
   * Log out the current user
   */
  const signOut = async () => {
    if (isConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsRecoveryMode(false);
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if this is a local demo account
    let demoUsers = [];
    try {
      demoUsers = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
    } catch {
      demoUsers = [];
    }
    const isDemoUser = normalizedEmail === 'operator@farmmesh.in' || demoUsers.some(u => u.email === normalizedEmail);

    if (isDemoUser) {
      return {
        success: true,
        isDemo: true,
        email: normalizedEmail,
        message: 'Local demo account identified. You can reset your password immediately.'
      };
    }

    // 2. Online Supabase recovery email
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.warn('Supabase reset password error:', error.message);
        throw error;
      }

      return {
        success: true,
        isDemo: false,
        email: normalizedEmail
      };
    } else {
      // Unconfigured demo fallback
      return {
        success: true,
        isDemo: true,
        email: normalizedEmail,
        message: 'Demo mode active. You can set a new password directly.'
      };
    }
  };

  /**
   * Exchange recovery code from URL query parameter (?code=...) for session (PKCE flow)
   */
  const exchangeRecoveryCode = async (code) => {
    if (!code) return null;
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        setIsRecoveryMode(true);
      }
      return data;
    }
    return null;
  };

  /**
   * Verify recovery OTP code (e.g. 6-digit email code)
   */
  const verifyRecoveryOtp = async ({ email, token }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: token.trim(),
        type: 'recovery'
      });
      if (error) throw error;
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        setIsRecoveryMode(true);
      }
      return data;
    } else {
      return { success: true };
    }
  };

  /**
   * Update user password (used during password recovery)
   */
  const updatePassword = async (newPassword, targetEmail = '') => {
    let demoUsers = [];
    try {
      demoUsers = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
    } catch {
      demoUsers = [];
    }

    const emailToMatch = (targetEmail || user?.email || '').trim().toLowerCase();
    const isDemoAccount = emailToMatch === 'operator@farmmesh.in' || demoUsers.some(u => u.email === emailToMatch);

    // If it is a demo account or not connected to Supabase
    if (isDemoAccount || !isConfigured || (!session && isDemoAccount)) {
      if (emailToMatch === 'operator@farmmesh.in') {
        localStorage.setItem('agri_demo_operator_pwd', newPassword);
      }
      const userIndex = demoUsers.findIndex(u => u.email === emailToMatch);
      if (userIndex !== -1) {
        demoUsers[userIndex].password = newPassword;
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUsers));
      }
      // Update active demo session if needed
      const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.user) {
            parsed.user.password = newPassword;
            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(parsed));
          }
        } catch {}
      }
      setIsRecoveryMode(false);
      return { success: true, isDemo: true };
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setIsRecoveryMode(false);
      return data;
    } else {
      setIsRecoveryMode(false);
      return { success: true, isDemo: true };
    }
  };

  /**
   * Update user profile information in Supabase
   */
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No authenticated user');

    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data || updatedProfile);
      return data || updatedProfile;
    } else {
      // Demo mode
      setProfile(updatedProfile);
      const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        parsed.profile = updatedProfile;
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(parsed));
      }
      return updatedProfile;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isConfigured,
    isRecoveryMode,
    setIsRecoveryMode,
    signUp,
    signIn,
    signInWithDemo,
    signOut,
    resetPassword,
    exchangeRecoveryCode,
    verifyRecoveryOtp,
    updatePassword,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id, user.email, user.user_metadata)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
