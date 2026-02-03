"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "https://api.dilvoicechat.fun";

export default function MusicPlayer({
  roomId,
  socket,
  currentUser,
  isDJ,
}) {
  const audioRef = useRef(null);

  const [musicList, setMusicList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startedAt, setStartedAt] = useState(null);

  /* ================= LOAD LIST ================= */
  const loadMusic = async () => {
    const res = await axios.get(`${API}/api/music/list/${roomId}`, {
      headers: { userid: currentUser.id },
    });
    setMusicList(res.data.data || []);
  };

  /* ================= UPLOAD (DJ ONLY) ================= */
  const uploadMusic = async (file) => {
    if (!file || !isDJ) return;

    const form = new FormData();
    form.append("music", file);
    form.append("userId", currentUser.id);

    await axios.post(`${API}/api/music/upload/${roomId}`, form);
    loadMusic();
  };

  /* ================= DJ CONTROLS ================= */
  const play = () =>
    axios.post(`${API}/api/music/play/${roomId}`, {
      userId: currentUser.id,
    });

  const pause = () =>
    axios.post(`${API}/api/music/pause/${roomId}`, {
      userId: currentUser.id,
      pausedAt: audioRef.current.currentTime,
    });

  const resume = () =>
    axios.post(`${API}/api/music/resume/${roomId}`, {
      userId: currentUser.id,
    });

  const stop = () =>
    axios.post(`${API}/api/music/stop/${roomId}`, {
      userId: currentUser.id,
    });

  /* ================= SOCKET SYNC ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("music:play", (data) => {
      const audio = audioRef.current;
      audio.src = data.musicUrl;
      audio.currentTime = (Date.now() - data.startedAt) / 1000;
      audio.play().catch(() => {});
      setCurrentSong(data.musicFile.name);
      setStartedAt(data.startedAt);
      setIsPlaying(true);
    });

    socket.on("music:paused", () => {
      audioRef.current.pause();
      setIsPlaying(false);
    });

    socket.on("music:resumed", ({ startedAt }) => {
      const audio = audioRef.current;
      audio.currentTime = (Date.now() - startedAt) / 1000;
      audio.play();
      setStartedAt(startedAt);
      setIsPlaying(true);
    });

    socket.on("music:stopped", () => {
      audioRef.current.pause();
      audioRef.current.src = "";
      setCurrentSong(null);
      setIsPlaying(false);
    });

    socket.on("room:musicState", (state) => {
      if (!state.musicUrl) return;

      const audio = audioRef.current;
      audio.src = state.musicUrl;

      if (state.isPlaying && state.startedAt) {
        audio.currentTime = (Date.now() - state.startedAt) / 1000;
        audio.play().catch(() => {});
      }

      setCurrentSong(state.musicFile?.name);
      setIsPlaying(state.isPlaying);
      setStartedAt(state.startedAt);
    });

    socket.on("music:uploaded", loadMusic);
    socket.on("music:list:deleted", loadMusic);

    return () => {
      socket.off("music:play");
      socket.off("music:paused");
      socket.off("music:resumed");
      socket.off("music:stopped");
      socket.off("room:musicState");
      socket.off("music:uploaded");
      socket.off("music:list:deleted");
    };
  }, [socket]);

  useEffect(() => {
    loadMusic();
  }, []);

  return (
    <div className="border-t border-gray-700 p-4 bg-black/90">
      <audio ref={audioRef} preload="auto" />

      <h3 className="text-sm font-semibold mb-2">🎵 Room Music</h3>

      {/* DJ UPLOAD */}
      {isDJ && (
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => uploadMusic(e.target.files[0])}
          className="text-xs mb-3"
        />
      )}

      {currentSong && (
        <div className="text-xs text-green-400 mb-2">
          ▶️ Playing: {currentSong}
        </div>
      )}

      {/* DJ CONTROLS */}
      {isDJ && (
        <div className="flex gap-2 mb-3">
          {!isPlaying ? (
            <button onClick={play} className="bg-green-600 px-3 py-1 rounded">
              Play
            </button>
          ) : (
            <button onClick={pause} className="bg-yellow-600 px-3 py-1 rounded">
              Pause
            </button>
          )}
          <button onClick={resume} className="bg-blue-600 px-3 py-1 rounded">
            Resume
          </button>
          <button onClick={stop} className="bg-red-600 px-3 py-1 rounded">
            Stop
          </button>
        </div>
      )}

      {/* MUSIC LIST */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {musicList.map((m) => (
          <div
            key={m._id}
            className="bg-gray-800 px-2 py-1 rounded text-xs truncate"
          >
            {m.originalName}
          </div>
        ))}
      </div>
    </div>
  );
}
