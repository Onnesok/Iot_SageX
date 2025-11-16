'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Stats {
  overview: {
    totalUsers: number;
    totalPullers: number;
    activeUsersOnBlocks: number;
    onlinePullers: number;
    activeRides: number;
    pendingRequests: number;
    totalRides: number;
    completedRides: number;
  };
  analytics: {
    mostRequestedDestinations: Array<{ locationName: string; count: number }>;
    avgWaitTime: number;
    avgCompletionTime: number;
    pullerLeaderboard: Array<{ name: string; points: number; totalRides: number }>;
    pendingReviews: number;
  };
}

interface Ride {
  id: string;
  userId: string;
  pullerId?: string;
  pickupLocationId: string;
  destinationLocationId: string;
  status: string;
  pointsAwarded?: number;
  pointsStatus: string;
  createdAt: string;
  completedAt?: string;
}

interface Location {
  id: string;
  name: string;
}

interface Admin {
  id: string;
  username: string;
  name: string;
  email?: string;
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rides' | 'analytics'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterLocationId, setFilterLocationId] = useState<string>('all');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterPullerId, setFilterPullerId] = useState<string>('');

  useEffect(() => {
    // Check if already logged in
    const savedAdminId = localStorage.getItem('adminId');
    if (savedAdminId) {
      verifyAdmin(savedAdminId);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && admin) {
      fetchStats();
      fetchRides();
      fetchLocations();

      const interval = setInterval(() => {
        fetchStats();
        fetchRides();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, admin]);

  const verifyAdmin = async (adminId: string) => {
    try {
      const res = await fetch('/api/auth/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      });

      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('adminId');
      }
    } catch (error) {
      console.error('Error verifying admin:', error);
      localStorage.removeItem('adminId');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Clear puller session when admin logs in
        localStorage.removeItem('pullerId');
        
        setAdmin(data.admin);
        setIsLoggedIn(true);
        localStorage.setItem('adminId', data.admin.id);
        setUsername('');
        setPassword('');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to login. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    setAdmin(null);
    setIsLoggedIn(false);
    setStats(null);
    setRides([]);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRides = async () => {
    try {
      const res = await fetch('/api/rides');
      const data = await res.json();
      setRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const getLocationName = (locationId: string) => {
    return locations.find(l => l.id === locationId)?.name || locationId;
  };

  const handleAdjustPoints = async (rideId: string, newPoints: number) => {
    if (!confirm(`Adjust points to ${newPoints} for this ride?`)) return;
    
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_points',
          points: newPoints
        })
      });
      
      if (res.ok) {
        alert('Points adjusted successfully!');
        fetchRides();
        fetchStats();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to adjust points'}`);
      }
    } catch (error) {
      console.error('Error adjusting points:', error);
      alert('Failed to adjust points');
    }
  };

  const filteredRides = rides.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;

    if (filterUserId && !r.userId.toLowerCase().includes(filterUserId.toLowerCase())) return false;
    if (filterPullerId && (!r.pullerId || !r.pullerId.toLowerCase().includes(filterPullerId.toLowerCase()))) return false;

    if (filterLocationId !== 'all') {
      if (r.pickupLocationId !== filterLocationId && r.destinationLocationId !== filterLocationId) return false;
    }

    if (filterStartDate) {
      const rideDate = new Date(r.createdAt);
      const start = new Date(filterStartDate);
      if (rideDate < start) return false;
    }

    if (filterEndDate) {
      const rideDate = new Date(r.createdAt);
      const end = new Date(filterEndDate);
      end.setHours(23, 59, 59, 999);
      if (rideDate > end) return false;
    }

    return true;
  });

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center p-4 sm:p-6 pt-24 md:pt-28 min-h-[calc(100vh-80px)]">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-green-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-black/50 border border-white/10 rounded-xl p-6 sm:p-8 max-w-md w-full relative z-10 hover:border-green-400/50 transition-all"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-xl sm:text-2xl font-bold text-green-400">A</span>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
                Admin Login
              </h1>
              <p className="text-sm sm:text-base text-gray-400">AERAS Admin Dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/50 border border-red-500/50 rounded-xl p-3 text-sm text-red-400"
                >
                  {loginError}
                </motion.div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/20 rounded-full focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all text-sm sm:text-base placeholder-gray-500 text-white"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/20 rounded-full focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all text-sm sm:text-base placeholder-gray-500 text-white"
                  required
                />
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-full font-semibold transition-all text-green-400 text-sm sm:text-base"
              >
                Sign In
              </motion.button>
              
