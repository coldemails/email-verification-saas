import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Verify token with backend
        await axios.get(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        // Invalid token - clear and redirect
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    verifyAuth();
  }, [router]);
};