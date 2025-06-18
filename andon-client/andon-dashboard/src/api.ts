import axios from 'axios';
// default to backend on localhost when no VITE_API_URL provided
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || `http://localhost:3000`;
export default axios;
