import api from "../api/axios";

export const getActivityFeed = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/activities?page=${page}&limit=${limit}`);
    const data = response.data;
    
    return {
      activities: Array.isArray(data?.activities) ? data.activities : [],
      pagination: data?.pagination || { page, limit, total: 0, hasMore: false },
    };
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    throw error;
  }
};