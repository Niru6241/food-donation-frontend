import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ReactNode } from 'react';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/donor/Dashboard';
import NgoDashboard from './pages/ngo/Dashboard';
// Context
import { AuthProvider, useAuth } from './context/AuthContext';

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/login"
                            element={
                                <AuthRedirect>
                                    <Login />
                                </AuthRedirect>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <AuthRedirect>
                                    <Register />
                                </AuthRedirect>
                            }
                        />
                        <Route
                            path="/donor/dashboard"
                            element={
                                <ProtectedRoute role="ROLE_DONOR">
                                    <DonorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ngo/dashboard"
                            element={
                                <ProtectedRoute role="ROLE_NGO">
                                    <NgoDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    <Toaster position="top-right" />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

// Redirect authenticated users away from login/register
const AuthRedirect = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth();
    console.log('AuthRedirect:', { isAuthenticated, user });

    if (isAuthenticated && user) {
        // Redirect based on role
        if (user.role === 'ROLE_DONOR') {
            return <Navigate to="/donor/dashboard" replace />;
        } else if (user.role === 'ROLE_NGO') {
            return <Navigate to="/ngo/dashboard" replace />;
        }
    }
    return <>{children}</>;
};

interface ProtectedRouteProps {
    children: ReactNode;
    role?: string;
}


// Protected route component that uses AuthContext
const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();
    console.log('AuthRedirect:', { isAuthenticated, user });


    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access if role is specified
    if (role && user.role !== role) {
        // Redirect to appropriate dashboard based on user's actual role
        if (user.role === 'ROLE_DONOR') {
            return <Navigate to="/donor/dashboard" replace />;
        } else if (user.role === 'ROLE_NGO') {
            return <Navigate to="/ngo/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};