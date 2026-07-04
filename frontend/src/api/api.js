import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({ baseURL: BASE });

// Attach auth token to every request automatically
api.interceptors.request.use(function(config) {
  var token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = 'Token ' + token;
  }
  return config;
});

// If token is invalid/expired, send user back to login
api.interceptors.response.use(
  function(response) { return response; },
  function(error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getDashboard = () =>
  api.get('/interview-requests/dashboard/');

export const getInterviewers = () =>
  api.get('/interviewers/');

export const createInterviewer = (data) =>
  api.post('/interviewers/', data);

export const addSlot = (id, data) =>
  api.post(`/interviewers/${id}/add-slot/`, data);

export const getRequests = () =>
  api.get('/interview-requests/');

export const createRequest = (data) =>
  api.post('/interview-requests/', data);

export const getScheduled = () =>
  api.get('/scheduled-interviews/');

export const getQueue = () =>
  api.get('/interview-requests/queue/');

export const rescheduleInterview = (id, data) =>
  api.post(`/interview-requests/${id}/reschedule/`, data);