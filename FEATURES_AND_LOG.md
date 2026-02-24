# Features and Implementation Log

## Project Overview
StreamFlix is a premium, modern streaming platform built with React, Vite, and SCSS. It features a polished, "Netflix-style" dark UI, robust movie/TV show discovery via the TMDB API, and a sophisticated video player experience.

## Feature List

### 🎥 Content Discovery
-   **Cinematic Hero Banner**: dynamic, full-width showcase of trending content with "Watch Now" and "Add to List" actions.
-   **Content Sliders**: Horizontal scrolling rows for "Trending", "Top Rated", "Action", "Comedy", etc.
-   **Rich Metadata**: Detailed views for Movies and TV Shows, including:
    -   Synopsis, Rating, Release Year, Runtime.
    -   **Cast & Crew Grid**: Expandable list of actors and production crew.
    -   **Season/Episode Selector**: For TV shows, with specific episode details.
-   **Live Search**: Real-time search functionality with debounced API calls.

### ⏯️ Video Player (Major Overhaul)
-   **Global Modal Player**: Video playback occurs in a global overlay, allowing users to watch without navigating away from their current page.
-   **Seamless Transitions**: Powered by `framer-motion` for smooth entry/exit animations.
-   **Minimized (PiP) Mode**:
    -   Users can **minimize** the player to the bottom-right corner.
    -   Allows browsing the app while the video plays continuously.
    -   Interactive controls in both full and minimized modes.
-   **Modern Glassmorphic UI**:
    -   Custom-designed controls with a blurred, translucent "glass" effect.
    -   Centered, theatre-style modal layout (85vw width).
    -   Premium hover effects and animations.
-   **Multi-Server Support**: Integrated server selector (`VidSrc`, `VidLink`, `SuperEmbed`) to ensure link availability.
-   **Ad-Blocking / Sandbox**:
    -   **Standard Mode (Default)**: Optimized for compatibility.
    -   **Strict Mode**: Optional security toggle to block all popups and redirects via iframe sandboxing.

### 👤 User Features
-   **Watchlist**: Add/Remove movies and shows to a personal list (persisted in local storage).
-   **History**: Automatically tracks watched content.
-   **Profile Page**: Central hub for user lists and settings.

## Implementation Log (Recent Highlights)

### 1. Global Video Player Architecture
-   **Context API**: Updated `AppContext` to manage global `playerState` (`isOpen`, `isMinimized`, `videoId`, `season`, `episode`).
-   **Layout Integration**: Moved the player component to `MainLayout.jsx` to ensure it persists across route changes.
-   **Removed Routing**: Deprecated the old `/watch/:id` route in favor of the modal approach.

### 2. Minimized Player Logic
-   **State Management**: Added `minimizePlayer` and `maximizePlayer` actions to `AppContext`.
-   **Dynamic Layouts**: Refactored `VideoPlayerModal` to switch between `minimized` (bottom-right fixed) and `maximized` (centered modal) CSS states using Framer Motion variants.
-   **Interaction Handling**: Adjusted pointer events to ensure the underlying page is clickable only when the player is minimized.

### 3. Visual Redesign
-   **SCSS Architecture**: Created `src/styles/components/_player.scss` for modular player styling.
-   **Variables**: Integrated with global `_variables.scss` for consistent theming (colors, typography).
-   **Glassmorphism**: Applied `backdrop-filter: blur(10px)` and transparent RGBA backgrounds to control bars.

### 4. Stability & Ad-Blocking
-   **Iframe Sandboxing**: Introduced `sandbox` attributes to the video iframe to mitigate aggressive ads from third-party providers.
-   **Compatibility Fix**: Implemented a toggle logic where strict sandboxing is optional, preventing "Media Unavailable" errors on stricter servers.

## Tech Stack
-   **Framework**: React 18 + Vite
-   **Styling**: SCSS (Sass), CSS Modules approach
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Data**: Axiso + TMDB API
-   **Routing**: React Router Dom v6
