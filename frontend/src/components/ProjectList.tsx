import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { Plus, FolderPlus, LogOut, Menu, X } from 'lucide-react';
import { api } from '../api/api';

export const ProjectList: React.FC = () => {
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: projects = [], isLoading, error } = useProjects();
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n') {
                setShowProjectForm(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleProjectClick = (projectId: string) => {
        navigate(`/project/${projectId}`);
    };

    const handleLogout = async () => {
            await api.logout();
            navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading projects...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">Error loading projects</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-600 mt-1">Manage your projects and todos</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Desktop buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={() => setShowProjectForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={20} />
                                New Project
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu */}
                        <div className="md:hidden relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-gray-200">
                                {isMenuOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setShowProjectForm(true);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        New Project
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderPlus size={48} className="text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-600 mb-4">Get started by creating your first project</p>
                        <button
                            onClick={() => setShowProjectForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => handleProjectClick(project.id)}
                            />
                        ))}
                    </div>
                )}

                {showProjectForm && (
                    <ProjectForm onClose={() => setShowProjectForm(false)} />
                )}
            </div>
        </div>
    );
};
