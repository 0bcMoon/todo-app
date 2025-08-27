import React from 'react';
import { Todo, TodoStatus } from '../types';
import { TodoItem } from './TodoItem';

interface TodoColumnProps {
    title: string;
    status: TodoStatus;
    todos: Todo[];
    color: string;
}

export const TodoColumn: React.FC<TodoColumnProps> = ({
    title,
    status,
    todos,
    color
}) => {
    const filteredTodos = todos.filter(todo => todo.status === status);

    return (
        <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {filteredTodos.length}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {filteredTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
                {filteredTodos.length === 0 && (
                    <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        No {title.toLowerCase()} items
                    </div>
                )}
            </div>
        </div>
    );
};
