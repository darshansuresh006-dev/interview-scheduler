import React, { useEffect, useState } from 'react';
import { getRequests, createRequest } from '../api/api';

const STATUS_CONFIG = {
  PENDING:     { bg: '#fef9c3', color: '#854d0e', icon: '⏳', label: 'Pending' },
  SCHEDULED:   { bg: '#dcfce7', color: '#166534', icon: '✅', label: 'Scheduled' },
  QUEUED:      { bg: '#fee2e2', color: '#991b1b', icon: '📭', label: 'In Queue' },
  RESCHEDULED: { bg: '#dbeafe', color: '#1e40af', icon: '🔄', label: 'Rescheduled' },
  CANCELLED:   { bg: '#f1f5f9', color: '#475569', icon: '❌', label: 'Cancelled' },
  COMPLETED:   { bg: '#f0fdf4', color: '#166534', icon: '🎉', label: 'Completed' },
};

const FILTERS = ['ALL', 'PENDING', 'SCHEDULED', 'QUEUED', 'RESCHEDULED'];

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    candidate_name: '',
    candidate_email: '',
    position: '',
    required_skills: '',
    preferred_start: '',
    preferred_end: '',
    duration_minutes: 60,
  });

  function load() {
    setLoading(true);
    getRequests()
      .then(function(r) { setRequests(r.data); })
      .finally(function() { setLoading(false); });
  }

  useEffect(function() { load(); }, []);

  function showMsg(text, type) {
    setMsg({ text: text, type: type });
    setTimeout(function() { setMsg({ text: '', type: '' }); }, 4000);
  }

  function handleCreate() {
    if (!form.candidate_name || !form.candidate_email ||
        !form.position || !form.preferred_start || !form.preferred_end) {
      showMsg('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    createRequest({
      candidate_name: form.candidate_name,
      candidate_email: form.candidate_email,
      position: form.position,
      required_skills: form.required_skills
        .split(',').map(function(s) { return s.trim(); }).filter(Boolean),
      preferred_start: new Date(form.preferred_start).toISOString(),
      preferred_end: new Date(form.preferred_end).toISOString(),
      duration_minutes: Number(form.duration_minutes),
    })
      .then(function() {
        showMsg('Request created! Auto-scheduling in progress...', 'success');
        setShowForm(false);
        setForm({
          candidate_name: '', candidate_email: '',
          position: '', required_skills: '',
          preferred_start: '', preferred_end: '',
          duration_minutes: 60,
        });
        setTimeout(load, 3000);
      })
      .catch(function(e) {
        var err = e.response && e.response.data
          ? JSON.stringify(e.response.data) : e.message;
        showMsg('Error: ' + err, 'error');
      })
      .finally(function() { setSubmitting(false); });
  }

  var filtered = filter === 'ALL'
    ? requests
    : requests.filter(function(r) { return r.status === filter; });

  var counts = {};
  FILTERS.forEach(function(f) {
    counts[f] = f === 'ALL'
      ? requests.length
      : requests.filter(function(r) { return r.status === f; }).length;
  });

  return (
    <div>
      <div style={styles.topRow}>
        <h2 style={styles.heading}>Interview Requests</h2>
        <button
          style={styles.addBtn}
          onClick={function() { setShowForm(!showForm); }}
        >
          {showForm ? '✕ Cancel' : '+ New Request'}
        </button>
      </div>

      {msg.text ? (
        <div style={{
          ...styles.toast,
          background: msg.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: msg.type === 'error' ? '#991b1b' : '#166534',
        }}>
          {msg.type === 'error' ? '❌' : '✅'} {msg.text}
        </div>
      ) : null}

      {showForm ? (
        <div style={styles.formBox}>
          <h3 style={styles.formTitle}>New Interview Request</h3>

          <div className="form-row-2" style={styles.row2}>
            <div style={styles.field}>
              <label style={styles.label}>Candidate Name *</label>
              <input
                style={styles.input}
                placeholder="John Doe"
                value={form.candidate_name}
                onChange={function(e) {
                  setForm({ ...form, candidate_name: e.target.value });
                }}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email *</label>
              <input
                style={styles.input}
                type="email"
                placeholder="john@email.com"
                value={form.candidate_email}
                onChange={function(e) {
                  setForm({ ...form, candidate_email: e.target.value });
                }}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Position *</label>
            <input
              style={styles.input}
              placeholder="Backend Engineer"
              value={form.position}
              onChange={function(e) {
                setForm({ ...form, position: e.target.value });
              }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Required Skills</label>
            <input
              style={styles.input}
              placeholder="Python, Django, React"
              value={form.required_skills}
              onChange={function(e) {
                setForm({ ...form, required_skills: e.target.value });
              }}
            />
          </div>

          <div className="form-row-2" style={styles.row2}>
            <div style={styles.field}>
              <label style={styles.label}>Preferred Start *</label>
              <input
                style={styles.input}
                type="datetime-local"
                value={form.preferred_start}
                onChange={function(e) {
                  setForm({ ...form, preferred_start: e.target.value });
                }}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Preferred End *</label>
              <input
                style={styles.input}
                type="datetime-local"
                value={form.preferred_end}
                onChange={function(e) {
                  setForm({ ...form, preferred_end: e.target.value });
                }}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Duration (minutes)</label>
            <select
              style={styles.input}
              value={form.duration_minutes}
              onChange={function(e) {
                setForm({ ...form, duration_minutes: e.target.value });
              }}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <button
            style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? '⏳ Scheduling...' : '🚀 Submit Request'}
          </button>
        </div>
      ) : null}

      <div style={styles.filterRow}>
        {FILTERS.map(function(f) {
          return (
            <button
              key={f}
              style={{
                ...styles.filterBtn,
                background: filter === f ? '#6366f1' : '#fff',
                color: filter === f ? '#fff' : '#64748b',
                border: filter === f
                  ? '1px solid #6366f1'
                  : '1px solid #e2e8f0',
              }}
              onClick={function() { setFilter(f); }}
            >
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f].icon + ' ' + STATUS_CONFIG[f].label}
              <span style={{
                ...styles.countBadge,
                background: filter === f
                  ? 'rgba(255,255,255,0.3)'
                  : '#f1f5f9',
                color: filter === f ? '#fff' : '#64748b',
              }}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={styles.center}>Loading requests...</div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📋</div>
          <div style={styles.emptyText}>
            {filter === 'ALL'
              ? 'No requests yet. Create your first one!'
              : 'No ' + filter.toLowerCase() + ' requests'}
          </div>
        </div>
      ) : null}

      {filtered.map(function(req) {
        var sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
        return (
          <div key={req.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.candidateName}>
                  {req.candidate_name}
                </div>
                <div style={styles.candidateEmail}>
                  {req.candidate_email}
                </div>
              </div>
              <div style={{
                ...styles.statusBadge,
                background: sc.bg,
                color: sc.color,
              }}>
                {sc.icon} {sc.label}
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Position</div>
                <div style={styles.detailValue}>💼 {req.position}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Duration</div>
                <div style={styles.detailValue}>⏱️ {req.duration_minutes} min</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Preferred From</div>
                <div style={styles.detailValue}>
                  📅 {new Date(req.preferred_start).toLocaleDateString()}
                </div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Preferred To</div>
                <div style={styles.detailValue}>
                  📅 {new Date(req.preferred_end).toLocaleDateString()}
                </div>
              </div>
            </div>

            {req.required_skills && req.required_skills.length > 0 ? (
              <div style={styles.skillsRow}>
                {req.required_skills.map(function(s) {
                  return (
                    <span key={s} style={styles.skillTag}>{s}</span>
                  );
                })}
              </div>
            ) : null}

            {req.status === 'SCHEDULED' ? (
              <div style={styles.successMsg}>
                ✅ Interview successfully scheduled!
              </div>
            ) : null}
            {req.status === 'QUEUED' ? (
              <div style={styles.queueMsg}>
                📭 Waiting for available interviewer...
              </div>
            ) : null}
            {req.status === 'PENDING' ? (
              <div style={styles.pendingMsg}>
                ⏳ Being processed by AI scheduler...
              </div>
            ) : null}

            <div style={styles.cardFooter}>
              <span style={styles.createdAt}>
                Created: {new Date(req.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  addBtn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
  },
  toast: {
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
  },
  formBox: {
    background: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 14px',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  field: { marginBottom: 10 },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    padding: '9px 11px',
    fontSize: 13,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#1e293b',
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 4,
  },
  filterRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 14,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  filterBtn: {
    borderRadius: 20,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  countBadge: {
    borderRadius: 10,
    padding: '1px 6px',
    fontSize: 11,
    fontWeight: 700,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  candidateName: {
    fontWeight: 700,
    fontSize: 15,
    color: '#1e293b',
  },
  candidateEmail: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  divider: {
    height: 1,
    background: '#f1f5f9',
    marginBottom: 10,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 10,
  },
  detailItem: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '6px 10px',
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: 600,
  },
  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  skillTag: {
    background: '#ede9fe',
    color: '#6d28d9',
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 20,
    fontWeight: 600,
  },
  successMsg: {
    background: '#dcfce7',
    color: '#166534',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 8,
    fontWeight: 600,
    marginBottom: 8,
  },
  queueMsg: {
    background: '#fee2e2',
    color: '#991b1b',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 8,
    fontWeight: 600,
    marginBottom: 8,
  },
  pendingMsg: {
    background: '#fef9c3',
    color: '#854d0e',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 8,
    fontWeight: 600,
    marginBottom: 8,
  },
  cardFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: 8,
    marginTop: 4,
  },
  createdAt: {
    fontSize: 11,
    color: '#94a3b8',
  },
  center: {
    textAlign: 'center',
    padding: 30,
    color: '#64748b',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #f1f5f9',
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8', fontWeight: 500 },
};