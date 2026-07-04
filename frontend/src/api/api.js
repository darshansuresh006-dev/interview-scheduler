import axios from 'axios';

const API_BASE = "https://interview-scheduler-ocex.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
});

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