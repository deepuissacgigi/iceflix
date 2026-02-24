-- Security Patch: Restrict Public Access to Profiles
-- Currently, the policy "Public profiles are viewable by everyone." allows Anon users to see all profiles.
-- We want to restrict this so users can only see their own profile (privacy).

-- 1. Drop the existing public policy
drop policy "Public profiles are viewable by everyone." on profiles;

-- 2. Create strict policy: Users can ONLY see their own profile
create policy "Users can view own profile." 
on profiles 
for select 
using ( auth.uid() = id );

-- Impact:
-- - You can no longer query `supabase.from('profiles').select('*')` to see all users.
-- - You CAN still query your own profile for the Navbar/Profile page.
