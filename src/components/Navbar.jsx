import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHome, IoMdStar, IoMdPeople, IoMdLogIn } from 'react-icons/io';

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 backdrop-blur-md shadow-sm z-50 transition-all duration-300 border-b border-gray-200 ${
      scrolled ? 'bg-white/95' : 'bg-white/90'
    }`}>
      <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-poppins text-base sm:text-lg font-bold text-gray-800">
              Moodlyst
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#home" className="flex items-center gap-2 font-poppins text-sm text-gray-600 hover:text-rose-500 transition-colors duration-300">
              <IoMdHome size={20} />
              <span>Home</span>
            </a>
            <a href="#features" className="flex items-center gap-2 font-poppins text-sm text-gray-600 hover:text-rose-500 transition-colors duration-300">
              <IoMdStar size={20} />
              <span>Features</span>
            </a>
            <a href="#community" className="flex items-center gap-2 font-poppins text-sm text-gray-600 hover:text-rose-500 transition-colors duration-300">
              <IoMdPeople size={20} />
              <span>Community</span>
            </a>
            
            {user ? (
              // Show user profile picture when logged in
              <div 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-rose-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-rose-200 bg-rose-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <span className="font-poppins text-sm text-gray-700 font-medium">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              // Show Login button when not logged in
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 font-poppins text-sm bg-rose-500 text-white px-5 py-2 rounded-full hover:bg-rose-600 transition-colors duration-300"
              >
                <IoMdLogIn size={20} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button & User Profile */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <div 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-rose-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-rose-200 bg-rose-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <a 
                href="#home" 
                className="flex items-center gap-2 font-poppins text-sm text-gray-600 hover:text-rose-500 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                <IoMdHome size={20} />
                <span>Home</span>
              </a>
              <a 
                href="#features" 
                className="flex items-center gap-2 font-poppins text-sm text-gray-600 hover:text-rose-500 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                <IoMdStar size={20} />
                <span>Features</span>
              </a>
              <a 
                href="#community" 
                className="flex items-center gap-2 font-poppins text-sm text-gray-600 hover:text-rose-500 transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                <IoMdPeople size={20} />
                <span>Community</span>
              </a>
              
              {!user && (
                <button 
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 font-poppins text-sm bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-colors w-full"
                >
                  <IoMdLogIn size={20} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
