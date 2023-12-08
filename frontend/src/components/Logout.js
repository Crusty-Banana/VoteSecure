import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <Button onClick={handleLogout}>Logout</Button>
  );
};

export default LogoutButton;