import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { CreateTodoData, Todo } from '../types';

export const useTodos = (projectId: string) => {
    return useQuery({
        queryKey: ['todos', projectId],
        queryFn: () => api.getTodosByProject(projectId),
    });
};

export const useCreateTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTodoData) => api.createTodo(data),
        onSuccess: (newTodo) => {
            queryClient.invalidateQueries({ queryKey: ['todos', newTodo.projectId] });
        },
    });
};

export const useUpdateTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Todo) => api.updateTodo(data),
        onSuccess: (updatedTodo) => {
            queryClient.invalidateQueries({ queryKey: ['todos', updatedTodo.projectId] });
        },
    });
};

export const useDeleteTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.deleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};
