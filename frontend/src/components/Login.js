import './Login.css'
import React, { useState, useContext } from "react"
import axios from "axios"
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

export default function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { isLoggedIn, login } = useContext(AuthContext);

  const handleloggedin = () => {
    login();
  };

  const handleLogin = (event) => {
    event.preventDefault()
    axios.post("http://localhost:3000/login", {
      username: username,
      password: password,
    }).then((response) => {
      const token = response.data.token;
      localStorage.setItem('token', token)
      handleloggedin();
    }).catch((err) => {
      window.alert("Login Failed!")
    });
  };

  if (isLoggedIn) {
    return (
    <div>
      <h2>You are logged in</h2>
      <Link as={Link} to ={"/Admin"}>
          <Button  variant="primary">Go to Admin Page</Button>
      </Link>
    </div>
    ) 
  }

  return (
    <div className="Auth-form-container">
      <form className="Auth-form">
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control mt-1"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control mt-1"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary" onClick={(event)=> {handleLogin(event)}}>
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
