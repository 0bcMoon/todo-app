import React from 'react';
import { Project } from '../types';
import { useTodos } from '../hooks/useTodos';
import { useDeleteProject } from '../hooks/useProjects';
import { Trash2, FolderOpen, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {

    const { data: todos = [] } = useTodos(project.id);
    const deleteProject = useDeleteProject();

    const handleDeleteProject = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project and all its todos?')) {
            deleteProject.mutate(project.id);
        }
    };

    const todoStats = todos.reduce(
        (acc, todo) => {
            acc[todo.status]++;
            return acc;
        },
        { 'todo': 0, 'in-progress': 0, 'done': 0 }
    );

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <FolderOpen size={20} className="text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                        </h2>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    {project.description && (
                        <p className="text-gray-600 mb-4">{project.description}</p>
                    )}
                </div>

                <button
                    onClick={handleDeleteProject}
                    className="text-gray-400 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete project"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">
                        <span className="font-medium">{todoStats.todo}</span> To Do
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600">
                        <span className="font-medium">{todoStats['in-progress']}</span> In Progress
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">
                        <span className="font-medium">{todoStats.done}</span> Done
                    </span>
                </div>
            </div>
        </div>
    );
};
