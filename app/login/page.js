"use client";
import { useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // SIGN UP
  const handleSignUp = async () => {
    const supabase = getSupabaseClient();
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
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      setMessage("Login successful!");
      // Redirect based on role
      setTimeout(() => {
        if (profile?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/profile";
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Login / Sign Up</h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="flex space-x-4">
          <button
            onClick={handleSignUp}
            className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Sign Up
          </button>

          <button
            onClick={handleLogin}
            className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Login
          </button>
        </div>

        {/* Message */}
        <p className="mt-4 text-center text-sm text-gray-600">{message}</p>

        <div className="text-center mt-4">
          <a href="/admin-login" className="text-blue-600 hover:underline">
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}