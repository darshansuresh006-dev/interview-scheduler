import React from 'react';
import { useEffect, useState } from 'react';
import { getScheduled, getQueue } from '../api/api';

function Scheduled() {
  const [interviews, setInterviews] = useState([]);
  const [queueLen, setQueueLen] = useState(0);

  useEffect(function() {
    getScheduled().then(function(r) { setInterviews(r.data); });
    getQueue().then(function(r) { setQueueLen(r.data.queue_length); });
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
        Scheduled Interviews
      </h2>

      <div style={{
        background: '#fff', borderRadius: 14, padding: 16,
        marginBottom: 20, display: 'flex', alignItems: 'center',
        gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #ef4444'
      }}>
        <span style={{ fontSize: 28 }}>📭</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
            Waiting Queue
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {queueLen} requests waiting
          </div>
        </div>
      </div>

      {interviews.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#94a3b8',
          padding: 30, background: '#fff', borderRadius: 12
        }}>
          No interviews scheduled yet
        </div>
      )}

      {interviews.map(function(iv) {
        return (
          <div key={iv.id} style={{
            background: '#fff', borderRadius: 14,
            padding: 16, marginBottom: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 10
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                {iv.candidate_name}
              </div>
              <span style={{
                background: '#dcfce7', color: '#16a34a',
                fontSize: 11, padding: '4px 10px',
                borderRadius: 20, fontWeight: 700
              }}>
                Scheduled
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
              Position: {iv.position}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              Interviewer: {iv.interviewer_name}
            </div>

            <div style={{
              background: '#f8fafc', borderRadius: 8, padding: 10
            }}>
              <div style={{
                fontSize: 11, color: '#94a3b8',
                marginBottom: 4, fontWeight: 600
              }}>
                Date and Time
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                {new Date(iv.slot_start).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Scheduled;

function RescheduleForm({ interviewId, onDone }) {
  const [show, setShow] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [msg, setMsg] = useState('');

  function handleReschedule() {
    if (!newStart || !newEnd) {
      setMsg('Please select both times');
      return;
    }
    fetch('http://127.0.0.1:8000/api/v1/interview-requests/' + interviewId + '/reschedule/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_start: new Date(newStart).toISOString(),
        new_end: new Date(newEnd).toISOString(),
      }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) {
          setMsg('Error: ' + data.error);
        } else {
          setMsg('Rescheduled successfully!');
          setShow(false);
          onDone();
        }
      })
      .catch(function() {
        setMsg('Failed to reschedule');
      });
  }

  return (
    <div style={{ marginTop: 10 }}>
      {msg ? (
        <div style={{
          background: '#dcfce7', color: '#16a34a',
          padding: '8px 12px', borderRadius: 8,
          fontSize: 12, marginBottom: 8,
        }}>
          {msg}
        </div>
      ) : null}

      <button
        onClick={function() { setShow(!show); }}
        style={{
          width: '100%',
          background: '#f1f5f9',
          color: '#475569',
          border: 'none',
          borderRadius: 10,
          padding: '10px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {show ? 'Cancel' : 'Reschedule Interview'}
      </button>

      {show ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{
              display: 'block', fontSize: 12,
              color: '#64748b', marginBottom: 4, fontWeight: 600,
            }}>
              New Start Time
            </label>
            <input
              type="datetime-local"
              style={{
                width: '100%', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 14, boxSizing: 'border-box',
              }}
              onChange={function(e) { setNewStart(e.target.value); }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{
              display: 'block', fontSize: 12,
              color: '#64748b', marginBottom: 4, fontWeight: 600,
            }}>
              New End Time
            </label>
            <input
              type="datetime-local"
              style={{
                width: '100%', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 14, boxSizing: 'border-box',
              }}
              onChange={function(e) { setNewEnd(e.target.value); }}
            />
          </div>

          <button
            onClick={handleReschedule}
            style={{
              width: '100%',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Confirm Reschedule
          </button>
        </div>
      ) : null}
    </div>
  );
}
