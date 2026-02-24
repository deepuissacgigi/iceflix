import { useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and methods.
 * Returns: { user, session, loading, loginWithGoogle, signIn, signUp, logoutUser, isAuthenticated }
 */
export const useAuth = () => {
    return useAuthContext();
};
