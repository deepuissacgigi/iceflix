# Google Login Setup Guide

To make the Google Login button work, you need to configure **Google Cloud Console** and **Supabase Dashboard**.

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "My Streaming App").
3. Search for **"OAuth consent screen"** in the top search bar.
   - Select **External** (unless you have a Google Workspace organization).
   - Fill in App Name, User Support Email, and Developer Contact Email.
   - Click "Save and Continue" (you can skip Scopes and Test Users for now).
4. Go to **Credentials** (left menu).
   - Click **+ Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: "Supabase Auth".
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for local dev)
     - `https://<your-project-ref>.supabase.co` (Supabase URL)
     - `https://<your-production-domain>.com` (Wait until you deploy)
   - **Authorized redirect URIs**:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - **Note**: You can find this exact URL in your Supabase Dashboard (Authentication -> Providers -> Google -> Callback URL).
5. Click **Create**.
6. Copy your **Client ID** and **Client Secret**.

## Step 2: Supabase Dashboard Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** -> **Providers**.
3. Enable **Google**.
4. Paste the **Client ID** and **Client Secret** you copied from Google Cloud.
5. Click **Save**.

## Step 3: Test It

1. Restart your local server (`npm run dev`) if needed.
2. Go to your Login page.
3. Click "Sign in with Google".
4. You should be redirected to Google, sign in, and then be redirected back to your Profile page logged in!

## Troubleshooting

- **Error: redirect_uri_mismatch**:
  - Double-check the "Authorized redirect URIs" in Google Cloud Console. It must MATCH EXACTLY what Supabase tells you.
- **Login Loop**:
  - Check your console for errors. Make sure cookies are enabled.
