import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
    const {loginWithPopup, loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently} = useAuth0();

  return (
    <nav className="w-full bg-blue-500 p-4 flex justify-between items-center">
      <div className="text-white text-xl font-bold">Quiz Application</div>
      <div>
        {!isAuthenticated ? (
          <button
            onClick={() => loginWithPopup()}
            className="bg-white text-blue-500 px-4 py-2 rounded-lg font-bold"
          >
            Log In
          </button>
        ) : (
          <div className="flex items-center">
            <span className="text-white mr-4">{user.name}</span>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
