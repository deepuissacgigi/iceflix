# Security Analysis & Architecture

This document outlines the security posture of the application and potential risks.

## 1. Authentication & Authorization (Supabase)

We use Supabase Auth for user management.

### Row Level Security (RLS)
All tables (`my_list`, `watch_history`, `profiles`) have RLS enabled.
- **My List**: Users can only Select/Insert/Delete rows where `user_id` matches their Auth ID.
- **Watch History**: Same as My List.
- **Profiles**: Restricted so users can only view and edit their own profile.

### Patching "Privacy Loops"
If you ran the original schema, the `profiles` table was public.
**Action:** Run `src/security_patches.sql` in your Supabase SQL Editor to close this loop.

## 2. API Key Exposure (TMDB)

**Risk**: The `VITE_TMDB_API_KEY` is exposed in the client-side bundle.
- **Severity**: Low/Medium.
- **Context**: This is a limitation of using TMDB API directly from a frontend application (Vite/React).
- **Mitigation**: 
    - TMDB keys are free and generally low-risk.
    - If needed, implement a backend proxy (e.g., Supabase Edge Function) to hide the key.
    - **Current Status**: Accepted Risk for this architecture.

## 3. Adblock Detection
- **Mechanism**: The app checks for adblockers to potentially warn users.
- **Security Check**: The detection logic runs once on mount (`useEffect`) and does NOT interfere with authentication or payments. Code analysis confirms no infinite loops.

## 4. Input Sanitization
- **React**: Automatically escapes content in JSX, preventing most XSS attacks.
- **Profile Images**: We use `referrerPolicy="no-referrer"` to protect user privacy when loading third-party avatars.
