import axios from 'axios';

const API_URL = '/api';

export const analyzeUrl = async (url) => {
  const response = await axios.post(`${API_URL}/analyze-url`, { url });
  return response.data;
};

export const downloadVideo = async (url, format, quality) => {
  const response = await axios.post(`${API_URL}/download-video`, { url, format, quality });
  return response.data;
};

export const downloadPlaylist = async (url, format, quality) => {
  const response = await axios.post(`${API_URL}/download-playlist`, { url, format, quality });
  return response.data;
};

export const getFiles = async () => {
  const response = await axios.get(`${API_URL}/files`);
  return response.data;
};

export const getQueue = async () => {
  const response = await axios.get(`${API_URL}/queue`);
  return response.data;
};

export const cancelDownload = async (id) => {
  const response = await axios.post(`${API_URL}/cancel/${id}`);
  return response.data;
};

export const getHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await axios.delete(`${API_URL}/history`);
  return response.data;
};

export const subscribeToProgress = (id, callback) => {
  const eventSource = new EventSource(`${API_URL}/progress/${id}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };
  
  eventSource.onerror = () => {
    eventSource.close();
  };
  
  return () => eventSource.close();
};
