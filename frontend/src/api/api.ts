import { Project, Todo, CreateProjectData, CreateTodoData, UpdateTodoData } from '../types';

const API_URL = 'http://localhost:8080';

export const api = {
    // Projects
    getProjects: async (): Promise<Project[]> => {
        const response = await fetch(`${API_URL}/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        return response.json();
    },

    createProject: async (data: CreateProjectData): Promise<Project> => {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create project');
        }
        return response.json();
    },

    deleteProject: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete project');
        }
    },

    // Todos
    getTodosByProject: async (projectId: string): Promise<Todo[]> => {
        const response = await fetch(`${API_URL}/projects/${projectId}/todos`);
        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }
        return response.json();
    },

    createTodo: async (data: CreateTodoData): Promise<Todo> => {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create todo');
        }
        return response.json();
    },

    updateTodo: async (data: Todo): Promise<Todo> => {
        const response = await fetch(`${API_URL}/todos/${data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update todo');
        }
        return response.json();
    },

    deleteTodo: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
    },
};