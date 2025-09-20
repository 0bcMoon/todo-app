import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useTodos } from '../hooks/useTodos';
import { TodoColumn } from './TodoColumn';
import { TodoForm } from './TodoForm';
import { ArrowLeft, Plus } from 'lucide-react';

export const ProjectPage: React.FC = () => {

    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [showTodoForm, setShowTodoForm] = useState(false);

    useEffect(() => {

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n') {
                setShowTodoForm(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, []);

    const { data: projects = [] } = useProjects();
    const { data: todos = [], isLoading } = useTodos(projectId!);
    const project = projects.find(p => p.id === projectId);

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading todos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                            {project.description && (
                                <p className="text-gray-600 mt-1">{project.description}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTodoForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Todo
                    </button>
                </div>

                {/* TODO: Add drag-and-drop functionality */}
                {/* TODO: single column for mobile, drag-and-drop for desktop */}
                {/* TODO: add edit todo functionality */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TodoColumn
                        title="To Do"
                        status="todo"
                        todos={todos}
                        color="bg-gray-400"
                    />
                    <TodoColumn
                        title="In Progress"
                        status="in-progress"
                        todos={todos}
                        color="bg-blue-500"
                    />
                    <TodoColumn
                        title="Done"
                        status="done"
                        todos={todos}
                        color="bg-green-500"
                    />
                </div>

                {showTodoForm && (
                    <TodoForm
                        projectId={projectId!}
                        onClose={() => setShowTodoForm(false)}
                    />
                )}
            </div>
        </div>
    );
};
