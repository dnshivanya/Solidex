'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Button from './ui/Button';

export default function Navbar({ isPublic = false }: { isPublic?: boolean }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isPublic) {
      document.body.classList.add('admin-layout');
      if (sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
      return () => {
        document.body.classList.remove('admin-layout', 'sidebar-collapsed');
      };
    }
  }, [isPublic, sidebarCollapsed]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setSidebarOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    
    if (href === '/') {
      return pathname === '/';
    }
    
    // For dashboard (/admin), only match exactly
    if (href === '/admin') {
      return pathname === '/admin';
    }
    
    // For other routes, match if pathname starts with the href followed by / or equals the href
    // This prevents parent routes from being active when child routes are selected
    return pathname === href || pathname.startsWith(href + '/');
  };

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/products-public', label: 'Products' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/order', label: 'Orders', icon: '📝' },
    { href: '/admin/drawing', label: 'Drawings', icon: '📐' },
    { href: '/admin/supervisor-check', label: 'Supervisor Check', icon: '🔍' },
    { href: '/admin/customer-inspection', label: 'Customer Inspection', icon: '👥' },
    { href: '/admin/dc', label: 'DC Management', icon: '📋' },
    { href: '/admin/quality', label: 'Quality Check', icon: '✅' },
    { href: '/admin/invoice', label: 'Invoice', icon: '🧾' },
    { href: '/admin/stock', label: 'Stock', icon: '📦' },
    { href: '/admin/products', label: 'Products', icon: '🛠️' },
  ];

  const getPageTitle = () => {
    const currentLink = adminLinks.find(link => isActive(link.href));
    return currentLink ? currentLink.label : 'Dashboard';
  };

  // Admin Sidebar Layout
  if (!isPublic) {
    return (
      <>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'}`} style={{ top: 0 }}>
          <div className="h-full overflow-y-auto scrollbar-hide flex flex-col">
            {/* Sidebar Header with SOLIDEX at top */}
            <div className={`h-16 border-b border-gray-200 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
              {!sidebarCollapsed && (
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
                    SOLIDEX
                  </div>
                </Link>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-brand-blue transition-colors ${sidebarCollapsed ? '' : 'ml-auto'}`}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="p-2 space-y-1 flex-1">
              {adminLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg font-medium transition-all duration-200 group relative ${
                      active
                        ? 'bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-brand-blue'
                    }`}
                    title={sidebarCollapsed ? link.label : ''}
                  >
                    <span className="text-xl">{link.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-sm">{link.label}</span>
                        {active && (
                          <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {link.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Top Bar for Admin */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className={`flex items-center h-16 px-4 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-20 justify-between' : 'lg:pl-72 justify-between'
          }`}>
            {/* Page Title - Always shown on desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {sidebarCollapsed && (
                <>
                  <Link href="/" className="flex items-center space-x-2 group">
                    <div className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
                      SOLIDEX
                    </div>
                  </Link>
                  <span className="text-gray-300">|</span>
                </>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
            
            {/* Mobile Page Title */}
            <div className="lg:hidden flex items-center">
              <h1 className="text-lg font-bold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-blue to-brand-green flex items-center justify-center text-white font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-600 font-medium rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </>
    );
  }

  // Public Horizontal Scrollable Navbar
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="text-2xl font-bold bg-gradient-to-r from-brand-blue via-brand-green to-brand-blue bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                SOLIDEX
              </div>
            </div>
            <span className="hidden sm:block text-sm text-gray-600 font-medium group-hover:text-brand-blue transition-colors">
              Manufacturing
            </span>
          </Link>

          {/* Horizontal Scrollable Menu */}
          <div className="hidden md:flex items-center flex-1 mx-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-1 min-w-max">
              {publicLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'text-brand-blue bg-blue-50'
                        : 'text-gray-700 hover:text-brand-blue hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <Link href="/admin">
                <Button size="sm" className="shadow-md hover:shadow-lg hover:scale-105 transition-all">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="shadow-md hover:shadow-lg hover:scale-105 transition-all">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1">
              {publicLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-gray-700 rounded-lg font-medium transition-all duration-200 ${
                      active
                        ? 'text-brand-blue bg-blue-50 border-l-4 border-brand-blue'
                        : 'hover:text-brand-blue hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-gray-200 mt-2">
                {user ? (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Admin Panel
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


