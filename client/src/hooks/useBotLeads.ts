import { trpc } from '@/lib/trpc';

export function useBotLeads() {
  const saveLead = trpc.botLeads.saveLead.useMutation();
  const getLeads = trpc.botLeads.getLeads.useQuery({
    limit: 50,
    offset: 0,
  });
  const updateLeadStatus = trpc.botLeads.updateLeadStatus.useMutation();
  const getStats = trpc.botLeads.getStats.useQuery();

  return {
    saveLead,
    getLeads,
    updateLeadStatus,
    getStats,
  };
}
