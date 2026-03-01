import { supabase } from '../lib/supabase';

export const authService = {
    /**
     * Sign in with Google OAuth
     * Redirects the user to Google's consent screen.
     */
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/` // Redirect back to home
            }
        });
        return { data, error };
    },

    /**
     * Log out the current user
     */
    logout: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    /**
     * Get the current authenticated user
     */
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Get the current session
     */
    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /**
     * Sign in with Email and Password (Legacy support)
     */
    signInWithEmail: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    /**
     * Sign up with Email and Password (Legacy support)
     */
    signUpWithEmail: async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || email.split('@')[0],
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || email}`
                }
            }
        });
        return { data, error };
    }
};
