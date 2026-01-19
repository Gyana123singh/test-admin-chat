"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "https://api.dilvoicechat.fun";

export default function MusicPlayer({ roomId, socket, currentUser }) {
  const audioRef = useRef(null);

  const [musicList, setMusicList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  /* ======================
     LOAD MUSIC LIST
  ====================== */
  const loadMusic = async () => {
    try {
      const res = await axios.get(
        `${API}/api/music/list/${roomId}`,
        {
          headers: {
            userid: currentUser.id,
          },
        }
      );
      setMusicList(res.data.data || []);
    } catch (err) {
      console.error("❌ Load music list error", err);
    }
  };

  /* ======================
     UPLOAD MUSIC
  ====================== */
  const uploadMusic = async (file) => {
    if (!file) return;

    const form = new FormData();
    form.append("music", file);
    form.append("userId", currentUser.id);

    try {
      setUploading(true);

      await axios.post(
        `${API}/api/music/upload/${roomId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await loadMusic();
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  /* ======================
     PLAY MUSIC
  ====================== */
  const playMusic = async () => {
    await axios.post(`${API}/api/music/play/${roomId}`, {
      userId: currentUser.id,
    });
  };

  /* ======================
     SOCKET EVENTS
  ====================== */
  useEffect(() => {
    if (!socket) return;

    socket.on("music:play", (data) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.src = data.musicUrl;

      const seek = (Date.now() - data.startedAt) / 1000;
      audio.currentTime = Math.max(0, seek);

      audio.play().catch(() => {});
      setCurrentSong(data.musicFile?.name);
    });

    socket.on("music:paused", ({ pausedAt }) => {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = pausedAt / 1000;
    });

    socket.on("music:resumed", ({ startedAt }) => {
      const audio = audioRef.current;
      const seek = (Date.now() - startedAt) / 1000;
      audio.currentTime = seek / 1000;
      audio.play();
    });

    socket.on("music:stopped", () => {
      const audio = audioRef.current;
      audio.pause();
      audio.src = "";
      setCurrentSong(null);
    });

    return () => {
      socket.off("music:play");
      socket.off("music:paused");
      socket.off("music:resumed");
      socket.off("music:stopped");
    };
  }, [socket]);

  return (
    <div className="border-t border-gray-700 p-4 bg-black/90">
      <audio ref={audioRef} />

      <h3 className="text-sm font-semibold mb-2">🎵 Room Music</h3>

      {/* Upload */}
      <input
        type="file"
        accept="audio/*"
        disabled={uploading}
        onChange={(e) => uploadMusic(e.target.files[0])}
        className="text-xs mb-3"
      />

      {/* Current */}
      {currentSong && (
        <div className="text-xs text-green-400 mb-2">
          ▶️ Playing: {currentSong}
        </div>
      )}

      {/* List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {musicList.map((m) => (
          <div
            key={m._id}
            className="flex justify-between items-center bg-gray-800 px-2 py-1 rounded"
          >
            <span className="text-xs truncate">
              {m.originalName}
            </span>
            <button
              onClick={playMusic}
              className="text-xs bg-green-600 px-2 py-1 rounded"
            >
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
