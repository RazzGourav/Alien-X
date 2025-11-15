'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navigation({ user, isDarkMode, toggleDarkMode }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Finance RAG</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`${isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/upload-documents" 
              className={`${isActive('/upload-documents') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Upload Documents
            </Link>
            <Link 
              href="/generate-reports" 
              className={`${isActive('/generate-reports') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Generate Reports
            </Link>
            <Link 
              href="/query-documents" 
              className={`${isActive('/query-documents') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Query Documents
            </Link>
            <Link 
              href="/documentation" 
              className={`${isActive('/documentation') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Documentation
            </Link>
            <Link 
              href="/about" 
              className={`${isActive('/about') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`${isActive('/contact') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Contact
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link 
                href="/upload-documents" 
                className={`${isActive('/upload-documents') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                Upload Documents
              </Link>
              <Link 
                href="/generate-reports" 
                className={`${isActive('/generate-reports') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                Generate Reports
              </Link>
              <Link 
                href="/query-documents" 
                className={`${isActive('/query-documents') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                Query Documents
              </Link>
              <Link 
                href="/documentation" 
                className={`${isActive('/documentation') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                Documentation
              </Link>
              <Link 
                href="/about" 
                className={`${isActive('/about') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className={`${isActive('/contact') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={closeMenu}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 