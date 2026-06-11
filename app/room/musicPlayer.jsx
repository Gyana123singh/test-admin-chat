"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun";

export default function MusicPlayer({ roomId, socket, currentUser, soundMuted }) {
  const audioRef = useRef(null);

  const [musicList, setMusicList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [pausedAt, setPausedAt] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [trackOwnerId, setTrackOwnerId] = useState(null);
  const [djId, setDjId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Time progress states
  const [localTime, setLocalTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Get currently playing track object to read duration
  const activeTrackObj = musicList.find((m) => m.id === currentTrackId || m._id === currentTrackId);
  const totalDuration = activeTrackObj?.duration || 0;

  /* ================= LOAD LIST ================= */
  const loadMusic = async () => {
    try {
      const res = await axios.get(`${API}/api/music/list/${roomId}`, {
        headers: { userid: currentUser.id },
      });
      setMusicList(res.data.data || []);
    } catch (err) {
      console.error("Failed to load music list:", err);
    }
  };

  /* ================= UPLOAD ================= */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect duration on client side before uploading
    const audioUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(audioUrl);
    tempAudio.addEventListener("loadedmetadata", () => {
      const duration = Math.round(tempAudio.duration);
      uploadMusic(file, duration);
    });
  };

  const uploadMusic = async (file, duration = 0) => {
    setIsUploading(true);
    const form = new FormData();
    form.append("music", file);
    form.append("userId", currentUser.id);
    form.append("duration", duration);

    try {
      await axios.post(`${API}/api/music/upload/${roomId}`, form);
      loadMusic();
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  /* ================= PLAYBACK CONTROLS ================= */
  const play = async () => {
    try {
      await axios.post(`${API}/api/music/play/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Play failed");
    }
  };

  const pause = async () => {
    try {
      await axios.post(`${API}/api/music/pause/${roomId}`, {
        userId: currentUser.id,
        pausedAt: localTime,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Pause failed");
    }
  };

  const resume = async () => {
    try {
      await axios.post(`${API}/api/music/resume/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Resume failed");
    }
  };

  const stop = async () => {
    try {
      await axios.post(`${API}/api/music/stop/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Stop failed");
    }
  };

  const next = async () => {
    try {
      await axios.post(`${API}/api/music/next/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Next track failed");
    }
  };

  const prev = async () => {
    try {
      await axios.post(`${API}/api/music/previous/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Previous track failed");
    }
  };

  const forward = async () => {
    try {
      await axios.post(`${API}/api/music/forward/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Fast forward failed");
    }
  };

  const rewind = async () => {
    try {
      await axios.post(`${API}/api/music/rewind/${roomId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Rewind failed");
    }
  };

  const selectTrack = async (musicId) => {
    try {
      await axios.post(`${API}/api/music/select/${roomId}/${musicId}`, {
        userId: currentUser.id,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Track selection failed");
    }
  };

  const deleteTrack = async (musicId) => {
    try {
      await axios.delete(`${API}/api/music/delete/${roomId}/${musicId}`, {
        headers: { userid: currentUser.id },
      });
      loadMusic();
    } catch (err) {
      alert(err.response?.data?.error || "Delete track failed");
    }
  };

  /* ================= SEEKING ================= */
  const handleSeekChange = (e) => {
    setIsDragging(true);
    setLocalTime(Number(e.target.value));
  };

  const handleSeekEnd = async () => {
    setIsDragging(false);
    try {
      await axios.post(`${API}/api/music/seek/${roomId}`, {
        userId: currentUser.id,
        position: localTime,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Seek failed");
    }
  };

  /* ================= TIME TRACKER TIMER ================= */
  useEffect(() => {
    let interval;
    if (isPlaying && startedAt) {
      interval = setInterval(() => {
        if (!isDragging) {
          const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
          if (totalDuration > 0 && elapsed >= totalDuration) {
            setLocalTime(totalDuration);
          } else {
            setLocalTime(Math.max(0, elapsed));
          }
        }
      }, 250);
    } else {
      if (!isDragging) {
        setLocalTime(pausedAt || 0);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, startedAt, pausedAt, totalDuration, isDragging]);

  /* ================= SOUND MUTING EFFECT ================= */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = !!soundMuted;
    }
  }, [soundMuted]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await axios.get(`${API}/api/music/state/${roomId}`);
        const state = res.data;
        if (state) {
          setDjId(state.playedBy || state.trackOwnerId);
          setTrackOwnerId(state.trackOwnerId);
          setCurrentTrackId(state.currentTrackId);
          setCurrentSong(state.musicFile?.name || null);
          setIsPlaying(state.isPlaying);
          setStartedAt(state.startedAt);
          setPausedAt(state.pausedAt);

          const audio = audioRef.current;
          if (audio && state.musicUrl) {
            audio.src = state.musicUrl;
            let targetTime = 0;
            if (state.isPlaying && state.startedAt) {
              targetTime = (Date.now() - new Date(state.startedAt).getTime()) / 1000;
            } else {
              targetTime = state.pausedAt || 0;
            }
            audio.currentTime = Math.max(0, targetTime);
            if (state.isPlaying) {
              audio.muted = !!soundMuted;
              audio.play().catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error("Failed to load initial music state:", err);
      }
    };

    loadMusic();
    fetchState();
  }, [roomId]);

  /* ================= SOCKET SYNC LISTENERS ================= */
  useEffect(() => {
    if (!socket) return;

    const applySyncState = (state) => {
      if (!state) return;

      setDjId(state.playedBy || state.trackOwnerId);
      setTrackOwnerId(state.trackOwnerId);
      setCurrentTrackId(state.currentTrackId);
      
      if (state.playlist) {
        setMusicList(state.playlist);
      }

      setCurrentSong(state.musicFile?.name || null);
      setIsPlaying(state.isPlaying);
      setStartedAt(state.startedAt);
      setPausedAt(state.pausedAt);

      const audio = audioRef.current;
      if (audio) {
        if (state.musicUrl) {
          if (audio.src !== state.musicUrl) {
            audio.src = state.musicUrl;
          }

          let targetTime = 0;
          if (state.isPlaying && state.startedAt) {
            targetTime = (Date.now() - new Date(state.startedAt).getTime()) / 1000;
          } else {
            targetTime = state.pausedAt || 0;
          }

          if (Math.abs(audio.currentTime - targetTime) > 1.5) {
            audio.currentTime = Math.max(0, targetTime);
          }

          if (state.isPlaying) {
            audio.muted = !!soundMuted;
            audio.play().catch(() => {});
          } else {
            audio.pause();
          }
        } else {
          audio.pause();
          audio.src = "";
        }
      }
    };

    socket.on("music:sync", applySyncState);
    socket.on("room:musicState", applySyncState);
    socket.on("music:uploaded", loadMusic);
    socket.on("music:list:deleted", loadMusic);

    return () => {
      socket.off("music:sync", applySyncState);
      socket.off("room:musicState", applySyncState);
      socket.off("music:uploaded");
      socket.off("music:list:deleted");
    };
  }, [socket, soundMuted]);

  /* ================= PLAYBACK OWNERSHIP CHECK ================= */
  const isOwner = !trackOwnerId || String(trackOwnerId) === String(currentUser.id);
  const uploaderUsername = activeTrackObj?.uploaderUsername || "Uploader";

  /* ================= UTILITY FORMAT ================= */
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="border-t border-white/10 p-6 bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white rounded-t-2xl shadow-2xl flex flex-col md:flex-row gap-6">
      <audio ref={audioRef} preload="auto" />

      {/* LEFT: PLAYER CONTROLLER PANEL */}
      <div className="flex-1 flex flex-col justify-between bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
        
        {/* Spinner Grooves Visual Decoration */}
        {isPlaying && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
        )}

        <div className="flex items-center gap-4 mb-4">
          {/* Virtual Vinyl Disk */}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-gray-800 via-gray-900 to-black border-2 border-gray-700 flex items-center justify-center relative shadow-lg ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }}>
            <div className="w-5 h-5 rounded-full bg-blue-500 border border-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            {/* Groove lines */}
            <div className="absolute inset-2 border border-gray-800 rounded-full pointer-events-none opacity-40" />
            <div className="absolute inset-4 border border-gray-800 rounded-full pointer-events-none opacity-20" />
          </div>

          <div className="overflow-hidden">
            <h4 className="text-base font-bold tracking-tight text-white truncate max-w-xs">
              {currentSong || "No song active"}
            </h4>
            {currentSong ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                DJ: {uploaderUsername}
              </span>
            ) : (
              <p className="text-xs text-gray-400">
                Select or upload a track to begin playing.
              </p>
            )}
          </div>
        </div>

        {/* TIME BAR & SLIDER */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1 font-mono">
            <span>{formatTime(localTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            value={localTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            disabled={!isOwner}
            className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 ${!isOwner ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"}`}
          />
        </div>

        {/* PLAYER ACTION BUTTONS */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Previous */}
          <button
            onClick={prev}
            disabled={!isOwner}
            title="Previous Track"
            className={`p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          {/* Rewind -10s */}
          <button
            onClick={rewind}
            disabled={!isOwner}
            title="Rewind 10 seconds"
            className={`p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M11.5 12l8.5 6V6zm-9 0l8.5 6V6z"/>
            </svg>
          </button>

          {/* Play / Pause / Resume */}
          {!isPlaying ? (
            <button
              onClick={currentTrackId ? resume : play}
              disabled={!isOwner}
              title="Play"
              className={`p-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition hover:scale-105 active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={pause}
              disabled={!isOwner}
              title="Pause"
              className={`p-3.5 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/20 transition hover:scale-105 active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
          )}

          {/* Forward +10s */}
          <button
            onClick={forward}
            disabled={!isOwner}
            title="Forward 10 seconds"
            className={`p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6zm9 0l8.5-6-8.5-6z"/>
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={next}
            disabled={!isOwner}
            title="Next Track"
            className={`p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6zm10-12h2v12h-2z"/>
            </svg>
          </button>

          {/* Stop */}
          <button
            onClick={stop}
            disabled={!isOwner}
            title="Stop Music"
            className={`p-2 rounded-full border border-red-500/20 bg-red-950/20 hover:bg-red-900/30 text-red-400 transition active:scale-95 ${!isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
        </div>

        {/* Ownership Lock Notification Bar */}
        <div className="text-center">
          {isOwner ? (
            <p className="text-[10px] text-green-400 bg-green-500/10 py-1 px-3.5 rounded-full inline-block font-medium">
              👑 You have playback control
            </p>
          ) : (
            <p className="text-[10px] text-yellow-400 bg-yellow-500/10 py-1 px-3.5 rounded-full inline-block font-medium">
              🔒 Locked by DJ: {uploaderUsername}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: PLAYLIST & UPLOAD PANEL */}
      <div className="w-full md:w-[340px] flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Room Playlist</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
            {musicList.length} Tracks
          </span>
        </div>

        {/* UPLOADER */}
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-blue-400/50 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 cursor-pointer transition text-xs font-semibold text-gray-300">
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing Audio...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Upload Track (MP3/Opus)
              </>
            )}
            <input
              type="file"
              accept="audio/*"
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* PLAYLIST ITEMS SCROLL VIEW */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {musicList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No tracks uploaded yet.
            </div>
          ) : (
            musicList.map((track) => {
              const isCurrent = currentTrackId === track.id || currentTrackId === track._id;
              const isUploader = String(track.uploaderId) === String(currentUser.id);
              
              return (
                <div
                  key={track.id || track._id}
                  onClick={() => !isCurrent && isOwner && selectTrack(track.id || track._id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                    isCurrent
                      ? "bg-blue-950/40 border-blue-500/40 text-blue-300 font-semibold shadow-md shadow-blue-500/5"
                      : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Icon */}
                    <div className={`p-1.5 rounded-lg ${isCurrent ? "bg-blue-600/20" : "bg-white/5"}`}>
                      {isCurrent && isPlaying ? (
                        <span className="flex gap-0.5 items-end h-3 w-3">
                          <span className="w-0.5 bg-blue-400 animate-bounce" style={{ animationDuration: "0.6s" }} />
                          <span className="w-0.5 bg-blue-400 animate-bounce" style={{ animationDuration: "0.9s" }} />
                          <span className="w-0.5 bg-blue-400 animate-bounce" style={{ animationDuration: "0.7s" }} />
                        </span>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate pr-1">{track.originalName}</p>
                      <p className="text-[10px] text-gray-500 font-normal">
                        by {track.uploaderUsername || "User"} • {formatTime(track.duration)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {isUploader && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrack(track.id || track._id);
                        }}
                        title="Delete track"
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
