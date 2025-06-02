import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, X as CloseIcon, LogOut as LogOutIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isAuthenticated,
    user,
    logout
  } = useAuth();

  return <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-emerald-600">
                FoodShare
              </span>
            </Link>
          </div>
          {/* Desktop nav */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600">
              Home
            </Link>
            {!isAuthenticated ? <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md">
                  Register
                </Link>
              </> : <>
                <Link to={user?.role === 'ROLE_DONOR' ? '/donor/dashboard' : '/ngo/dashboard'} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600">
                  Dashboard
                </Link>
                <button onClick={logout} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600">
                  <LogOutIcon size={18} className="mr-1" />
                  Log out
                </button>
              </>}
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <CloseIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {!isAuthenticated ? <>
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </> : <>
                <Link to={user?.role === 'ROLE_DONOR' ? '/donor/dashboard' : '/ngo/dashboard'} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => {
            logout();
            setIsMenuOpen(false);
          }} className="flex w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50">
                  <LogOutIcon size={18} className="mr-2" />
                  Log out
                </button>
              </>}
          </div>
        </div>}
    </header>;
};
export default Navbar;