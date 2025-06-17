// useIncidents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useIncidents = (status:string='open') =>
  useQuery({
    queryKey: ['incidents', status],
    queryFn: async () => {
      const { data } = await axios.get(`/incidents?status=${status}`);
      return data;
    }
  });

export const useCloseIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id:number) => axios.patch(`/incidents/${id}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey:['incidents','open'] })
  });
};
