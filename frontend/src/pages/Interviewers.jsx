import React, { useEffect, useState } from 'react';
import { getInterviewers, createInterviewer, addSlot } from '../api/api';

export default function Interviewers() {
  const [interviewers, setInterviewers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    expertise: '',
    timezone: 'Asia/Kolkata',
  });
  const [slot, setSlot] = useState({
    start_time: '',
    end_time: '',
  });

  function load() {
    getInterviewers().then(function(r) {
      setInterviewers(r.data);
    });
  }

  useEffect(function() {
    load();
  }, []);

  function handleCreate() {
    var data = {
      name: form.name,
      email: form.email,
      expertise: form.expertise.split(',').map(function(s) { return s.trim(); }),
      timezone: form.timezone,
      is_active: true,
    };
    createInterviewer(data)
      .then(function() {
        setMsg('Interviewer created!');
        setShowForm(false);
        setForm({ name: '', email: '', expertise: '', timezone: 'Asia/Kolkata' });
        load();
      })
      .catch(function(e) {
        setMsg('Error: ' + JSON.stringify(e.response && e.response.data));
      });
  }

  function handleAddSlot(id) {
  if (!slot.start_time || !slot.end_time) {
    setMsg('Please select start and end time');
    return;
  }

  var payload = {
    start_time: slot.start_time,
    end_time: slot.end_time,
    interviewer: id,
  };

  console.log('Sending slot:', payload);

  addSlot(id, payload)
    .then(function() {
      setMsg('Slot added successfully!');
      setShowSlotForm(null);
      setSlot({ start_time: '', end_time: '' });
      load();
    })
    .catch(function(e) {
      var errMsg = e.response && e.response.data
        ? JSON.stringify(e.response.data)
        : e.message;
      setMsg('Error: ' + errMsg);
      console.error('Slot error:', e.response && e.response.data);
    });
}

  return (
    <div>
      {msg ? (
        <div style={{
          background: '#dcfce7', color: '#16a34a',
          padding: '10px 14px', borderRadius: 8,
          marginBottom: 12, fontSize: 13, fontWeight: 600,
        }}>
          {msg}
          <span
            style={{ float: 'right', cursor: 'pointer' }}
            onClick={function() { setMsg(''); }}
          >
            x
          </span>
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Interviewers
        </h2>
        <button
          style={styles.btn}
          onClick={function() { setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm ? (
        <div style={styles.formBox}>
          <h3 style={styles.formTitle}>New Interviewer</h3>

          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              type="text"
              value={form.name}
              placeholder="Full name"
              onChange={function(e) { setForm({ ...form, name: e.target.value }); }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={form.email}
              placeholder="Email address"
              onChange={function(e) { setForm({ ...form, email: e.target.value }); }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Skills (comma separated)</label>
            <input
              style={styles.input}
              type="text"
              value={form.expertise}
              placeholder="Python, Django, React"
              onChange={function(e) { setForm({ ...form, expertise: e.target.value }); }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Timezone</label>
            <input
              style={styles.input}
              type="text"
              value={form.timezone}
              placeholder="Asia/Kolkata"
              onChange={function(e) { setForm({ ...form, timezone: e.target.value }); }}
            />
          </div>

          <button style={styles.submitBtn} onClick={handleCreate}>
            Create Interviewer
          </button>
        </div>
      ) : null}

      {interviewers.length === 0 ? (
        <div style={styles.empty}>No interviewers yet. Add one above.</div>
      ) : null}

      {interviewers.map(function(iv) {
        return (
          <div key={iv.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                  {iv.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {iv.email}
                </div>
              </div>
              <span style={iv.is_active ? styles.active : styles.inactive}>
                {iv.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {(iv.expertise || []).map(function(s) {
                return (
                  <span key={s} style={styles.skill}>{s}</span>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              <span>Total slots: {iv.total_slots || 0}</span>
              <span>Booked: {iv.booked_slots || 0}</span>
            </div>

            <button
              style={styles.slotBtn}
              onClick={function() {
                setShowSlotForm(showSlotForm === iv.id ? null : iv.id);
              }}
            >
              {showSlotForm === iv.id ? 'Cancel' : '+ Add Availability Slot'}
            </button>

            {showSlotForm === iv.id ? (
              <div style={{ marginTop: 12 }}>
                <div style={styles.field}>
                  <label style={styles.label}>Start Time</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    onChange={function(e) {
                      var iso = new Date(e.target.value).toISOString();
                      setSlot(function(prev) { return { ...prev, start_time: iso }; });
                    }}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>End Time</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    onChange={function(e) {
                      var iso = new Date(e.target.value).toISOString();
                      setSlot(function(prev) { return { ...prev, end_time: iso }; });
                    }}
                  />
                </div>

                <button
                  style={styles.submitBtn}
                  onClick={function() { handleAddSlot(iv.id); }}
                >
                  Save Slot
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  btn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 16px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  formBox: {
    background: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 12,
    color: '#1e293b',
    margin: '0 0 12px 0',
  },
  field: {
    marginBottom: 10,
  },
  label: {
    display: 'block',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: 600,
  },
  input: {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#1e293b',
  },
  submitBtn: {
    width: '100%',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  active: {
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 600,
    height: 'fit-content',
  },
  inactive: {
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 20,
    fontWeight: 600,
  },
  skill: {
    background: '#ede9fe',
    color: '#6d28d9',
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 20,
    fontWeight: 600,
  },
  slotBtn: {
    width: '100%',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 10,
    padding: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 30,
    background: '#fff',
    borderRadius: 12,
  },
};