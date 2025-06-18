// useStations.ts
// obtiene estaciones via REST
import { useQuery } from '@tanstack/react-query';
import axios from '../api';

export const useStations = () =>
  useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const res = await axios.get('/stations');
      return res.data;
    }
  });
