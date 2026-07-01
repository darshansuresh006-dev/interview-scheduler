import React from 'react';
import { useEffect, useState } from 'react';
import { getScheduled, getQueue } from '../api/api';

function Scheduled() {
  const [interviews, setInterviews] = useState([]);
  const [queueLen, setQueueLen] = useState(0);

  useEffect(function () {
    getScheduled().then(function (r) { setInterviews(r.data); });
    getQueue().then(function (r) { setQueueLen(r.data.queue_length); });
  }, []);

  function refreshList() {
    getScheduled().then(function (r) { setInterviews(r.data); });
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50', marginBottom: 10 }}>
        Scheduled Interviews
      </h2>

      <div style={{
        background: '#fff', borderRadius: 12, padding: 14,
        marginBottom: 20, display: 'flex', alignItems: 'center',
        gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,.08)',
        borderLeft: '4px solid #e67e22'
      }}>
        <span style={{ fontSize: 28 }}>⏳</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#2c3e50' }}>
            Waiting Queue
          </div>
          <div style={{ fontSize: 13, color: '#8695a7', marginTop: 2 }}>
            {queueLen} requests waiting
          </div>
        </div>
      </div>

      {interviews.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#8fa8bd',
          padding: 30, background: '#fff', borderRadius: 12
        }}>
          No interviews scheduled yet
        </div>
      )}

      {interviews.map(function (i) {
        return (
          <div key={i.id} style={{
            background: '#fff', borderRadius: 14,
            padding: 16, marginBottom: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,.08)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 10
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#2c3e50' }}>
                {i.candidate_name}
              </div>
              <span style={{
                background: '#e8f5e9', color: '#2e7d32',
                fontSize: 12, padding: '4px 10px',
                borderRadius: 20, fontWeight: 700
              }}>
                Scheduled
              </span>
            </div>

            <div style={{ fontSize: 13, color: '#8695a7', marginBottom: 4 }}>
              {i.position}
            </div>
            <div style={{ fontSize: 13, color: '#8695a7', marginBottom: 10 }}>
              Interviewer: {i.interviewer_name}
            </div>

            <div style={{
              background: '#f8fafb', borderRadius: 8, padding: 10
            }}>
              <div style={{
                fontSize: 12, color: '#8fa8bd',
                marginBottom: 4, fontWeight: 600
              }}>
                Date and Time
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#34495e' }}>
                {new Date(i.slot_start).toLocaleString()}
              </div>
            </div>

            <RescheduleForm
              interviewId={i.id}
              onDone={refreshList}
            />
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

    fetch(`http://127.0.0.1:8000/api/v1/interview-requests/${interviewId}/reschedule/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_start: new Date(newStart).toISOString(),
        new_end: new Date(newEnd).toISOString(),
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          setMsg('Error: ' + data.error);
        } else {
          setMsg('Rescheduled successfully!');
          setShow(false);
          if (onDone) onDone();
        }
      })
      .catch(function () {
        setMsg('Failed to reschedule');
      });
  }

  return (
    <div style={{ marginTop: 10 }}>
      {msg && (
        <div style={{
          background: '#fff4e5', color: '#e67e22',
          padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 8
        }}>
          {msg}
        </div>
      )}

      {show && (
        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#8695a7', marginBottom: 4, fontWeight: 600 }}>
              New Start Time
            </label>
            <input
              type="datetime-local"
              style={{
                width: '100%', border: '1px solid #dce6ef',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 14, boxSizing: 'border-box'
              }}
              onChange={function (e) { setNewStart(e.target.value); }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#8695a7', marginBottom: 4, fontWeight: 600 }}>
              New End Time
            </label>
            <input
              type="datetime-local"
              style={{
                width: '100%', border: '1px solid #dce6ef',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 14, boxSizing: 'border-box'
              }}
              onChange={function (e) { setNewEnd(e.target.value); }}
            />
          </div>

          <button
            onClick={handleReschedule}
            style={{
              width: '100%', background: '#4A90E2',
              color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Confirm Reschedule
          </button>
        </div>
      )}

      <button
        onClick={function () { setShow(!show); }}
        style={{
          width: '100%',
          background: '#EAF3FE',
          color: '#4A90E2',
          border: 'none',
          borderRadius: 8,
          padding: '10px',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          marginTop: 6
        }}
      >
        {show ? 'Cancel' : 'Reschedule Interview'}
      </button>
    </div>
  );
}