              <div className="pt-4 border-t border-white/10">
                <Link href="/" className="text-xs sm:text-sm text-green-400 hover:text-green-300 text-center block transition-colors">
                  Back to Home
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-4 sm:p-6 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">AERAS Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-400">Welcome, {admin?.name || admin?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors border border-gray-700 w-full sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gray-800 overflow-x-auto">
          {['overview', 'rides', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                selectedTab === tab
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-xs sm:text-sm text-gray-400 mb-2">Total Users (Registered)</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.overview.totalUsers}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-sm text-gray-400 mb-2">Active Users on Blocks</div>
                <div className="text-3xl font-bold text-green-400">{stats.overview.activeUsersOnBlocks}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-sm text-gray-400 mb-2">Online Pullers</div>
                <div className="text-3xl font-bold text-green-400">{stats.overview.onlinePullers}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-sm text-gray-400 mb-2">Active Rides</div>
                <div className="text-3xl font-bold text-green-400">{stats.overview.activeRides}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="text-sm text-gray-400 mb-2">Pending Reviews</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.analytics.pendingReviews}</div>
              </motion.div>
            </div>

            {/* System Health */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">System Health</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Rides</div>
                  <div className="text-2xl font-bold">{stats.overview.totalRides}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Completed Rides</div>
                  <div className="text-2xl font-bold text-green-400">{stats.overview.completedRides}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Pending Requests</div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.overview.pendingRequests}</div>
                </div>
              </div>
            </div>

            {/* Most Requested Destinations (Graph-style) */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Most Requested Destinations</h2>
              {stats.analytics.mostRequestedDestinations.length === 0 ? (
                <p className="text-sm text-gray-400">No ride data yet.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const maxCount = Math.max(
                      ...stats.analytics.mostRequestedDestinations.map((d) => d.count)
                    );
                    return stats.analytics.mostRequestedDestinations.map((dest, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span className="font-semibold">{dest.locationName}</span>
                          <span className="text-green-400 font-medium">{dest.count} rides</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-teal-400"
                            style={{ width: `${(dest.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rides Tab */}
        {selectedTab === 'rides' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 space-y-4">
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      filterStatus === status
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Location</label>
                  <select
                    value={filterLocationId}
                    onChange={(e) => setFilterLocationId(e.target.value)}
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  >
                    <option value="all">All locations</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">User ID (contains)</label>
                  <input
                    type="text"
                    value={filterUserId}
                    onChange={(e) => setFilterUserId(e.target.value)}
                    placeholder="Search by user ID"
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 placeholder-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Puller ID (contains)</label>
                  <input
                    type="text"
                    value={filterPullerId}
                    onChange={(e) => setFilterPullerId(e.target.value)}
                    placeholder="Search by puller ID"
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Rides Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Route</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Points</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">Date</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredRides.slice(0, 50).map((ride) => (
                      <tr key={ride.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono">{ride.id.slice(0, 6)}...</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          <div className="max-w-[150px] sm:max-w-none truncate sm:truncate-none">
                            {getLocationName(ride.pickupLocationId)} → {getLocationName(ride.destinationLocationId)}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            ride.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            ride.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            ride.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ride.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          {ride.pointsAwarded !== undefined ? (
                            <span className={ride.pointsStatus === 'rewarded' ? 'text-green-400' : 'text-yellow-400'}>
                              {ride.pointsAwarded} ({ride.pointsStatus.slice(0, 4)})
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                          {new Date(ride.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-wrap gap-2">
                            {ride.pointsStatus === 'under_review' && (
                              <button
                                onClick={() => {
                                  const points = prompt('Enter points to award (0-10):', '5');
                                  if (points) handleAdjustPoints(ride.id, parseFloat(points));
                                }}
                                className="px-2 sm:px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs font-semibold transition-colors"
                              >
                                Adjust
                              </button>
                            )}
                            {ride.pointsStatus === 'rewarded' && ride.pointsAwarded !== undefined && (
                              <button
                                onClick={() => {
                                  const points = prompt('Enter new points value:', ride.pointsAwarded?.toString() || '0');
                                  if (points) handleAdjustPoints(ride.id, parseFloat(points));
                                }}
                                className="px-2 sm:px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            {ride.pullerId && (
                              <button
                                onClick={async () => {
                                  if (!confirm('Suspend this puller (set offline)?')) return;
                                  try {
                                    const res = await fetch(`/api/pullers/${ride.pullerId}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isOnline: false })
                                    });
                                    if (!res.ok) {
                                      const data = await res.json();
                                      alert(`Error suspending puller: ${data.error || 'Unknown error'}`);
                                    } else {
                                      alert('Puller suspended (set offline).');
                                      fetchStats();
                                    }
                                  } catch (error) {
                                    console.error('Error suspending puller:', error);
                                    alert('Failed to suspend puller');
                                  }
                                }}
                                className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold transition-colors"
                              >
                                Suspend Puller
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && stats && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Average Wait Time</h3>
                <div className="text-3xl sm:text-4xl font-bold text-green-400">{stats.analytics.avgWaitTime}s</div>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">Time from request to acceptance</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Average Completion Time</h3>
                <div className="text-3xl sm:text-4xl font-bold text-teal-400">{stats.analytics.avgCompletionTime} min</div>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">Time from request to completion</p>
              </div>
            </div>

            {/* Puller Leaderboard */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Top Pullers</h2>
              <div className="space-y-2">
                {stats.analytics.pullerLeaderboard.map((puller, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center font-bold text-green-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{puller.name}</div>
                        <div className="text-sm text-gray-400">{puller.totalRides} rides</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">{puller.points} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
