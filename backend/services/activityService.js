import api from './progressService';
 
export const getActivityFeed = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/activity?page=${page}&limit=${limit}`);
  return {
    activities: Array.isArray(data?.activities) ? data.activities : [],
    pagination: data?.pagination || { page, limit, total: 0, hasMore: false },
  };
};
 