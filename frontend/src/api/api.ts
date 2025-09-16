import axios from 'axios';
import { Project, Todo, CreateProjectData, CreateTodoData } from '../types';


interface LoginBody {
    username: string;
    password: string;
}
const _api = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

export const api = {
    auth: async (): Promise<any> => {
        const response = await _api.get("/user")
        return response.data;
    },
    login: async (user: LoginBody): Promise<any> => {
        const response = await _api.post("/auth/login", user)
        return response.data;
    },
    logout: async (): Promise<void> => {
        await _api.delete('/auth/logout');
    },
    // Projects
    getProjects: async (): Promise<Project[]> => {
        const response = await _api.get("/projects")
        return response.data;
    },

    createProject: async (data: CreateProjectData): Promise<Project> => {
        const response = await _api.post('/projects', data);
        return response.data;
    },

    deleteProject: async (id: string): Promise<void> => {
        await _api.delete(`/projects/${id}`);
    },

    // Todos
    getTodosByProject: async (projectId: string): Promise<Todo[]> => {
        const response = await _api.get(`/projects/${projectId}/todos`);
        return response.data;
    },

    createTodo: async (data: CreateTodoData): Promise<Todo> => {
        const response = await _api.post('/todos', data);
        return response.data;
    },

    updateTodo: async (data: Todo): Promise<Todo> => {
        const response = await _api.put(`/todos/${data.id}`, data);
        return response.data;
    },

    deleteTodo: async (id: string): Promise<void> => {
        await _api.delete(`/todos/${id}`);
    },
};
