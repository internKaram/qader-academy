import { useState, useEffect, useCallback } from 'react';
import { getActivityFeed } from '../../services/activityService';

export default function useActivity(limit = 20) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
 
  const load = useCallback(async (targetPage = 1, append = false) => {
    setLoading(!append);
    setError('');
    try {
      const { activities: newActivities, pagination } = await getActivityFeed(targetPage, limit);
      setActivities((prev) => (append ? [...prev, ...newActivities] : newActivities));
      setHasMore(pagination.hasMore);
      setPage(targetPage);
     } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load recent activity.');      if (!append) setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);
 
  useEffect(() => {
    load(1, false);
  }, [load]);
 
  const loadMore = () => load(page + 1, true);
  const refresh = () => load(1, false);
 
  return { activities, loading, error, hasMore, loadMore, refresh };
}