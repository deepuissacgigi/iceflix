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
