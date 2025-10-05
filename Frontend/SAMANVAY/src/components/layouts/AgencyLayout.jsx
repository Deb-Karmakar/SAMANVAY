import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger, 
    DropdownMenuSeparator,
    DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import {
    Home,
    ClipboardList,
    MapPin,
    Wallet,
    Bell,
    Menu,
    X,
    User,
    LogOut,
    Search,
    Settings,
    HelpCircle,
    ChevronRight,
    SunMoon,
    IndianRupee,
    Activity,
    TrendingUp,
    FileText,
    Building2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Navigation Configuration for Agency ---
const navLinks = [
    { 
        name: 'Dashboard', 
        path: '/agency/dashboard', 
        icon: Home,
        badge: null,
        description: 'Overview & Stats'
    },
    { 
        name: 'Projects', 
        path: '/agency/projects', 
        icon: ClipboardList,
        badge: '8',
        badgeVariant: 'secondary',
        description: 'Manage Projects'
    },
    { 
        name: 'Map View', 
        path: '/agency/map', 
        icon: MapPin,
        badge: null,
        description: 'Location Tracking'
    },
    { 
        name: 'Funds', 
        path: '/agency/funds', 
        icon: Wallet,
        badge: 'New',
        badgeVariant: 'default',
        description: 'Financial Status'
    },
    { 
        name: 'Inbox', 
        path: '/agency/inbox', 
        icon: Bell,
        badge: '4',
        badgeVariant: 'destructive',
        description: 'Messages & Alerts'
    },
];

// --- Agency Quick Stats Component ---
const AgencyQuickStats = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 px-4 md:px-0">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <ClipboardList className="w-5 h-5 opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs opacity-90">Total Projects</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <IndianRupee className="w-5 h-5 opacity-80" />
                    <span className="text-xs">Released</span>
                </div>
                <div className="text-2xl font-bold">₹8.7L</div>
                <div className="text-xs opacity-90">Fund Received</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 opacity-80" />
                </div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs opacity-90">In Progress</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-5 h-5 opacity-80" />
                    <span className="text-xs">75%</span>
                </div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs opacity-90">Completed</div>
            </div>
        </div>
    );
};

// --- Main Layout Component ---
export default function AgencyLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Mobile Sidebar Overlay */}
            <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onMenuClick={() => setIsSidebarOpen(true)} 
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                />
                
                {/* Breadcrumb for Desktop */}
                <Breadcrumb />
                
                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8 max-w-7xl">
                        {location.pathname === '/agency/dashboard' && <AgencyQuickStats />}
                        <Outlet />
                    </div>
                </main>
                
                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />
            </div>
        </div>
    );
}

