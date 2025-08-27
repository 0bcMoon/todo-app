import React from 'react';
import { Todo, TodoStatus } from '../types';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { Trash2, MoreHorizontal, Edit2 } from 'lucide-react';

interface TodoItemProps {
    todo: Todo;
}

const statusColors = {
    todo: 'border-l-gray-400',
    'in-progress': 'border-l-blue-500',
    done: 'border-l-green-500',
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
    const updateTodo = useUpdateTodo();
    const deleteTodo = useDeleteTodo();

    const handleStatusChange = (status: TodoStatus) => {
        updateTodo.mutate({...todo, status});
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this todo?')) {
            deleteTodo.mutate(todo.id);
        }
    };

    const handleEdit = () => {
        if (window.confirm('TODO: Implement edit functionality') ) {
            // Placeholder for edit functionality

        }
    };

    const getNextStatus = (): TodoStatus | null => {
        switch (todo.status) {
            case 'todo':
                return 'in-progress';
            case 'in-progress':
                return 'done';
            case 'done':
                return null;
            default:
                return null;
        }
    };

    const getPrevStatus = (): TodoStatus | null => {
        switch (todo.status) {
            case 'done':
                return 'in-progress';
            case 'in-progress':
                return 'todo';
            case 'todo':
                return null;
            default:
                return null;
        }
    };

    const nextStatus = getNextStatus();
    const prevStatus = getPrevStatus();

    return (
        <div className={`bg-white border-l-4 ${statusColors[todo.status]} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group`}>
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm leading-tight">{todo.title}</h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative group/menu">
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                            <MoreHorizontal size={14} />
                        </button>
                        <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                            {prevStatus && (
                                <button
                                    onClick={() => handleStatusChange(prevStatus)}
                                    className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                >
                                    Move to {prevStatus === 'in-progress' ? 'In Progress' : 'To Do'}
                                </button>
                            )}
                            {nextStatus && (
                                <button
                                    onClick={() => handleStatusChange(nextStatus)}
                                    className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                >
                                    Move to {nextStatus === 'in-progress' ? 'In Progress' : 'Done'}
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleEdit}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Delete todo"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Delete todo"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {todo.description && (
                <p className="text-gray-600 text-xs leading-relaxed">{todo.description}</p>
            )}
        </div>
    );
};
