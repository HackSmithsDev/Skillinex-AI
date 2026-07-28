import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Landing from './Landing'; 
import UserHome from './UserHome'; // This is your logged-in dashboard feed

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  // Prevent the "Flash of Landing Page" while checking the token
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pure Conditional Swap
  return user ? <UserHome /> : <Landing />;
};

export default Home;