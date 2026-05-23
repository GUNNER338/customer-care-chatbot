'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data. Please login again.');
        }

        const userData = await response.json();
        setUser(userData.data || userData); // Adjust depending on your backend response structure
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('authToken');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-wrapper">
        <h1>Welcome, {user?.fullName || 'User'}!</h1>
        <div className="user-info">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Full Name:</strong> {user?.fullName}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
