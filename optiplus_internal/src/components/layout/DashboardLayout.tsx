"use client";

import { useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

// Replace the Logo import with direct Image component usage
// import Logo from "@/components/ui/Logo";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`nav-item ${active ? "nav-item-active" : "nav-item-inactive"}`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="hidden md:inline font-medium">{label}</span>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [expanded, setExpanded] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const navItems = [
    {
      href: "/reception",
      label: "Reception",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
        </svg>
      ),
    },
    {
      href: "/examination",
      label: "Examination",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      href: "/sales-order",
      label: "Sales Order",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6zm2 2h4a1 1 0 110 2H8a1 1 0 110-2zm0 4h4a1 1 0 110 2H8a1 1 0 110-2z" />
        </svg>
      ),
    },
    {
      href: "/clients",
      label: "Clients",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
    },
    {
      href: "/admin-login",
      label: "Admin Panel",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const handleToggleSidebar = () => {
    setExpanded(!expanded);
  };

  const activeSection = navItems.find(item => pathname === item.href)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 bg-fixed">
      {/* Sidebar */}
      <aside
        className={`fixed z-20 top-0 left-0 h-full transition-all duration-300 ${
          expanded ? "w-64" : "w-16"
        } md:w-64 animate-fadeIn`}
      >
        <div className="flex flex-col h-full glass-card rounded-r-xl overflow-hidden">
          {/* Logo Area - Updated to use Image from public folder */}
          <div className={`p-4 border-b border-white/10 backdrop-blur-md flex ${expanded ? "justify-start" : "justify-center"}`}>
            <div className="relative">
              {expanded ? (
                <div className="flex items-center">
                  <Image 
                    src="/logo.png" 
                    alt="OptiPlus Logo" 
                    width={40} 
                    height={40} 
                    className="object-contain"
                  />
                  <span className="ml-2 text-lg font-semibold text-primary-700">OptiPlus</span>
                </div>
              ) : (
                <Image 
                  src="/logo.png" 
                  alt="OptiPlus Logo" 
                  width={30} 
                  height={30} 
                  className="object-contain"
                />
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleToggleSidebar}
            className="absolute -right-3 top-12 glass rounded-full p-1.5 hover:bg-white/30 transition-all md:hidden z-30"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-primary-600 transition-transform duration-300 ${expanded ? "rotate-0" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto backdrop-blur-sm bg-white/5">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 backdrop-blur-sm bg-white/5">
            <button
              onClick={() => signOut({ callbackUrl: "/staff-login" })}
              className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-red-600 rounded-xl
                        hover:bg-red-50/30 hover:backdrop-blur-sm transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 2.414L15.414 9H12V5.414z" clipRule="evenodd" />
                <path d="M3 7.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z" />
              </svg>
              {expanded && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          expanded ? "ml-64" : "ml-16"
        } md:ml-64 relative`}
      >
        {/* Top Header */}
        <header className={`sticky top-0 z-10 transition-all duration-300 ${
          scrolled ? "backdrop-blur-glass shadow-glass" : "bg-transparent"
        }`}>
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              {activeSection} • OptiPlus
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right mr-2">
                <div className="text-sm font-medium text-gray-900">{session?.user?.name || "Staff User"}</div>
                <div className="text-xs text-gray-500">{session?.user?.email || "staff@optiplus.com"}</div>
              </div>
              <div className="h-10 w-10 rounded-full glass flex items-center justify-center text-primary-700 font-bold shadow-sm">
                {session?.user?.name?.[0].toUpperCase() || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 animate-slideIn">
          {children}
        </div>
      </main>
    </div>
  );
}