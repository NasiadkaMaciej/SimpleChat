import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, LogOut, Sun, Users } from "lucide-react";
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const themes = ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset"];

const Navbar = () => {
	const [theme, setTheme] = useState('autumn');
	const { logout, authUser } = useAuthStore();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null); // Add ref for dropdown
	const setSelectedUser = useChatStore((state) => state.setSelectedUser);

	useEffect(() => { // Close dropdown when clicked outside
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target))
				setIsDropdownOpen(false);
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => { // Load theme from local storage
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			document.documentElement.setAttribute('data-theme', savedTheme);
			setTheme(savedTheme);
		} else localStorage.setItem('theme', theme);
	}, [theme]);

	useEffect(() => {
		// Set default theme to autumn if no theme is saved
		const savedTheme = localStorage.getItem('theme');
		if (!savedTheme) {
			document.documentElement.setAttribute('data-theme', 'autumn');
			localStorage.setItem('theme', 'autumn');
			setTheme('autumn');
		} else {
			document.documentElement.setAttribute('data-theme', savedTheme);
			setTheme(savedTheme);
		}
	}, []);

	const handleThemeChange = (theme) => { // Change theme
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		setTheme(theme); // Update the state with the new theme
		setIsDropdownOpen(false);
	};

	const handleWelcomeChat = () => {
		setSelectedUser(null);
	};

	const renderThemePreview = (theme) => {
		return (
			<div className={`flex items-center justify-center w-16 h-8 rounded-lg bg-base`} data-theme={theme}>
				<div className={`size-3 rounded-full bg-primary mx-0.5`} data-theme={theme}></div>
				<div className={`size-3 rounded-full bg-secondary mx-0.5`} data-theme={theme}></div>
				<div className={`size-3 rounded-full bg-accent mx-0.5`} data-theme={theme}></div>
				<div className={`size-3 rounded-full bg-neutral mx-0.5`} data-theme={theme}></div>
			</div>
		);
	};

	return (
		<header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-50 backdrop-blur-lg bg-base-100/80">
			<div className="container mx-auto px-4 h-16">
				<div className="flex items-center justify-between h-full">
					<div className="flex items-center gap-8">
						<Link to="/" onClick={handleWelcomeChat} className="flex items-center gap-2.5 hover:opacity-80 transition-all btn btn-ghost">
							<div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
								<MessageSquare className="size-5 text-primary" />
							</div>
							<h1 className="text-lg font-bold">Simple Chat App</h1>
						</Link>
					</div>

					<div className="flex items-center gap-2">
						<div className="relative">
							<button className="btn btn-sm gap-2" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
								<Sun className="size-5" />
								<span className="hidden sm:inline">Themes</span>
							</button>
							{isDropdownOpen && (
								<ul className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-lg py-2 z-50 max-h-80 overflow-y-auto"
									ref={dropdownRef}>
									{themes.map((theme) => (
										<li key={theme} className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center justify-between"
											onClick={() => handleThemeChange(theme)}>
											<span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
											{renderThemePreview(theme)}
										</li>
									))}
								</ul>
							)}
						</div>
						{authUser && (
							<>
								<Link to="/contacts" className={`btn btn-sm gap-2`}>
									<Users className="size-5" />
									<span className="hidden sm:inline">Contacts</span>
								</Link>
								<Link to={"/profile"} className={`btn btn-sm gap-2`}>
									<User className="size-5" />
									<span className="hidden sm:inline">Profile</span>
								</Link>
								<button className="btn btn-sm flex gap-2 items-center" onClick={logout}>
									<LogOut className="size-5" />
									<span className="hidden sm:inline">Logout</span>
								</button>
							</>
						)}

					</div>

				</div>
			</div>
		</header>
	);
};

export default Navbar;