import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, MapPin, Wallet, Bell, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- Navigation Links ---
const navLinks = [
    { name: 'Home', path: '/agency/dashboard', icon: Home },
    { name: 'Projects', path: '/agency/projects', icon: ClipboardList },
    { name: 'Map', path: '/agency/map', icon: MapPin },
    { name: 'Funds', path: '/agency/funds', icon: Wallet },
    { name: 'Inbox', path: '/agency/inbox', icon: Bell },
];

// --- Main Layout Component ---
export default function AgencyLayout() {
    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
            <Header />
            {/* Main content now has less bottom padding */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-8">
                <Outlet />
            </main>
        </div>
    );
}

// --- NEW Responsive Header Component ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close mobile menu on navigation
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        alert("Logout successful! (Simulated)");
        // In a real app, you would clear auth tokens here
        navigate('/login');
    };

    return (
        <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side: Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/agency/dashboard')}>
                        <img src="/logo2.png" alt="SAMANVAY Logo" className="h-28 w-auto"/>                    </div>

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden md:flex md:items-center md:space-x-4">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground hover:bg-muted/50'
                                }`}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Side: Profile & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9"><AvatarImage src="https://i.pravatar.cc/150?u=agency" /><AvatarFallback>EA</AvatarFallback></Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Hamburger Button */}
                        <div className="md:hidden">
                            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t dark:border-slate-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground hover:bg-muted/50'
                                }`}
                            >
                                <link.icon className="mr-3 h-5 w-5" />
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};