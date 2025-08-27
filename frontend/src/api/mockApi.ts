import { Project, Todo, CreateProjectData, CreateTodoData, UpdateTodoData, TodoStatus } from '../types';

// Mock data storage
let projects: Project[] = [
    {
        id: '1',
        name: 'Personal Tasks',
        description: 'My personal todo list',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        name: 'Work Project',
        description: 'Work-related tasks and deadlines',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
    },
];

let todos: Todo[] = [
    {
        id: '1',
        title: 'Setup development environment',
        description: 'Install Node.js, VS Code, and other necessary tools',
        status: 'done' as TodoStatus,
        projectId: '2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        title: 'Design user interface',
        description: 'Create wireframes and mockups for the application',
        status: 'in-progress' as TodoStatus,
        projectId: '2',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
    },
    {
        id: '3',
        title: 'Go grocery shopping',
        description: 'Buy milk, bread, eggs, and fruits for the week',
        status: 'todo' as TodoStatus,
        projectId: '1',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
    },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    // Projects
    getProjects: async (): Promise<Project[]> => {
        await delay(300);
        return [...projects];
    },

    createProject: async (data: CreateProjectData): Promise<Project> => {
        await delay(500);
        const newProject: Project = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        projects.push(newProject);
        return newProject;
    },

    deleteProject: async (id: string): Promise<void> => {
        await delay(300);
        projects = projects.filter(p => p.id !== id);
        todos = todos.filter(t => t.projectId !== id);
    },

    // Todos
    getTodosByProject: async (projectId: string): Promise<Todo[]> => {
        await delay(200);
        return todos.filter(todo => todo.projectId === projectId);
    },

    createTodo: async (data: CreateTodoData): Promise<Todo> => {
        await delay(400);
        const newTodo: Todo = {
            id: Date.now().toString(),
            ...data,
            status: 'todo' as TodoStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        todos.push(newTodo);
        return newTodo;
    },

    updateTodo: async (data: UpdateTodoData): Promise<Todo> => {
        await delay(300);
        const todoIndex = todos.findIndex(t => t.id === data.id);
        if (todoIndex === -1) {
            throw new Error('Todo not found');
        }

        todos[todoIndex] = {
            ...todos[todoIndex],
            ...data,
            updatedAt: new Date(),
        };

        return todos[todoIndex];
    },

    deleteTodo: async (id: string): Promise<void> => {
        await delay(300);
        todos = todos.filter(t => t.id !== id);
    },
};
