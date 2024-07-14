import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
  const { loginWithPopup, logout, user, isAuthenticated } = useAuth0();

  return (
    <nav className="sticky top-0 z-50 bg-custom-blue backdrop-blur-lg  border-b border-white border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-white text-2xl font-extrabold tracking-wider">Datasense</span>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {!isAuthenticated ? (
              <button
                onClick={() => loginWithPopup()}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-md hover:shadow-lg"
              >
                Log In
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">{user.name}</span>
                <button
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-6 py-2 rounded-full font-semibold transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;