"use client";
import { useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        setMessage("Admin login successful!");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
      } else {
        setMessage("Access denied. Admin privileges required.");
        await supabase.auth.signOut();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Admin Login</h1>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          Login as Admin
        </button>

        {message && (
          <p className={`text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="text-center mt-4">
          <a href="/login" className="text-blue-600 hover:underline">
            Regular User Login
          </a>
        </div>
      </div>
    </div>
  );
}