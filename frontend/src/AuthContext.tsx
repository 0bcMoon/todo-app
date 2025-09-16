
// AuthContext.tsx
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api/api';
import { Loader } from 'lucide-react';

interface AuthContextType {
    setAuth: (auth: boolean) => void;
    isAuthenticated: boolean;
    logout: () => void;
    isLoading: boolean;
}


// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [isAuthenticated, setAuth] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(true);

    const logout = () => {
        api.logout();
        setAuth(false);
    };

    const { isLoading: isLoadingUser, isError, isSuccess } = useQuery({
        queryKey: ['user'],
        queryFn: async () => (await api.auth()),
    })

    useEffect(() => {
        if (isError) {
            logout();
            setLoading(false);
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess) {
            setAuth(true);
            setLoading(false);
        }
    }, [isSuccess]);

    if (isLoadingUser || isLoading) {

        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className='animate-spin' size={48} />
            </div>
        )
    }

    return (
        <AuthContext.Provider
            value={{
                setAuth,
                isAuthenticated,
                logout,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
