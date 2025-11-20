'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ProxyStat {
  ipAddress: string;
  dailyQuota: number;
  todayCount: number;
  remainingQuota: number;
}


export default function ProxyMonitor() {
  const [proxies, setProxies] = useState<ProxyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProxyStats();
  }, []);

const fetchProxyStats = async () => {
  try {
    const token = localStorage.getItem('token');

    const res = await axios.get(`${API_URL}/api/admin/proxy-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setProxies(res.data.proxies || []); // ✅ FIX
  } catch (err) {
    console.error("Error loading proxy stats", err);
  } finally {
    setLoading(false);
  }
};

  const resetQuota = async (ip: string) => {
    if (!confirm(`Reset quota for ${ip}?`)) return;

    try {
      const token = localStorage.getItem('token');
      setUpdating(ip);

      await axios.post(`${API_URL}/api/admin/proxy-reset/${ip}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchProxyStats();
    } catch (err) {
      console.error(err);
      alert("Failed to reset quota.");
    } finally {
      setUpdating(null);
    }
  };

  const updateQuota = async (ip: string) => {
    const newQuota = Number(prompt("Enter new daily quota:"));
    if (isNaN(newQuota) || newQuota <= 0) return alert("Invalid quota value");

    try {
      const token = localStorage.getItem('token');
      setUpdating(ip);

      await axios.patch(`${API_URL}/api/admin/proxy-quota/${ip}`, {
        dailyQuota: newQuota
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchProxyStats();
    } catch (err) {
      console.error(err);
      alert("Failed to update quota.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <p>Loading proxy stats...</p>;

  if (proxies.length === 0)
    return <p className="text-gray-500">No proxies found.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Proxy Usage</h2>

      {proxies.map((p) => (
        <div
          key={p.ipAddress}
          className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between"
        >
          <div>
            <div className="font-bold">{p.ipAddress}</div>
<div className="text-sm text-gray-600">
  Used: {p.todayCount} / {p.dailyQuota}
</div>

<div className="text-sm text-green-600">
  Remaining: {p.remainingQuota}
</div>

          </div>

          <div className="flex gap-3">
            <button
              className="px-3 py-1 bg-gray-200 rounded-xl"
              disabled={updating === p.ipAddress}
              onClick={() => updateQuota(p.ipAddress)}
            >
              Update Quota
            </button>

            <button
              className="px-3 py-1 bg-red-500 text-white rounded-xl"
              disabled={updating === p.ipAddress}
              onClick={() => resetQuota(p.ipAddress)}
            >
              Reset
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
