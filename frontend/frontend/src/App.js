import React, { useEffect, useState } from 'react';
import { getScheduled, getQueue } from '../api/api';

export default function Scheduled({ isDesktop }) {
  const [interviews, setInterviews] = useState([]);
  const [queueLen, setQueueLen] = useState(0);

  useEffect(function() {
    getScheduled().then(function(r) { setInterviews(r.data); });
    getQueue().then(function(r) { setQueueLen(r.data.queue_length); });
  }, []);

  return (
    <div>
      <h2 style={s.pageTitle}>Scheduled Interviews</h2>

      <div style={s.queueBox}>
        <span style={{ fontSize: 24 }}>📭</span>
        <div>
          <div style={s.queueTitle}>Waiting Queue</div>
          <div style={s.queueCount}>{queueLen} requests waiting</div>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div style={s.emptyBox}>No interviews scheduled yet</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
          gap: 12,
        }}>
          {interviews.map(function(iv) {
            return (
              <div key={iv.id} style={s.card}>
                <div style={s.cardTopRow}>
                  <span style={s.cardName}>{iv.candidate_name}</span>
                  <span style={s.badge}>Scheduled</span>
                </div>
                <div style={s.cardLine}>💼 {iv.position}</div>
                <div style={s.cardLine}>👤 {iv.interviewer_name}</div>
                <div style={s.timeBox}>
                  <div style={s.timeLabel}>Date and Time</div>
                  <div style={s.timeValue}>
                    {new Date(iv.slot_start).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  pageTitle: { fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '0 0 16px' },
  queueBox: {
    background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20,
    display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: '4px solid #ef4444',
  },
  queueTitle: { fontWeight: 700, fontSize: 14, color: '#1e293b' },
  queueCount: { fontSize: 12, color: '#64748b', marginTop: 2 },
  card: { background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardName: { fontWeight: 700, fontSize: 14, color: '#1e293b' },
  cardLine: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  timeBox: { background: '#f8fafc', borderRadius: 8, padding: 10, marginTop: 8 },
  timeLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 },
  timeValue: { fontSize: 13, fontWeight: 600, color: '#334155' },
  emptyBox: { textAlign: 'center', color: '#94a3b8', padding: 30, background: '#fff', borderRadius: 12 },
};