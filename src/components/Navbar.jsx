import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-7xl bg-white/80 backdrop-blur-md shadow-lg rounded-2xl z-50">
      <div className="px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-12">
          <div className="flex-shrink-0">
            <span className="font-poppins text-lg font-bold text-gray-800">
              Moodlyst
            </span>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-5">
              <a href="#home" className="font-poppins text-xs text-gray-600 hover:text-rose-500 transition-colors duration-300">
                Home
              </a>
              <a href="#map" className="font-poppins text-xs text-gray-600 hover:text-rose-500 transition-colors duration-300">
                Map
              </a>
              <a href="#community" className="font-poppins text-xs text-gray-600 hover:text-rose-500 transition-colors duration-300">
                Community
              </a>
              <a href="#login" className="font-poppins text-xs text-gray-600 hover:text-rose-500 transition-colors duration-300">
                Login
              </a>
              <a href="#signup" className="font-poppins text-xs bg-rose-500 text-white px-4 py-1 rounded-full hover:bg-rose-600 transition-colors duration-300">
                Sign Up
              </a>
            </div>
          </div>

          <div className="md:hidden flex justify-between items-center w-full">
            <span className="font-poppins text-lg font-bold text-gray-800">
              Moodlyst
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700"
            >
              <svg
                className={`h-6 w-6 ${isOpen ? 'hidden' : 'block'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${isOpen ? 'block' : 'hidden'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
          <a href="#home" className="block font-poppins text-gray-600 hover:text-rose-500 transition-colors duration-300 px-3 py-2">
            Home
          </a>
          <a href="#map" className="block font-poppins text-gray-600 hover:text-rose-500 transition-colors duration-300 px-3 py-2">
            Map
          </a>
          <a href="#community" className="block font-poppins text-gray-600 hover:text-rose-500 transition-colors duration-300 px-3 py-2">
            Community
          </a>
          <a href="#login" className="block font-poppins text-gray-600 hover:text-rose-500 transition-colors duration-300 px-3 py-2">
            Login
          </a>
          <a href="#signup" className="block font-poppins text-center bg-rose-500 text-white px-6 py-2 rounded-full hover:bg-rose-600 transition-colors duration-300 mx-3">
            Sign Up
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;