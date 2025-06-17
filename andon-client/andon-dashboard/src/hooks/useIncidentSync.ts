import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useMqtt } from './useMqtt';

export const useIncidentSync = () => {
  const qc = useQueryClient();
  const handle = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['incidents'] });
  }, [qc]);

  useMqtt('andon/incidents/+', handle);
};
