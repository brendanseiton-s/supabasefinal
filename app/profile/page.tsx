"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      
      if (!data?.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-40"></div>
          
          <div className="px-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end md:gap-6 -mt-20 mb-12">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center border-4 border-white shadow-xl">
                <span className="text-6xl text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-600 mt-2">Member since {new Date(user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-b border-gray-200 pb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <p className="text-lg text-gray-900 mt-3 font-medium break-all">{user?.email}</p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account Status</label>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-lg text-green-600 font-semibold">Active</p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 border-b border-gray-200 pb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">User ID</label>
                <p className="text-sm text-gray-700 mt-3 break-all font-mono bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition cursor-pointer select-all">
                  {user?.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 p-8 border-l-4 border-blue-600">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-wide">Articles Read</p>
                <p className="text-5xl font-bold text-blue-600 mt-3">5</p>
              </div>
              <svg className="w-16 h-16 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 p-8 border-l-4 border-green-600">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-wide">Comments Made</p>
                <p className="text-5xl font-bold text-green-600 mt-3">12</p>
              </div>
              <svg className="w-16 h-16 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 p-8 border-l-4 border-red-600">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-wide">Likes Given</p>
                <p className="text-5xl font-bold text-red-600 mt-3">28</p>
              </div>
              <svg className="w-16 h-16 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h-2V9m2 11h-2v1m1-11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0h2c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/articles">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-lg">
                Browse Articles
              </button>
            </a>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-6 rounded-xl transition duration-300 transform hover:scale-105 text-lg">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