// --- Desktop Sidebar ---
const Sidebar = () => {
    const { userInfo, logout } = useAuth();
    const location = useLocation();

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white dark:bg-slate-950 border-r dark:border-slate-800 shadow-xl">
            {/* Brand Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold text-white">SAMANVAY</h1>
                    <p className="text-xs text-indigo-100">Agency Portal</p>
                    <div className="mt-2 flex flex-col gap-1">
                        <div className="px-2 py-1 bg-white/20 rounded-md inline-block">
                            <p className="text-xs text-white font-medium">
                                {userInfo?.agencyName || 'Executing Agency'}
                            </p>
                        </div>
                        <div className="text-xs text-indigo-200">
                            ID: {userInfo?.agencyId || 'AG-2024-001'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-4 border-b dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                        placeholder="Search projects..." 
                        className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-b dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Reports
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Timeline
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navLinks.map(link => (
                    <NavItem key={link.name} link={link} isActive={location.pathname.startsWith(link.path)} />
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t dark:border-slate-800">
                {userInfo && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-indigo-500 ring-offset-2">
                                <AvatarImage src={userInfo.avatarUrl} alt={userInfo.fullName} />
                                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                                    {getInitials(userInfo.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{userInfo.fullName}</p>
                                <p className="text-xs text-muted-foreground">Agency Officer</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        Agency Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        Help & Support
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

// --- Header Component ---
const Header = ({ onMenuClick, isSearchOpen, setIsSearchOpen }) => {
    const location = useLocation();
    const { userInfo, logout } = useAuth();
    const currentLink = navLinks.find(link => location.pathname.startsWith(link.path));
    const pageTitle = currentLink ? currentLink.name : "Dashboard";

    return (
        <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 sticky top-0 z-20 shadow-sm">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden" 
                            onClick={onMenuClick}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden">
                            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                                SAMANVAY
                            </span>
                        </div>
                        
                        {/* Desktop Page Title */}
                        <h1 className="hidden lg:block text-xl font-semibold">{pageTitle}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search Button for Mobile */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="w-5 h-5" />
                        </Button>

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="max-h-96 overflow-y-auto">
                                    <DropdownMenuItem className="flex flex-col items-start py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="destructive" className="text-xs">Action Required</Badge>
                                            <span className="text-xs text-muted-foreground">1 hour ago</span>
                                        </div>
                                        <p className="text-sm mt-1">Submit progress report for Project #A-234</p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex flex-col items-start py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">Fund Update</Badge>
                                            <span className="text-xs text-muted-foreground">3 hours ago</span>
                                        </div>
                                        <p className="text-sm mt-1">₹2.5L released for Hostel Construction</p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex flex-col items-start py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="text-xs">Reminder</Badge>
                                            <span className="text-xs text-muted-foreground">Yesterday</span>
                                        </div>
                                        <p className="text-sm mt-1">Monthly review meeting scheduled for tomorrow</p>
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Project Status Indicator */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-muted-foreground">5 Active</span>
                            </div>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                <span className="text-xs text-muted-foreground">2 Pending</span>
                            </div>
                        </div>



                        {/* User Menu - Desktop Only */}
                        {userInfo && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="hidden lg:flex items-center gap-2 px-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs">
                                                {getInitials(userInfo.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuItem className="font-normal flex flex-col items-start">
                                        <p className="text-sm font-medium">{userInfo.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            {userInfo.agencyName || 'Agency Officer'}
                                        </Badge>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout} className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="mt-3 lg:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input 
                                placeholder="Search projects, funds..." 
                                className="pl-10 w-full"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

// --- Breadcrumb Component ---
const Breadcrumb = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    return (
        <div className="hidden lg:flex items-center gap-2 px-8 py-3 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800">
            <Home className="w-4 h-4 text-slate-400" />
            {pathSegments.map((segment, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className={cn(
                        "text-sm capitalize",
                        index === pathSegments.length - 1 
                            ? "text-slate-900 dark:text-white font-medium" 
                            : "text-slate-500 dark:text-slate-400"
                    )}>
                        {segment}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Mobile Sidebar ---
const MobileSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { userInfo, logout } = useAuth();

    useEffect(() => {
        setIsOpen(false);
    }, [location, setIsOpen]);

    return (
        <>
            {/* Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <div className={cn(
                "fixed top-0 left-0 h-full w-80 bg-white dark:bg-slate-950 z-50 shadow-2xl transform transition-transform lg:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <div>
                        <h1 className="text-lg font-bold text-white">SAMANVAY</h1>
                        <p className="text-xs text-indigo-100">Agency Portal</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* User Info */}
                {userInfo && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-indigo-500 ring-offset-2">
                                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                                    {getInitials(userInfo.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{userInfo.fullName}</p>
                                <p className="text-xs text-muted-foreground">Agency Officer</p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                    ID: {userInfo.agencyId || 'AG-2024-001'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="px-4 py-3 grid grid-cols-2 gap-2 border-y dark:border-slate-800">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Active</p>
                        <p className="text-lg font-bold">5</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-bold">2</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navLinks.map(link => (
                        <MobileNavItem key={link.name} link={link} />
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t dark:border-slate-800 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={logout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </>
    );
};

// --- Mobile Bottom Navigation ---
const MobileBottomNav = () => {
    const location = useLocation();
    const bottomNavItems = [
        navLinks[0], // Dashboard
        navLinks[1], // Projects
        navLinks[2], // Map
        navLinks[3], // Funds
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t dark:border-slate-800 z-20">
            <div className="grid grid-cols-4 gap-1 p-2">
                {bottomNavItems.map(link => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors relative",
                            isActive 
                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                                : "text-slate-500 dark:text-slate-400"
                        )}
                    >
                        <link.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">{link.name}</span>
                        {link.badge && (
                            <span className="absolute top-1 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

// --- Navigation Items ---
const NavItem = ({ link, isActive }) => (
    <NavLink
        to={link.path}
        className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
            isActive
                ? "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
        )}
    >
        <div className="flex items-center gap-3">
            <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                    : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
            )}>
                <link.icon className="w-4 h-4" />
            </div>
            <div>
                <p className="font-medium text-sm">{link.name}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
            </div>
        </div>
        {link.badge && (
            <Badge variant={link.badgeVariant || "default"} className="ml-2">
                {link.badge}
            </Badge>
        )}
    </NavLink>
);

const MobileNavItem = ({ link }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(link.path);
    
    return (
        <NavLink
            to={link.path}
            className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
        >
            <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
            </div>
            {link.badge && (
                <Badge variant={link.badgeVariant || "default"} className="ml-2">
                    {link.badge}
                </Badge>
            )}
        </NavLink>
    );
};

// --- Helper Functions ---
const getInitials = (name = "") => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};