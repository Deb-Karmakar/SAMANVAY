import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // 1. Import the useAuth hook
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
    LayoutDashboard, Map, Bell, Landmark, BookUser, Timer, BarChart3, LogOut, Menu, X, User, MessageSquareWarning
} from 'lucide-react';

// --- Navigation Links (unchanged) ---
const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'GIS Map View', path: '/admin/map', icon: Map },
    { name: 'Alerts & Notices', path: '/admin/alerts', icon: Bell },
    { name: 'Fund Management', path: '/admin/funds', icon: Landmark },
    { name: 'Agency Directory', path: '/admin/agencies', icon: BookUser },
    { name: 'Project Tracker', path: '/admin/projects', icon: Timer },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Communications', path: '/admin/communications', icon: MessageSquareWarning },
];

// --- Helper function to get initials from a name ---
const getInitials = (name = "") => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};


// --- Main Layout Component ---
export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-800 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}


// --- Sub-components ---

const Sidebar = () => {
    // 2. Get user info and logout function from the context
    const { userInfo, logout } = useAuth();

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-slate-950 border-r dark:border-slate-800">
            <div className="px-6 py-4 flex items-center gap-2">
                <img src="/logo.png" alt="SAMANVAY Logo" className="h-18 w-auto"/>
            </div>
            <nav className="flex-1 px-4 py-2 space-y-2">
                {navLinks.map(link => <NavItem key={link.name} link={link} />)}
            </nav>
            <div className="px-4 py-4 border-t dark:border-slate-800">
                {userInfo && (
                    <>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={userInfo.avatarUrl} alt={userInfo.fullName}/>
                                {/* 3. Generate initials dynamically */}
                                <AvatarFallback>{getInitials(userInfo.fullName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                {/* 4. Display real user name and email */}
                                <p className="font-semibold text-sm">{userInfo.fullName}</p>
                                <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
};

const Header = ({ onMenuClick }) => {
    const location = useLocation();
    const { userInfo, logout } = useAuth();
    const currentLink = navLinks.find(link => location.pathname.startsWith(link.path));
    const pageTitle = currentLink ? currentLink.name : "Dashboard";

    return (
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b dark:border-slate-800 sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}><Menu className="w-6 h-6" /></Button>
                <h1 className="text-lg font-semibold md:hidden">{pageTitle}</h1>
            </div>
            
            <div className="flex items-center gap-4">
                 <p className="hidden md:block text-lg font-semibold">{pageTitle}</p>
                 {/* Added a user dropdown to the main header for consistency */}
                 {userInfo && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(userInfo.fullName)}</AvatarFallback></Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuItem className="font-normal flex flex-col items-start">
                                <p className="text-sm font-medium leading-none">{userInfo.fullName}</p>
                                <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
            </div>
        </header>
    );
};

const MobileSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { userInfo, logout } = useAuth();

    useEffect(() => { setIsOpen(false); }, [location, setIsOpen]);

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-950 z-50 shadow-lg transform transition-transform md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                    <div className="flex items-center gap-2">
                         <img src="/logo.png" alt="SAMANVAY Logo" className="h-12 w-auto"/>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></Button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navLinks.map(link => <NavItem key={link.name} link={link} />)}
                </nav>
                {/* Added user/logout section to mobile drawer */}

            </div>
        </>
    );
};

const NavItem = ({ link }) => (
    <NavLink to={link.path} className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${ isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800' }`}>
        <link.icon className="w-5 h-5 mr-3" />
        {link.name}
    </NavLink>
);