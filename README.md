# StreamFlix - Premium Streaming Platform

A production-ready streaming platform built with React, Vite, and Tailwind CSS.

## Features

- 🎥 **Home Page**: Trending movies, popular hits, and TV shows with a cinematic hero banner.
- 🎬 **Movie Details**: Full details, cast members, similar movies, and YouTube trailers.
- 🍿 **Watch Page**: Simulated video player with custom overlay controls.
- 🔍 **Live Search**: Debounced search for movies and TV shows.
- 👤 **Profile**: Watchlist management and user profile.
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop.
- 🌙 **Dark UI**: Premium Netflix/Prime-style dark theme.

## Tech Stack

- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS + Sass (`.scss`)
- **State Management**: React Context API
- **Routing**: React Router DOM v6
- **API**: TMDB API (Axios)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Setup Instructions

1.  **Clone the repository** (if not already done).
2.  **Install dependencies**:
    ```bash
    npm install
    # Ensure Sass is installed
    npm install -D sass
    ```
3.  **Environment Setup**:
    - Rename `.env.example` to `.env` (or create `.env` if missing).
    - Add your TMDB API Key:
    ```env
    VITE_TMDB_API_KEY=your_api_key_here
    VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
5.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

```
src/
 ├── components/       # Reusable components (UI, Cards, Layouts)
 ├── pages/           # Application views (Home, Watch, Profile)
 ├── services/        # API services (TMDB, Axios)
 ├── context/         # Global state (AppContext)
 ├── hooks/           # Custom hooks (useDebounce, etc.)
 ├── styles/          # Global styles (SCSS/Tailwind)
 └── router/          # Route definitions
```
