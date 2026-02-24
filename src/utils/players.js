export const getMoviePlayers = (movieId) => {
    return [
        {
            name: "VidSrc",
            url: `https://vidsrc.xyz/embed/movie/${movieId}?autoplay=1`
        },
        {
            name: "VidSrc Backup",
            url: `https://vidsrc.to/embed/movie/${movieId}?autoplay=1`
        },
        {
            name: "VidLink",
            url: `https://vidlink.pro/movie/${movieId}?autoplay=1`
        },
        {
            name: "SuperEmbed",
            url: `https://multiembed.mov/?video_id=${movieId}&tmdb=1&autoplay=1`
        },
        {
            name: "2Embed",
            url: `https://www.2embed.cc/embed/${movieId}?autoplay=1`
        },
        {
            name: "AutoEmbed",
            url: `https://autoembed.co/movie/${movieId}?autoplay=1`
        },
        {
            name: "EmbedSu",
            url: `https://embed.su/embed/movie/${movieId}?autoplay=1`
        },
        {
            name: "PrimeMirror",
            url: `https://moviesapi.club/movie/${movieId}?autoplay=1`
        }
    ];
};

export const getTVPlayers = (seriesId, season, episode) => {
    return [
        {
            name: "VidSrc",
            url: `https://vidsrc.xyz/embed/tv/${seriesId}/${season}/${episode}?autoplay=1`
        },
        {
            name: "VidSrc Backup",
            url: `https://vidsrc.to/embed/tv/${seriesId}/${season}/${episode}?autoplay=1`
        },
        {
            name: "VidLink",
            url: `https://vidlink.pro/tv/${seriesId}/${season}/${episode}?autoplay=1`
        },
        {
            name: "SuperEmbed",
            url: `https://multiembed.mov/?video_id=${seriesId}&tmdb=1&s=${season}&e=${episode}&autoplay=1`
        },
        {
            name: "2Embed",
            url: `https://www.2embed.cc/embedtv/${seriesId}&s=${season}&e=${episode}?autoplay=1`
        },
        {
            name: "AutoEmbed",
            url: `https://autoembed.co/tv/${seriesId}/${season}/${episode}?autoplay=1`
        },
        {
            name: "EmbedSu",
            url: `https://embed.su/embed/tv/${seriesId}/${season}/${episode}?autoplay=1`
        },
        {
            name: "PrimeMirror",
            url: `https://moviesapi.club/tv/${seriesId}-${season}-${episode}?autoplay=1`
        }
    ];
};
