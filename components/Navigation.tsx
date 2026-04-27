"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);

      if (data?.user) {
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        setUserRole(profile?.role || 'user');

        // Fetch unread notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('read', false)
          .order('created_at', { ascending: false });

        setNotifications(notifications || []);
        setNotificationCount(notifications?.length || 0);
      }
    };
    getUser();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
      if (notificationsOpen && !(event.target as Element).closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, notificationsOpen]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const markNotificationAsRead = async (notificationId: number) => {
    const supabase = getSupabaseClient();
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    // Update local state
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setNotificationCount(prev => prev - 1);
  };

  const markAllNotificationsAsRead = async () => {
    const supabase = getSupabaseClient();
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications([]);
    setNotificationCount(0);
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href={userRole === 'admin' ? "/admin" : "/profile"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition">
              <span className="text-white font-bold text-lg">AH</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition">ArticleHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8">
            <Link
              href={userRole === 'admin' ? "/admin" : "/profile"}
              className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
            >
              {userRole === 'admin' ? 'Dashboard' : 'Profile'}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/articles"
              className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
            >
              Articles
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {userRole === 'admin' && (
              <Link
                href="/admin/create-article"
                className="text-gray-700 hover:text-blue-600 font-semibold transition relative group"
              >
                Create Article
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-6">
          {/* Notification Badge */}
          <div className="relative notifications-dropdown">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition relative"
            >
              <svg className="w-6 h-6 text-gray-700 hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          if (notification.related_article_id) {
                            router.push(`/articles/${notification.related_article_id}`);
                            setNotificationsOpen(false);
                          }
                          markNotificationAsRead(notification.id);
                        }}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu Dropdown */}
          <div className="relative user-dropdown">
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
