"use client";

import { useEffect, useRef, useState } from "react";
import {
  uploadMusic,
  playMusic,
  pauseMusic,
  resumeMusic,
  stopMusic,
  fetchMusicList,
} from "../../lib/musicApi";

export default function MusicPlayer({ roomId, socket, currentUser, isHost }) {
  const audioRef = useRef(null);

  const [musicList, setMusicList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isDJ = Boolean(isHost);

  /* 🔒 HARD LOCK AUDIO (listeners) */
  const lockAudio = () => {
    const audio = audioRef.current;
    if (!audio || !startedAt) return;

    audio.controls = false;
    audio.disableRemotePlayback = true;

    audio.onseeking = () => {
      audio.currentTime = (Date.now() - startedAt) / 1000;
    };

    audio.onpause = () => {
      if (isPlaying) audio.play().catch(() => {});
    };
  };

  /* 📄 Load list */
  const loadList = async () => {
    const res = await fetchMusicList(roomId, currentUser.id);
    setMusicList(res.data.data || []);
  };

  /* 📤 Upload */
  const onUpload = async (file) => {
    if (!isDJ || !file) return;
    await uploadMusic(roomId, file, currentUser.id);
    loadList();
  };

  /* 🔊 Socket authority */
  useEffect(() => {
    if (!socket) return;

    socket.on("music:play", (data) => {
      const audio = audioRef.current;
      audio.src = data.musicUrl;
      audio.currentTime = (Date.now() - data.startedAt) / 1000;
      audio.play().catch(() => {});

      setCurrentSong(data.musicFile?.name);
      setStartedAt(data.startedAt);
      setIsPlaying(true);
      lockAudio();
    });

    socket.on("music:paused", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    socket.on("music:resumed", ({ startedAt }) => {
      const audio = audioRef.current;
      audio.currentTime = (Date.now() - startedAt) / 1000;
      audio.play().catch(() => {});
      setStartedAt(startedAt);
      setIsPlaying(true);
      lockAudio();
    });

    socket.on("music:stopped", () => {
      const audio = audioRef.current;
      audio.pause();
      audio.src = "";
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

      setStartedAt(state.startedAt);
      setIsPlaying(state.isPlaying);
      setCurrentSong(state.musicFile?.name);
      lockAudio();
    });

    return () => socket.removeAllListeners();
  }, [socket, startedAt, isPlaying]);

  useEffect(() => {
    loadList();
  }, []);

  return (
    <div className="border-t border-gray-700 p-4 bg-black/90">
      <audio ref={audioRef} preload="auto" />

      <h3 className="text-sm font-semibold mb-2">🎵 Room Music</h3>

      {/* DJ Upload */}
      {isDJ && (
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => onUpload(e.target.files[0])}
          className="text-xs mb-3"
        />
      )}

      {currentSong && (
        <div className="text-xs text-green-400 mb-2">
          ▶ Playing: {currentSong}
        </div>
      )}

      {/* DJ Controls */}
      {isDJ && (
        <div className="flex gap-2 mb-3">
          {!isPlaying ? (
            <button
              onClick={() => playMusic(roomId, currentUser.id)}
              className="bg-green-600 px-3 py-1 rounded"
            >
              Play
            </button>
          ) : (
            <button
              onClick={() =>
                pauseMusic(roomId, currentUser.id, audioRef.current.currentTime)
              }
              className="bg-yellow-600 px-3 py-1 rounded"
            >
              Pause
            </button>
          )}
          <button
            onClick={() => resumeMusic(roomId, currentUser.id)}
            className="bg-blue-600 px-3 py-1 rounded"
          >
            Resume
          </button>
          <button
            onClick={() => stopMusic(roomId, currentUser.id)}
            className="bg-red-600 px-3 py-1 rounded"
          >
            Stop
          </button>
        </div>
      )}

      {/* List (view only) */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {musicList.map((m) => (
          <div key={m._id} className="bg-gray-800 px-2 py-1 rounded text-xs">
            {m.originalName}
          </div>
        ))}
      </div>
    </div>
  );
}
