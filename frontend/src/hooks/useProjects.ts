import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { CreateProjectData } from '../types';
import toast from 'react-hot-toast';

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: api.getProjects,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProjectData) => api.createProject(data),
        onSuccess: () => {
            toast.success('Project created successfully');
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: () => {
            toast.error('Failed to create project');
        }
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteProject(id),
        onSuccess: () => {
            toast.success('Project deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
        onError: () => {
            toast.error('Failed to delete project');
        }
    });
};
