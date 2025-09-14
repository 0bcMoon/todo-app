import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Eye, EyeOff, User2 } from 'lucide-react';
import { api } from './api/api';
import { useAuth } from './AuthContext';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
    password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;


const LoginForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const { setAuth } = useAuth();



    const loginMutation = useMutation({
        mutationFn: api.login,
        onSuccess: () => {
            setAuth(true)
        },
    });


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const result = loginSchema.safeParse(data);
        if (result.success) {
            setErrors({});
            loginMutation.mutate(result.data);
            return;
        }
        const newErrors: { username?: string; password?: string } = {};
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.keys(fieldErrors).forEach(key => {
            const field = key as keyof LoginFormData;
            if (fieldErrors[field]) {
                newErrors[field] = fieldErrors[field][0];
            }
        });
        setErrors(newErrors);
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                            <p className="text-gray-600">Sign in to your account</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        name="username"
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 
                                    focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                    ${errors.username ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Enter your username"
                                    />
                                    <User2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name='password'
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 
                                    focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                    ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className=" w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            {/* Error Message */}
                            {loginMutation.isError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">
                                        Login failed. Please check your credentials and try again.
                                    </p>
                                </div>
                            )}
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
