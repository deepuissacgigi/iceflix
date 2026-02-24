import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { clearContinueWatching, getContinueWatching } from '../utils/continueWatching';
import { clearList as clearMyList, getMyList } from '../utils/myList';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial Session Check
        authService.getSession().then((session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        return await authService.signInWithGoogle();
    };

    const signIn = async (email, password) => {
        return await authService.signInWithEmail(email, password);
    };

    const signUp = async (email, password, username) => {
        return await authService.signUpWithEmail(email, password, username);
    };

    const logoutUser = async () => {
        // Clear guest localStorage BEFORE signing out to prevent race conditions
        // where onAuthStateChange fires and hooks read stale local data.
        clearContinueWatching();
        clearMyList();

        const { error } = await authService.logout();
        if (!error) {
            setUser(null);
            setSession(null);
        }
        return { error };
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            loginWithGoogle,
            signIn,
            signUp,
            logoutUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Keeping useAuth here for backward compatibility or removing it if creating separate file.
// User requested separate file. I will remove it from here if I am creating src/hooks/useAuth.js
// BUT local imports might break if I remove it immediately without checking all usages.
// I will keep it as an alias for now, or just export the context.
export const useAuthContext = () => {
    return useContext(AuthContext);
};

// Deprecated: usage should move to src/hooks/useAuth.js
export const useAuth = () => useContext(AuthContext);
