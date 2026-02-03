import axios from "axios";

const API = "https://api.dilvoicechat.fun/api/music";

export const uploadMusic = (roomId, file, userId) => {
  const form = new FormData();
  form.append("music", file);
  form.append("userId", userId);

  return axios.post(`${API}/upload/${roomId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const playMusic = (roomId, userId) =>
  axios.post(`${API}/play/${roomId}`, { userId });

export const pauseMusic = (roomId, userId, pausedAt) =>
  axios.post(`${API}/pause/${roomId}`, { userId, pausedAt });

export const resumeMusic = (roomId, userId) =>
  axios.post(`${API}/resume/${roomId}`, { userId });

export const stopMusic = (roomId, userId) =>
  axios.post(`${API}/stop/${roomId}`, { userId });

export const fetchMusicList = (roomId, userId) =>
  axios.get(`${API}/list/${roomId}`, {
    headers: { userid: userId },
  });

export const fetchMusicState = (roomId) =>
  axios.get(`${API}/state/${roomId}`);
