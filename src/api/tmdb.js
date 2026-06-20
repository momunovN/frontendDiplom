import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_API_KEY,
  },
  // withCredentials здесь НЕ НУЖЕН!
});

export default tmdbApi;