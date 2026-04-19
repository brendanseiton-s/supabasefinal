"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);

      // Fetch notifications if user exists
      if (data?.user?.email) {
        try {
          const response = await fetch(`/api/send-notification?email=${data.user.email}`);
          const notificationData = await response.json();
          if (notificationData.notifications) {
            setNotificationCount(notificationData.unreadCount || 0);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/profile" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition">
              <span className="text-white font-bold text-lg">AH</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition">ArticleHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8">
            <Link
              href="/profile"
              className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
            >
              Profile
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/articles"
              className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
            >
              Articles
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-6">
          {/* Notification Badge */}
          <div className="relative group">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
            {notificationCount > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto">
                <p className="font-semibold">{notificationCount} new notification{notificationCount !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-gray-700 font-medium truncate max-w-xs">{user.email}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                <Link href="/profile">
                  <button className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition font-medium">
                    View Profile
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition font-medium border-t border-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
