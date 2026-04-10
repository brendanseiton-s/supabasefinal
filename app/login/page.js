"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // SIGN UP
  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Sign up successful! Check your email.");
    }
  };

  // LOGIN
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful!");
    }
  };

  return (
    <div style={{
      textAlign: "center",
      marginTop: "100px",
      fontFamily: "Arial"
    }}>
      
      <h1>Login / Sign Up</h1>

      {/* Email */}
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", margin: "10px", width: "250px" }}
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", margin: "10px", width: "250px" }}
      />

      <div>
        <button onClick={handleSignUp} style={{ margin: "10px" }}>
          Sign Up
        </button>

        <button onClick={handleLogin} style={{ margin: "10px" }}>
          Login
        </button>
      </div>

      {/* Message */}
      <p>{message}</p>

    </div>
  );
}