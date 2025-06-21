import React, { useState } from "react";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo/Title */}
        <div className="flex-shrink-0 text-2xl font-bold text-blue-600">
          BlogApp
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
        </nav>
        {/* Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden px-4 pb-4">
          <a href="#" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Home</a>
          <a href="#" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">About</a>
          <a href="#" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Contact</a>
        </nav>
      )}
    </header>
  );
};

export default Header;