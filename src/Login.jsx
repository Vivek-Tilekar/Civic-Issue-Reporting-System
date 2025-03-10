import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";
import config from "./config.json"

const Login = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/auth/adminsignin`, {
        user,
        password,
      });

      if (response.status === 200) {
        // Store user details & token in localStorage
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);

        navigate("/home"); // Redirect to Home page
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
