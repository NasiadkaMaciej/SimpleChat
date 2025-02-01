import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader } from "lucide-react";
import { Toaster } from 'react-hot-toast';

import NavBar from './components/layout/NavBar';
import ChatPage from './pages/ChatPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/useAuthStore';
import EmailVerificationPage from './pages/EmailVerificationPage';

const App = () => {
	const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

	function NotFoundRedirect() { // Crazy way to fix react 404 error handling
		const location = useLocation();
		useEffect(() => {
			if (location.pathname !== '/404.php')
				window.location.href = 'https://front.nasiadka.pl/404.php';
		}, [location.pathname]);

		return null;
	}

	// Check if user is authenticated
	useEffect(() => { checkAuth(); }, [checkAuth]);

	// Animation when checking authentication
	if (isCheckingAuth && !authUser) return (
		<div className="flex justify-center items-center h-screen" >
			<Loader className="size-10 animate-spin" />
		</div>
	);

	return (
		<div>
			<NavBar />
			<Routes>
				<Route path='/' element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
				<Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
				<Route path='/verify-email' element={<EmailVerificationPage />} /> {/* Ensure this line is present */}
				<Route path="*" element={<NotFoundRedirect />} />
			</Routes>
			<Toaster /> { /* Makes all toasts appear in the app */}
		</div>
	);
}
export default App;