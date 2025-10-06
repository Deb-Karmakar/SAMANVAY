import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
    LayoutDashboard, 
    Map, 
    Timer, 
    Users, 
    Wallet, 
    MessageSquareWarning, 
    LogOut, 
    Menu, 
    X, 
    Star,
    Bell,
    Search,
    Settings,
    HelpCircle,
    ChevronRight,
    Home,
    SunMoon,
    IndianRupee,
    Activity,
    TrendingUp,
    FileText,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Navigation Configuration for State/UT Nodal Officer ---
const navLinks = [
    { 
        name: 'Dashboard', 
        path: '/state/dashboard', 
        icon: LayoutDashboard,
        badge: null,
        description: 'State Overview'
    },
    { 
        name: 'State Map', 
        path: '/state/map', 
        icon: Map,
        badge: null,
        description: 'Geographic View'
    },
    { 
        name: 'Projects', 
        path: '/state/projects', 
        icon: Timer,
        badgeVariant: 'secondary',
        description: 'Track Progress'
    },
    { 
        name: 'Reviews', 
        path: '/state/reviews', 
        icon: Star,
        badgeVariant: 'destructive',
        description: 'Pending Reviews'
    },
    { 
        name: 'Agencies', 
        path: '/state/agencies', 
        icon: Users,
        badge: null,
        description: 'Executing Partners'
    },
    { 
        name: 'Funds', 
        path: '/state/funds', 
        icon: Wallet,
        badgeVariant: 'default',
        description: 'Fund Distribution'
    },
    { 
        name: 'Alerts', 
        path: '/state/alerts', 
        icon: Bell,
        badgeVariant: 'destructive',
        description: 'Notifications & Updates'
    },
    { 
        name: 'Messages', 
        path: '/state/communications', 
        icon: MessageSquareWarning,
        badgeVariant: 'default',
        description: 'Communications'
    },
];

// --- State Quick Stats Component ---
const StateQuickStats = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 px-4 md:px-0">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="text-2xl font-bold">48</div>
                <div className="text-xs opacity-90">State Projects</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <IndianRupee className="w-5 h-5 opacity-80" />
                    <span className="text-xs">+8%</span>
                </div>
                <div className="text-2xl font-bold">₹12.3L</div>
                <div className="text-xs opacity-90">Funds Allocated</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <Building2 className="w-5 h-5 opacity-80" />
                </div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-xs opacity-90">Active Agencies</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 opacity-80" />
                    <span className="text-xs">Good</span>
                </div>
                <div className="text-2xl font-bold">87%</div>
                <div className="text-xs opacity-90">Performance</div>
            </div>
        </div>
    );
};

// --- Main Layout Component ---
export default function StateLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-900">
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
                        {location.pathname === '/state/dashboard' && <StateQuickStats />}
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
            <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-900">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold text-white">SAMANVAY</h1>
                    <p className="text-xs text-teal-100">State Management Portal</p>
                    <div className="mt-2 px-2 py-1 bg-white/20 rounded-md inline-block">
                        <p className="text-xs text-white font-medium">
                            {userInfo?.state || 'Uttar Pradesh'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-4 border-b dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                        placeholder="Quick search..." 
                        className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
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
                            <Avatar className="h-10 w-10 ring-2 ring-teal-500 ring-offset-2">
                                <AvatarImage src={userInfo.avatarUrl} alt={userInfo.fullName} />
                                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                                    {getInitials(userInfo.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{userInfo.fullName}</p>
                                <p className="text-xs text-muted-foreground">State Nodal Officer</p>
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
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Reports
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
                            <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
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
                                <DropdownMenuLabel>State Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="max-h-96 overflow-y-auto">
                                    <DropdownMenuItem className="flex flex-col items-start py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                            <span className="text-xs text-muted-foreground">30 mins ago</span>
                                        </div>
                                        <p className="text-sm mt-1">Review pending for District Hostel Project</p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex flex-col items-start py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="text-xs">Update</Badge>
                                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                                        </div>
                                        <p className="text-sm mt-1">Fund allocation approved for 3 projects</p>
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>


                        {/* User Menu - Desktop Only */}
                        {userInfo && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="hidden lg:flex items-center gap-2 px-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs">
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
                                            {userInfo.state || 'State Officer'}
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
                                placeholder="Search projects, agencies..." 
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
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-600 to-teal-700">
                    <div>
                        <h1 className="text-lg font-bold text-white">SAMANVAY</h1>
                        <p className="text-xs text-teal-100">State Portal</p>
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
                            <Avatar className="h-12 w-12 ring-2 ring-teal-500 ring-offset-2">
                                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                                    {getInitials(userInfo.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{userInfo.fullName}</p>
                                <p className="text-xs text-muted-foreground">State Nodal Officer</p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                    {userInfo.state || 'Uttar Pradesh'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

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
        navLinks[1], // Map
        navLinks[2], // Projects
        navLinks[3], // Reviews
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t dark:border-slate-800 z-20">
            <div className="grid grid-cols-4 gap-1 p-2">
                {bottomNavItems.map(link => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors",
                            isActive 
                                ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400" 
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
                ? "bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
        )}
    >
        <div className="flex items-center gap-3">
            <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive 
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30" 
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
                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
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