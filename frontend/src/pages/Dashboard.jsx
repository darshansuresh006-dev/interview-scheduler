import React, { useEffect, useState } from 'react';
import { getScheduled, getQueue } from '../api/api';

const STATS_CONFIG = [
  { key: 'total',     label: 'Total Requests', color: '#6366f1', bg: '#eef2ff', border: '#6366f1',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
      </svg>
    )
  },
  { key: 'scheduled', label: 'Scheduled',      color: '#22c55e', bg: '#f0fdf4', border: '#22c55e',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9,11 12,14 22,4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    )
  },
  { key: 'pending',   label: 'Pending',        color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    )
  },
  { key: 'queue',     label: 'In Queue',       color: '#ef4444', bg: '#fef2f2', border: '#ef4444',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    )
  },
  { key: 'completed', label: 'Completed',      color: '#8b5cf6', bg: '#f5f3ff', border: '#8b5cf6',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
    )
  },
  { key: 'rate',      label: 'Success Rate',   color: '#06b6d4', bg: '#ecfeff', border: '#06b6d4',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
        <polyline points="17,6 23,6 23,12"/>
      </svg>
    )
  },
];

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [queueNum, setQueueNum]     = useState(0);

  useEffect(() => {
    getScheduled().then(r => setInterviews(r.data));
    getQueue().then(r => setQueueNum(r.data.queue_length));
  }, []);

  const scheduled = interviews.length;
  const pending   = interviews.filter(i => i.status === 'pending').length;
  const completed = interviews.filter(i => i.status === 'completed').length;
  const total     = scheduled + queueNum;
  const rate      = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';

  const values = { total, scheduled, pending, queue: queueNum, completed, rate };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here's an overview of your interview pipeline.</p>
        </div>
        <span className="page-date">{today}</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS_CONFIG.map(({ key, label, color, bg, border, icon }) => (
          <div
            key={key}
            className="stat-card"
            style={{ borderTopColor: border }}
          >
            <div className="stat-card__icon" style={{ background: bg, color }}>
              {icon}
            </div>
            <div>
              <p className="stat-card__value" style={{ color }}>
                {values[key]}
              </p>
              <p className="stat-card__label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state banner */}
      {total === 0 && (
        <div className="info-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#6366f1" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          No interviews scheduled yet. Head to <strong style={{marginLeft:4}}>Requests</strong> to get started.
        </div>
      )}

      {/* Recent scheduled */}
      {interviews.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Scheduled Interviews</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Interviewer</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {interviews.slice(0, 5).map(iv => (
                  <tr key={iv.id}>
                    <td style={{ fontWeight: 600 }}>{iv.candidate_name}</td>
                    <td>{iv.interviewer_name}</td>
                    <td>{new Date(iv.slot_start).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge--${
                        iv.status === 'completed' ? 'green'
                        : iv.status === 'pending'  ? 'yellow'
                        : 'blue'
                      }`}>
                        {iv.status ?? 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}