"use client";

import { useState, ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { 
  Home, 
  Clipboard, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Bell,
  Search
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  expanded: boolean;
}

function NavItem({ href, icon, label, active, expanded }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                 ${active 
                   ? "bg-primary-100/50 text-primary-800 shadow-sm" 
                   : "text-gray-600 hover:bg-white/40 hover:text-primary-700"}`}
    >
      <div className="flex-shrink-0 text-current">
        {icon}
      </div>
      {expanded && (
        <span className={`font-medium transition-all duration-300 ${
          expanded ? "opacity-100" : "opacity-0 w-0"
        }`}>
          {label}
        </span>
      )}
      
      {!expanded && (
        <div className="absolute left-16 z-50 origin-left scale-0 px-3 py-2 rounded-md bg-white shadow-lg
                      text-gray-800 font-medium whitespace-nowrap group-hover:scale-100 transition-all duration-150">
          {label}
        </div>
      )}
    </Link>
  );
}

// Divider component for sidebar sections
function SidebarDivider({ label, expanded }: { label: string, expanded: boolean }) {
  if (!expanded) return <div className="border-t border-gray-200/30 my-3 mx-3" />;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-gray-200/30"></div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [expanded, setExpanded] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showMobileNav && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowMobileNav(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileNav]);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Reset expanded state on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="glass-card p-8 animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary-200 mb-4"></div>
          <div className="h-4 w-32 bg-primary-100 rounded mb-2"></div>
          <div className="h-3 w-24 bg-primary-50 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="glass-card p-8 max-w-md animate-fadeIn">
          <h2 className="text-2xl font-bold text-primary-700 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the OptiPlus dashboard.</p>
          <Link href="/staff-login" className="primary-button inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const mainNavItems = [
    {
      href: "/reception",
      label: "Reception",
      icon: <Home size={20} />,
      section: "main"
    },
    {
      href: "/examination",
      label: "Examination",
      icon: <Clipboard size={20} />,
      section: "main"
    },
    {
      href: "/sales-order",
      label: "Sales Order",
      icon: <ShoppingCart size={20} />,
      section: "main"
    },
    {
      href: "/clients",
      label: "Clients",
      icon: <Users size={20} />,
      section: "main"
    },
  ];
  
  const adminNavItems = [
    {
      href: "/admin-login",
      label: "Admin Panel",
      icon: <Settings size={20} />,
      section: "admin"
    },
  ];

  const handleToggleSidebar = () => {
    setExpanded(!expanded);
  };
  
  const handleMobileNavToggle = () => {
    setShowMobileNav(!showMobileNav);
  };

  const activeSection = [...mainNavItems, ...adminNavItems].find(item => pathname === item.href)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 bg-fixed overflow-hidden">
      {/* Mobile Nav Overlay */}
      {showMobileNav && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
             onClick={() => setShowMobileNav(false)}></div>
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed z-30 top-0 left-0 h-full transition-all duration-300 ease-in-out
                   ${expanded ? "w-64" : "w-20"} 
                   ${showMobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                   lg:block animate-fadeIn`}
      >
        <div className="flex flex-col h-full glass-card rounded-r-xl shadow-xl overflow-hidden">
          {/* Logo Area */}
          <div className={`p-5 border-b border-white/10 backdrop-blur-md 
                          ${expanded ? "justify-start" : "justify-center"}
                          flex items-center`}>
            <div className="relative flex items-center">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                <Image 
                  src="/logo.png" 
                  alt="OptiPlus Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              {expanded && (
                <div className="ml-3 opacity-100 transition-opacity duration-300">
                  <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                    OptiPlus
                  </h2>
                  <p className="text-xs text-gray-500">Optical Management</p>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleToggleSidebar}
            className="absolute -right-3 top-16 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg
                      transition-all hidden lg:block z-30"
            aria-label="Toggle sidebar"
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* User Profile Card */}
          <div className={`px-4 pt-5 pb-3 ${!expanded && "text-center"}`}>
            <div className={`flex ${expanded ? "items-start gap-3" : "flex-col items-center"}`}>
              <div className="h-12 w-12 rounded-full glass flex items-center justify-center
                           bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 
                           font-bold shadow-sm border border-white/50">
                {session?.user?.name?.[0].toUpperCase() || "S"}
              </div>
              
              {expanded && (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 line-clamp-1">
                    {session?.user?.name || "Staff User"}
                  </span>
                  <span className="text-xs text-gray-500 line-clamp-1">
                    {session?.user?.email || "staff@optiplus.com"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto backdrop-blur-sm bg-white/5">
            <div className="space-y-1">
              <SidebarDivider label="Dashboard" expanded={expanded} />
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                  expanded={expanded}
                />
              ))}
              
              <SidebarDivider label="Administration" expanded={expanded} />
              {adminNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                  expanded={expanded}
                />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 backdrop-blur-sm bg-white/5">
            <button
              onClick={() => signOut({ callbackUrl: "/staff-login" })}
              className={`flex items-center gap-2.5 px-4 py-2.5 w-full ${expanded ? "justify-start" : "justify-center"}
                        text-red-600 rounded-xl hover:bg-red-50/30 hover:backdrop-blur-sm
                        transition-all duration-200`}
              aria-label="Sign out"
            >
              <LogOut size={20} />
              {expanded && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          expanded ? "lg:ml-64" : "lg:ml-20"
        } ml-0 relative`}
      >
        {/* Top Header */}
        <header className={`sticky top-0 z-10 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md shadow-sm bg-white/70" : "bg-transparent"
        }`}>
          <div className="flex justify-between items-center px-4 md:px-6 py-4">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                onClick={handleMobileNavToggle}
                className="p-2 mr-2 rounded-lg hover:bg-gray-100 lg:hidden"
                aria-label="Toggle mobile menu"
              >
                {showMobileNav ? (
                  <ChevronLeft size={24} />
                ) : (
                  <ChevronRight size={24} />
                )}
              </button>
              
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                {activeSection}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
              {/* Search Bar - Hidden on small screens */}
              <div className="hidden md:flex items-center bg-white/80 rounded-lg px-3 py-1.5 shadow-sm border border-gray-100">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-transparent border-none outline-none text-sm w-40 lg:w-48 placeholder-gray-400"
                />
              </div>
              
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100/50">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Profile - Mobile */}
              <div className="md:hidden h-8 w-8 rounded-full glass flex items-center justify-center bg-primary-50 text-primary-700 font-bold">
                {session?.user?.name?.[0].toUpperCase() || "S"}
              </div>
              
              {/* User Profile - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{session?.user?.name || "Staff User"}</div>
                  <div className="text-xs text-gray-500">{session?.user?.email || "staff@optiplus.com"}</div>
                </div>
                <div className="h-10 w-10 rounded-full glass flex items-center justify-center bg-primary-50 text-primary-700 font-bold shadow-sm">
                  {session?.user?.name?.[0].toUpperCase() || "S"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Path indicator / breadcrumb */}
          <div className="px-4 md:px-6 pb-2 flex items-center text-xs text-gray-500">
            <span className="font-medium text-primary-600">OptiPlus</span>
            <span className="mx-2">/</span>
            <span>{activeSection}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 animate-slideIn">
          {children}
        </div>
      </main>
    </div>
  );
}