import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider, useAuth } from './AuthContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';
import { ProjectList } from './components/ProjectList.tsx';
import LoginForm from './login.tsx';
import { ProjectPage } from './components/ProjectPage.tsx';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const AuthLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {

        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className='animate-spin' size={48} />
            </div>
        )
    }

    return (
        <>
            <div><Toaster /></div>
            <Outlet />
        </>
    );
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            { index: true, element: <ProjectList /> },
            { path: "project/:projectId", element: <ProjectPage /> },
            { path: 'login', element: <LoginForm /> },
        ],
    },
])

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);
