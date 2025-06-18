import axios from 'axios';
// default to same host as the dashboard when no VITE_API_URL provided
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  `${location.protocol}//${location.hostname}:3000`;
export default axios;
