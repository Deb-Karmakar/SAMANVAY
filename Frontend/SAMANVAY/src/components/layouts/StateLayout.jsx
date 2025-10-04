import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    LayoutDashboard, Map, Timer, Users, Wallet, MessageSquareWarning, LogOut, Menu, X,
} from 'lucide-react';

// --- Navigation Links for State/UT Nodal Officer ---
const navLinks = [
    { name: 'Dashboard', path: '/state/dashboard', icon: LayoutDashboard },
    { name: 'State Map View', path: '/state/map', icon: Map },
    { name: 'Project Tracker', path: '/state/projects', icon: Timer },
    { name: 'Executing Agencies', path: '/state/agencies', icon: Users },
    { name: 'Fund Distribution', path: '/state/funds', icon: Wallet },
    { name: 'Communications', path: '/state/communications', icon: MessageSquareWarning },
];

// --- Main Layout Component ---
export default function StateLayout() {
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


// --- Sub-components (Sidebar, Header, etc.) ---

const Sidebar = () => {
    // TODO: Replace with actual user data and logout logic
    const user = { name: "State Nodal Officer", state: "Uttar Pradesh" };
    const handleLogout = () => { alert("Logout logic goes here"); };

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-slate-950 border-r dark:border-slate-800">
            <div className="px-6 py-4 flex items-center gap-2">
                <img src="/logo.png" alt="SAMANVAY Logo" className="h-18 w-auto"/>            </div>
            <nav className="flex-1 px-4 py-2 space-y-2">
                {navLinks.map(link => <NavItem key={link.name} link={link} />)}
            </nav>
            <div className="px-4 py-4 border-t dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <Avatar><AvatarImage src="https://i.pravatar.cc/150?u=state" alt="User"/><AvatarFallback>SO</AvatarFallback></Avatar>
                    <div><p className="font-semibold text-sm">{user.name}</p><p className="text-xs text-muted-foreground">{user.state}</p></div>
                </div>
                <Button variant="ghost" className="w-full justify-start mt-4 text-muted-foreground" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
            </div>
        </aside>
    );
};

const Header = ({ onMenuClick }) => {
    const location = useLocation();
    const currentLink = navLinks.find(link => link.path === location.pathname);
    const pageTitle = currentLink ? currentLink.name : "Dashboard";

    return (
        <header className="flex items-center justify-between md:justify-end px-4 py-3 bg-white dark:bg-slate-950 border-b dark:border-slate-800 sticky top-0 z-10">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}><Menu className="w-6 h-6" /></Button>
            <h1 className="text-lg font-semibold md:hidden">{pageTitle}</h1>
            <div className="flex items-center gap-4"><p className="hidden md:block text-lg font-semibold">{pageTitle}</p></div>
        </header>
    );
};

const MobileSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    useEffect(() => { setIsOpen(false); }, [location, setIsOpen]);

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-950 z-50 shadow-lg transform transition-transform md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                    <div className="flex items-center gap-2"><img src="/logo.png" alt="SAMANVAY Logo" className="h-12 w-auto"/></div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></Button>
                </div>
                <nav className="p-4 space-y-2">{navLinks.map(link => <NavItem key={link.name} link={link} />)}</nav>
            </div>
        </>
    );
};

const NavItem = ({ link }) => (
    <NavLink to={link.path} className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${ isActive ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800' }`}>
        <link.icon className="w-5 h-5 mr-3" />
        {link.name}
    </NavLink>
);