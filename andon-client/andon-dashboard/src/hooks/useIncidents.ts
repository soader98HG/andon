// useIncidents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useIncidents = (status: string = 'open', station?: string) =>
  useQuery({
    queryKey: ['incidents', status, station],
    queryFn: async () => {
      const { data } = await axios.get(`/incidents?status=${status}`);
      return station ? data.filter((i: any) => String(i.station_id) === station) : data;
    }
  });

export const useCloseIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id:number) => axios.patch(`/incidents/${id}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey:['incidents'] })
  });
};

export const useIncidentAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id:number; action:string }) =>
      axios.patch(`/incidents/${id}/action`, { action }),
    onSuccess: () => qc.invalidateQueries({ queryKey:['incidents'] })
  });
};
