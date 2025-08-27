export type TodoStatus = 'todo' | 'in-progress' | 'done';

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface CreateTodoData {
  title: string;
  description: string;
  projectId: string;
}

export interface UpdateTodoData {
  id: string;
  status?: TodoStatus;
  title?: string;
  description?: string;
}
