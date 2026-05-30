"use client";

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area,
  PieChart, Pie
} from 'recharts';
import { Users, MessageSquare, Briefcase, UserCheck, AlertTriangle, Download, Loader2 } from 'lucide-react';
import styles from './analytics.module.css';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9'];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const from = new Date();
      from.setDate(from.getDate() - parseInt(dateRange));
      const fromStr = from.toISOString().split('T')[0];
      const toStr = new Date().toISOString().split('T')[0];

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error("No auth token found, redirecting to login...");
        window.location.href = '/login';
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` }; 

      const endpoints = [
        fetch(`http://localhost:5000/api/analytics/overview?from=${fromStr}&to=${toStr}`, { headers }),
        fetch(`http://localhost:5000/api/analytics/intents?from=${fromStr}&to=${toStr}`, { headers }),
        fetch(`http://localhost:5000/api/analytics/trends?from=${fromStr}&to=${toStr}`, { headers }),
        fetch(`http://localhost:5000/api/analytics/leads?from=${fromStr}&to=${toStr}`, { headers })
      ];

      const responses = await Promise.all(endpoints);
      const [overviewRes, intentsRes, trendsRes, leadsRes] = await Promise.all(responses.map(r => r.json()));

      setData({
        overview: overviewRes?.data || {},
        intents: Object.entries(intentsRes?.data || {}).map(([name, value]) => ({ name, value })),
        trends: trendsRes?.data || [],
        leads: leadsRes?.data || {}
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const from = new Date();
      from.setDate(from.getDate() - parseInt(dateRange));
      const fromStr = from.toISOString().split('T')[0];
      const toStr = new Date().toISOString().split('T')[0];
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/analytics/export?from=${fromStr}&to=${toStr}&format=csv`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to export");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${toStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  if (loading && !data) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Intelligence Hub</h1>
            <p className={styles.subtitle}>Real-time performance metrics</p>
          </div>
          <div className={styles.controls}>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.select}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <div className={styles.divider}></div>
            <button className={styles.exportBtn} onClick={handleExport}>
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className={styles.statsGrid}>
          <StatCard title="Active Users" value={data?.overview?.totalUsers || 0} icon={<Users size={22} />} color="#818cf8" bg="rgba(129, 140, 248, 0.1)" glow="radial-gradient(circle, rgba(129,140,248,0.4) 0%, transparent 70%)" />
          <StatCard title="Conversations" value={data?.overview?.totalConversations || 0} icon={<MessageSquare size={22} />} color="#34d399" bg="rgba(52, 211, 153, 0.1)" glow="radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)" />
          <StatCard title="Employer Leads" value={data?.overview?.totalLeads || 0} icon={<Briefcase size={22} />} color="#fbbf24" bg="rgba(251, 191, 36, 0.1)" glow="radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)" />
          <StatCard title="Candidates" value={data?.overview?.totalCandidates || 0} icon={<UserCheck size={22} />} color="#f472b6" bg="rgba(244, 114, 182, 0.1)" glow="radial-gradient(circle, rgba(244,114,182,0.4) 0%, transparent 70%)" />
          <StatCard title="Escalations" value={data?.overview?.totalEscalations || 0} icon={<AlertTriangle size={22} />} color="#fb7185" bg="rgba(251, 113, 133, 0.1)" glow="radial-gradient(circle, rgba(251,113,133,0.4) 0%, transparent 70%)" />
        </div>

        {/* CHARTS GRID */}
        <div className={styles.chartsGrid}>
          
          {/* Activity Trends */}
          <div className={styles.chartCard}>
            <div className={styles.gradientBg} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent)' }}></div>
            <h2 className={styles.chartHeader}>
              <span className={styles.chartDot} style={{ backgroundColor: '#6366f1' }}></span>
              Conversation Velocity
            </h2>
            <div className={styles.chartBody}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Funnel (Pie) */}
          <div className={styles.chartCard}>
            <div className={styles.gradientBg} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.05), transparent)' }}></div>
            <h2 className={styles.chartHeader}>
              <span className={styles.chartDot} style={{ backgroundColor: '#10b981' }}></span>
              Lead Pipeline
            </h2>
            <div className={styles.chartBody}>
               {data?.leads && (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={[
                         { name: 'New', value: data.leads.new || 0 },
                         { name: 'Qualified', value: data.leads.qualified || 0 },
                         { name: 'Converted', value: data.leads.converted || 0 },
                         { name: 'Rejected', value: data.leads.rejected || 0 }
                       ].filter(i => i.value > 0)}
                       cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                       paddingAngle={5} dataKey="value" stroke="none"
                     >
                       {[
                         { name: 'New', value: data.leads.new || 0 },
                         { name: 'Qualified', value: data.leads.qualified || 0 },
                         { name: 'Converted', value: data.leads.converted || 0 },
                         { name: 'Rejected', value: data.leads.rejected || 0 }
                       ].filter(i => i.value > 0).map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff'}} 
                       itemStyle={{color: '#fff'}}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               )}
            </div>
          </div>

          {/* Intent Distribution */}
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <div className={styles.gradientBg} style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.05), transparent)' }}></div>
            <h2 className={styles.chartHeader}>
              <span className={styles.chartDot} style={{ backgroundColor: '#a855f7' }}></span>
              Intent Matrix
            </h2>
            <div className={styles.chartBody}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.intents || []} layout="vertical" margin={{ left: 60, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fontSize: 13, fill: '#94a3b8', fontWeight: 500}} axisLine={false} tickLine={false} width={140} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    {
                      (data?.intents || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* DETAILED DATA TABLE */}
        <div className={styles.chartCard}>
          <div className={styles.gradientBg} style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), transparent)' }}></div>
          <h2 className={styles.chartHeader}>
            <span className={styles.chartDot} style={{ backgroundColor: '#3b82f6' }}></span>
            Detailed Intent Breakdown
          </h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Intent Name</th>
                  <th>Occurrences</th>
                  <th style={{ textAlign: 'right' }}>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.intents || []).length > 0 ? (
                  (data?.intents || [])
                    .sort((a, b) => b.value - a.value)
                    .map((intent, idx) => {
                      const totalIntents = data.intents.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = totalIntents > 0 ? ((intent.value / totalIntents) * 100).toFixed(1) : 0;
                      return (
                        <tr key={idx}>
                          <td className={styles.intentName}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></div>
                              {intent.name.replace(/_/g, ' ')}
                            </div>
                          </td>
                          <td className={styles.intentValue}>{intent.value}</td>
                          <td className={styles.intentPercent}>{percentage}%</td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-component for overview stats
function StatCard({ title, value, icon, color, bg, glow }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.glow} style={{ background: glow }}></div>
      <div className={styles.statHeader}>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statIconWrap} style={{ backgroundColor: bg, color: color }}>
          {icon}
        </div>
      </div>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}
