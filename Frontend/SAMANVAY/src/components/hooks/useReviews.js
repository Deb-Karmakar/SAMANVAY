// src/hooks/useReviews.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/contexts/AuthContext';

export const fetchPendingReviews = async ({ projectId, agencyId } = {}) => {
  let url = '/projects/pending-reviews';
  if (projectId && agencyId) {
    url = `/projects/${projectId}/agency/${agencyId}/pending-reviews`;
  }
  const { data } = await axiosInstance.get(url);
  return data;
};

export const reviewMilestone = async ({ projectId, assignmentIndex, checklistIndex, action, comments }) => {
  const { data } = await axiosInstance.put(
    `/projects/${projectId}/checklist/${assignmentIndex}/${checklistIndex}/review`,
    { action, comments }
  );
  return data;
};

export const useReviews = ({ projectId, agencyId } = {}) => {
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['pendingReviews', projectId, agencyId].filter(Boolean),
    queryFn: () => fetchPendingReviews({ projectId, agencyId }),
  });

  const mutation = useMutation({
    mutationFn: reviewMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['myStateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return { projects, isLoading, mutation };
};