import React, { useEffect, useState } from 'react';
import { getDashboard } from '../api/api';

export default function Dashboard({ isDesktop }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function() {
    getDashboard()
      .then(function(r) { setStats(r.data); })
      .catch(function(e) { setError('Failed to load dashboard'); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>
        <p>{error}</p>
        <p style={{ fontSize: 12, color: '#64748b' }}>
          Make sure the server is running and try refreshing.
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
        Dashboard
      </h2>

      <div style={{
        ...styles.grid,
        gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr',
      }}>
        <StatCard label="Total Requests"  value={stats.total_requests || 0}     color="#6366f1" icon="📋" />
        <StatCard label="Scheduled"       value={stats.scheduled || 0}           color="#10b981" icon="✅" />
        <StatCard label="Pending"         value={stats.pending || 0}             color="#f59e0b" icon="⏳" />
        <StatCard label="In Queue"        value={stats.queue_length || 0}        color="#ef4444" icon="📭" />
        <StatCard label="Interviewers"    value={stats.total_interviewers || 0}  color="#8b5cf6" icon="👤" />
        <StatCard label="Rescheduled"     value={stats.rescheduled || 0}         color="#06b6d4" icon="🔄" />
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: '#334155' }}>
        Recent Interviews
      </h3>

      {(!stats.recent_scheduled || stats.recent_scheduled.length === 0) ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 30, background: '#fff', borderRadius: 12 }}>
          No interviews scheduled yet
        </div>
      ) : (
        stats.recent_scheduled.map(function(iv) {
          return (
            <div key={iv.id} style={{ background: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                  {iv.candidate_name}
                </span>
                <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>
                  Scheduled
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Position: {iv.position}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Interviewer: {iv.interviewer_name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Time: {iv.slot_start ? new Date(iv.slot_start).toLocaleString() : 'N/A'}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 14, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: '4px solid ' + color }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20,
  },
};