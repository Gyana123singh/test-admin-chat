"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { io } from "socket.io-client";
import { HiOutlineMicrophone, HiOutlineVolumeUp, HiOutlineVolumeOff } from "react-icons/hi";
import AddFriend from "@/app/components/AddFriend";
import MusicPlayer from "../musicPlayer";
import GiftPanel from "../../giftPanel/GiftPanel";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.dilvoicechat.fun";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export default function RoomPage() {
  const { roomId } = useParams();

  // ✅ EXISTING STATES (DO NOT CHANGE)
  const [room, setRoom] = useState(null);
  // 🆕 ROOM DESCRIPTION STATES
  const [showDescModal, setShowDescModal] = useState(false);
  const [roomDescription, setRoomDescription] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const soundMutedRef = useRef(false);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [audioStatus, setAudioStatus] = useState("waiting");
  const [showSeatOptions, setShowSeatOptions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState(null);
  // ✅ NEW MESSAGING STATES
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);

  // ✅ EXISTING REFS (DO NOT CHANGE)
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef(new Map());
  const remoteAudioRefs = useRef({});

  // ✅ NEW MESSAGE REFS
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 🎬 VIDEO STATES
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoVisible, setVideoVisible] = useState(false);

  // 🎁 GIFT STATES
  const [showGifts, setShowGifts] = useState(false);
  const [giftQueue, setGiftQueue] = useState([]);
  const [coins, setCoins] = useState(0);
  const hostId =
    room?.host?._id || room?.host?.id || room?.host?.userId || room?.host;

  const isHost = String(hostId) === String(currentUser?.id);
  // 🥊 PK STATES
  const [activePK, setActivePK] = useState(null);
  const [pkScores, setPkScores] = useState({ left: 0, right: 0 });
  const [pkWinner, setPkWinner] = useState(null);
  const [showPKSetup, setShowPKSetup] = useState(false);
  const [pkMode, setPkMode] = useState("votes"); // or "coins" or "earning"
  const [pkDuration, setPkDuration] = useState(60); // seconds
  const [pkLeftUser, setPkLeftUser] = useState(null);
  const [pkRightUser, setPkRightUser] = useState(null);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [admins, setAdmins] = useState([]);
  const total = pkScores.left + pkScores.right || 1;
  const leftPercent = (pkScores.left / total) * 100;
  const rightPercent = (pkScores.right / total) * 100;
  const [seatCount, setSeatCount] = useState(12);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Privacy");
  const [showPasswordSetupModal, setShowPasswordSetupModal] = useState(false);
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [showPasswordOptionsModal, setShowPasswordOptionsModal] = useState(false);
  const [showJoinPasswordModal, setShowJoinPasswordModal] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  useEffect(() => {
    if (!socketRef.current || !joined) return;

    const socket = socketRef.current;

    console.log("🧩 Registering PK listeners");

    socket.off("pk:started");
    socket.off("pk:update");
    socket.off("pk:ended");

    socket.on("pk:started", (pk) => {
      console.log("🔥 PK STARTED RECEIVED:", pk);
      setActivePK(pk);
      setPkScores({
        left: pk.leftUser?.score || 0,
        right: pk.rightUser?.score || 0,
      });
      setPkWinner(null);
    });

    socket.on("pk:update", ({ leftScore, rightScore }) => {
      console.log("📊 PK UPDATE:", leftScore, rightScore);
      setPkScores({ left: leftScore, right: rightScore });
    });

    socket.on("pk:ended", ({ leftScore, rightScore, winner }) => {
      console.log("🏁 PK ENDED:", winner);
      setPkScores({ left: leftScore, right: rightScore });
      setPkWinner(winner);

      setTimeout(() => {
        setActivePK(null);
        setPkWinner(null);
      }, 5000);
    });

    return () => {
      socket.off("pk:started");
      socket.off("pk:update");
      socket.off("pk:ended");
    };
  }, [joined]);
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on("error:permission", ({ message }) => {
      alert(message || "Permission denied");
    });

    return () => {
      socket.off("error:permission");
    };
  }, []);
  const DEFAULT_PK_GIFT_ID = "698e317478ac4b31e0840b6c"; // from your DB
  const [pkVoteTarget, setPkVoteTarget] = useState(null); // add this state

  const supportPK = (side) => {
    if (!socketRef.current || !activePK) return;

    const targetUserId =
      side === "left" ? activePK.leftUser?.userId : activePK.rightUser?.userId;

    if (!targetUserId) {
      alert("PK target user not found for " + side);
      return;
    }

    // 🗳️ VOTE MODE = free vote
    if (activePK.mode === "votes") {
      socketRef.current.emit("pk:vote", {
        roomId,
        pkId: activePK._id,
        toUserId: targetUserId,
      });
      return;
    }

    // 💰 COINS / EARNING MODE = open gift panel
    setPkVoteTarget(targetUserId);
    setShowGifts(true);
  };
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on("room:userLeftSeat", ({ userId }) => {
      console.log("👀 User moved to audience:", userId);

      setParticipants((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isWatcher: true } : u)),
      );
    });

    return () => {
      socket.off("room:userLeftSeat");
    };
  }, []);
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("pk:mvp", ({ message }) => {
      alert(message); // or toast
    });

    return () => {
      socketRef.current.off("pk:mvp");
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || !joined) return;

    const socket = socketRef.current;

    const handleGiftReceived = (data) => {
      console.log("🎁 Gift received:", data);

      setGiftQueue((prev) => [...prev, data]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setGiftQueue((prev) => prev.slice(1));
      }, 3000);
    };

    socket.on("gift:received", handleGiftReceived);

    return () => {
      socket.off("gift:received", handleGiftReceived);
    };
  }, [joined]);

  useEffect(() => {
    if (!socketRef.current || !joined) return;

    const socket = socketRef.current;

    socket.on("room:seatCount", ({ seatCount }) => {
      console.log("🎯 Seat updated:", seatCount);
      setSeatCount(seatCount);
    });
    socket.on("room:description", ({ description }) => {
      console.log("📄 Room description:", description);
      setRoomDescription(description);
    });

    return () => {
      socket.off("room:seatCount");
    };
  }, [joined]);

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on("gift:error", ({ message }) => {
      console.error("🎁 Gift error:", message);
      alert("Gift error: " + message);
    });

    socket.on("gift:success", (data) => {
      console.log("🎁 Gift success:", data);
      setShowGifts(false); // ✅ close only on success
    });

    return () => {
      socket.off("gift:error");
      socket.off("gift:success");
    };
  }, [joined]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on("room:seat:locked", ({ seatNumber }) => {
      console.log("🔒 Seat locked:", seatNumber);

      setLockedSeats((prev) => [...new Set([...prev, seatNumber])]);
    });

    socket.on("room:seat:unlocked", ({ seatNumber }) => {
      setLockedSeats((prev) => prev.filter((s) => s !== seatNumber));
    });

    socket.on("room:seats:lockedAll", ({ lockedSeats }) => {
      console.log("🔒 All seats locked:", lockedSeats);
      setLockedSeats(lockedSeats);
    });

    socket.on("room:mic:mutedAll", () => {
      console.log("🔇 Everyone muted");

      setParticipants((prev) =>
        prev.map((u) => ({
          ...u,
          mic: { muted: true, speaking: false },
        })),
      );
    });

    socket.on("room:adminAdded", ({ userId }) => {
      console.log("👑 Admin added:", userId);

      setAdmins((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("mic:update", ({ userId, muted }) => {
      setParticipants((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, mic: { ...u.mic, muted } } : u,
        ),
      );
    });

    socket.on("room:lockedState", ({ isLocked }) => {
      console.log("🔒 Room locked state changed:", isLocked);
      setIsRoomLocked(isLocked);
      setRoom((prev) => prev ? { ...prev, isLocked } : null);
    });

    socket.on("room:error", ({ message }) => {
      console.log("⚠️ Room error received:", message);
      alert(message || "An error occurred");
    });

    socket.on("room:seat:forceRemoved", () => {
      console.log("🪑 Kicked from seat by host");
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setMicOn(false);
      // Close peer connections
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      // Stop remote audio
      Object.values(remoteAudioRefs.current).forEach((audio) => {
        try {
          audio.srcObject = null;
          audio.pause();
        } catch {}
      });
      remoteAudioRefs.current = {};
      remoteStreamsRef.current.clear();
      setAudioStatus("waiting");
      alert("You have been removed from the seat by the host");
    });

    return () => {
      socket.off("room:seat:locked");
      socket.off("room:seat:unlocked");
      socket.off("room:seats:lockedAll");
      socket.off("room:mic:mutedAll");
      socket.off("room:adminAdded");
      socket.off("mic:update");
      socket.off("room:lockedState");
      socket.off("room:error");
      socket.off("room:seat:forceRemoved");
    };
  }, [joined]);


  /* ================= DECODE TOKEN ================= */
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const username = decoded.username || decoded.name || "User";
      const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username,
      )}&background=6c3eff&color=fff`;

      setCurrentUser({
        id: decoded.sub || decoded.id || decoded._id,
        username,
        avatar: decoded.avatar || avatarFallback,
      });

      // ✅ SET COINS HERE (CORRECT PLACE)
      setCoins(decoded.coins || 0);
    } catch (err) {
      console.error("❌ Token decode error:", err);
    }
  }, [token]);

  /* ================= FETCH ROOM ================= */
  useEffect(() => {
    if (!roomId || !token) return;

    (async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/rooms/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setRoom(res.data.room);
        setIsRoomLocked(res.data.room.isLocked || false);
        setLockedSeats(res.data.room.lockedSeats || []);
      } catch (err) {
        console.error("❌ Fetch room error:", err);
        setError("Failed to load room");
      }
    })();
  }, [roomId, token]);

  /* ================= VIDEO UPLOAD ================= */
  const uploadVideo = async (file) => {
    if (!file) return;

    const form = new FormData();
    form.append("video", file);
    form.append("userId", currentUser.id);

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/video/upload/${roomId}`,
      form,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    alert("Video uploaded");
  };

  const handleSaveDescription = () => {
    if (!socketRef.current) return;

    socketRef.current.emit("room:description:update", {
      roomId,
      description: tempDescription,
    });

    setShowDescModal(false);
  };
  /* ================= VIDEO CONTROLS ================= */
  const playVideo = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/video/play/${roomId}`,
      { userId: currentUser.id },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  };

  const pauseVideo = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/video/pause/${roomId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  };

  const resumeVideo = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/video/resume/${roomId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  };

  /* ================= SOCKET VIDEO SYNC ================= */
  useEffect(() => {
    if (!socketRef.current || !joined) return;

    const socket = socketRef.current;
    socket.on("video:play", ({ videoUrl, currentTime }) => {
      setVideoUrl(`${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}${videoUrl}`);
      setVideoVisible(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = soundMutedRef.current;
          videoRef.current.currentTime = currentTime;
          videoRef.current.play().catch(() => { });
        }
      }, 300);
    });

    socket.on("video:paused", ({ currentTime }) => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        videoRef.current.pause();
      }
    });

    socket.on("video:resumed", ({ currentTime }) => {
      if (videoRef.current) {
        videoRef.current.muted = soundMutedRef.current;
        videoRef.current.currentTime = currentTime;
        videoRef.current.play();
      }
    });

    socket.on("video:stopped", () => {
      setVideoVisible(false);
      setVideoUrl(null);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    });

    socket.on("room:videoState", ({ video }) => {
      if (!video?.fileName || !video.isVisible) return;

      const url = `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/video-stream/${roomId}/${video.fileName}`;

      setVideoUrl(url);
      setVideoVisible(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = soundMutedRef.current;
          videoRef.current.currentTime = video.currentTime || 0;

          if (video.isPlaying) {
            videoRef.current.play().catch(() => { });
          }
        }
      }, 300);
    });

    return () => {
      socket.off("video:play");
      socket.off("video:paused");
      socket.off("video:resumed");
      socket.off("video:stopped");
      socket.off("room:videoState");
    };
  }, [joined]);
  /* ================= CREATE PEER CONNECTION ================= */
  const createPeerConnection = async (peerId, isInitiator = null) => {
    if (peerConnectionsRef.current.has(peerId)) {
      console.log(`🔄 Reusing existing peer connection for ${peerId}`);
      return peerConnectionsRef.current.get(peerId);
    }

    if (isInitiator === null && currentUser) {
      isInitiator = currentUser.id.localeCompare(peerId) < 0;

      console.log(
        `📍 Auto-determined initiator: ${isInitiator} (${currentUser.id} vs ${peerId})`,
      );
    }

    console.log(
      `🔗 Creating peer connection to ${peerId}, initiator: ${isInitiator}`,
    );

    const pc = new RTCPeerConnection(ICE_SERVERS);

    peerConnectionsRef.current.set(peerId, pc);

    if (localStreamRef.current) {
      console.log(`🎤 Adding local stream to peer ${peerId}`);
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      console.log(`🔊 Remote track received from ${peerId}:`, event.track.kind);

      if (event.streams && event.streams.length > 0) {
        const remoteStream = event.streams[0];
        remoteStreamsRef.current.set(peerId, remoteStream);

        if (!remoteAudioRefs.current[peerId]) {
          const audio = new Audio();
          audio.autoplay = true;
          audio.playsInline = true;
          audio.volume = 1;

          remoteAudioRefs.current[peerId] = audio;
        }

        remoteAudioRefs.current[peerId].srcObject = remoteStream;
        remoteAudioRefs.current[peerId].muted = soundMutedRef.current;

        remoteAudioRefs.current[peerId]
          .play()
          .then(() => {
            console.log(`✅ Playing remote audio from ${peerId}`);
            setAudioStatus("playing");
          })
          .catch((err) => {
            console.warn("Autoplay blocked:", err);
          });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log(`❄️ Sending ICE candidate to ${peerId}`);
        socketRef.current.emit("call:ice", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state [${peerId}]:`, pc.connectionState);
      if (pc.connectionState === "connected") {
        setAudioStatus("connected");
      }
      if (pc.connectionState === "failed") {
        console.warn(`⚠️ Connection failed with ${peerId}, restarting ICE`);
        pc.restartIce();
      }
      if (
        pc.connectionState === "closed" ||
        pc.connectionState === "disconnected"
      ) {
        console.log(`🚫 Removing peer connection for ${peerId}`);
        peerConnectionsRef.current.delete(peerId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`❄️ ICE state [${peerId}]:`, pc.iceConnectionState);
    };

    if (isInitiator && socketRef.current && currentUser) {
      try {
        console.log(`📤 Creating offer for ${peerId} (initiator)`);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pc.setLocalDescription(offer);
        socketRef.current.emit("call:offer", {
          to: peerId,
          offer,
        });
        console.log(`✅ Offer sent to ${peerId}`);
      } catch (err) {
        console.error(`❌ Offer creation error for ${peerId}:`, err);
        pc.close();
        peerConnectionsRef.current.delete(peerId);
      }
    } else {
      console.log(`⏳ Waiting for offer from ${peerId} (responder mode)`);
    }

    return pc;
  };

  /* ================= HANDLE INCOMING OFFER ================= */
  const handleIncomingOffer = async (data) => {
    const { offer, from } = data;
    console.log(`📥 Offer received from ${from}`);

    try {
      // Recycle existing peer connection for this sender if it exists
      if (peerConnectionsRef.current.has(from)) {
        console.log(`♻️ Recycling stale peer connection from ${from} to process new offer`);
        const oldPc = peerConnectionsRef.current.get(from);
        try { oldPc.close(); } catch (e) { }
        peerConnectionsRef.current.delete(from);

        if (remoteAudioRefs.current[from]) {
          try {
            remoteAudioRefs.current[from].srcObject = null;
            remoteAudioRefs.current[from].pause();
          } catch (e) { }
          delete remoteAudioRefs.current[from];
        }
        remoteStreamsRef.current.delete(from);
      }

      const pc = await createPeerConnection(from);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`✅ Remote offer description set for ${from}`);

      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit("call:answer", {
          to: from,
          answer,
        });
        console.log(`📤 Answer sent to ${from}`);
      }
    } catch (err) {
      console.error(`❌ Offer handling error from ${from}:`, err);
    }
  };

  /* ================= HANDLE INCOMING ANSWER ================= */
  const handleIncomingAnswer = async (data) => {
    const { answer, from } = data;
    console.log(`📥 Answer received from ${from}`);

    try {
      const pc = peerConnectionsRef.current.get(from);

      if (!pc) {
        console.error(`❌ No peer connection found for ${from}`);
        return;
      }

      if (
        pc.signalingState === "stable" ||
        pc.signalingState === "have-local-offer"
      ) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`✅ Answer description set for ${from}`);
      } else {
        console.warn(
          `⚠️ Cannot accept answer - signaling state is ${pc.signalingState}`,
        );
      }
    } catch (err) {
      console.error(`❌ Answer handling error from ${from}:`, err);
    }
  };

  /* ================= HANDLE ICE CANDIDATE ================= */
  const handleIceCandidate = async (data) => {
    const { candidate, from } = data;

    try {
      const pc = peerConnectionsRef.current.get(from);

      if (!pc) {
        console.warn(`⚠️ No peer connection for ICE candidate from ${from}`);
        return;
      }

      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`✅ ICE candidate added from ${from}`);
      }
    } catch (err) {
      console.warn(`⚠️ ICE candidate error from ${from}:`, err.message);
    }
  };

  /* ================= MESSAGE FUNCTIONS ================= */
  const handleSendMessage = () => {
    console.log("🔥 SEND CLICK", editingMessageId);

    if (!socketRef.current) {
      console.log("❌ No socket");
      return;
    }

    if (!socketRef.current.connected) {
      console.log("❌ Socket not connected");
      return;
    }

    if (!messageInput.trim()) return;

    if (editingMessageId) {
      console.log("✏️ EDIT EMIT");

      socketRef.current.emit("message:edit", {
        roomId,
        messageId: editingMessageId,
        newText: messageInput,
      });

      setEditingMessageId(null);
    } else {
      socketRef.current.emit("message:send", {
        roomId,
        text: messageInput,
        userId: currentUser.id, // ✅ ADD THIS LINE
      });
    }

    setMessageInput("");
  };

  const handleDeleteMessage = (messageId, type) => {
    console.log("🔥 DELETE CLICK:", messageId, type);

    if (!socketRef.current) {
      console.log("❌ Socket missing");
      return;
    }

    if (!socketRef.current.connected) {
      console.log("❌ Socket not connected");
      return;
    }

    socketRef.current.emit("message:delete", {
      roomId,
      messageId,
      type,
    });
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id || message.dbId);
    console.log("🧪 CLICK ID:", message.id, message.dbId);
    setMessageInput(message.text);
  };

  const handleTyping = (e) => {
    const text = e.target.value;
    setMessageInput(text);

    if (!socketRef.current) return;

    if (text.length === 1) {
      socketRef.current.emit("message:typing", {
        roomId,
        isTyping: true,
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("message:typing", {
        roomId,
        isTyping: false,
      });
    }, 1000);
  };

  /* ================= JOIN ROOM ================= */
  const handleJoin = async (pass = null) => {
    if (joined || !currentUser) return;

    // Filter out React click event object if passed directly as onClick
    const password = typeof pass === "string" ? pass : null;

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("autoJoin", "true");
        if (password) {
          sessionStorage.setItem("roomPassword", password);
        } else {
          sessionStorage.removeItem("roomPassword");
        }
      }
      console.log("📤 Joining room:", { roomId, userId: currentUser.id, pass: password });

      console.log("🎤 Requesting microphone...");

      try {
        if (
          !navigator ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          throw new Error("getUserMedia not available");
        }

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        console.log("✅ Microphone accessed");
        setMicOn(true);
      } catch (mediaErr) {
        console.warn("Microphone access failed:", mediaErr?.message || mediaErr);
        const joinAsWatcher = window.confirm(
          "Microphone is not available. Join as audience (no mic) instead?",
        );
        if (!joinAsWatcher) throw new Error("User declined to join without microphone");
      }

      const joinRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/rooms/${roomId}/join`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("✅ HTTP join successful");

      if (!socketRef.current || !socketRef.current.connected) {
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          auth: { token },
        });
      }

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected");

        // Recycle WebRTC connections on socket connect/reconnect
        console.log("♻️ Recycling all peer connections for self-healing WebRTC...");
        peerConnectionsRef.current.forEach((pc) => {
          try { pc.close(); } catch (e) { }
        });
        peerConnectionsRef.current.clear();

        Object.values(remoteAudioRefs.current).forEach((audio) => {
          try {
            audio.srcObject = null;
            audio.pause();
          } catch (e) { }
        });
        remoteAudioRefs.current = {};
        remoteStreamsRef.current.clear();

        socketRef.current.emit("user:connect", {
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
        });

        socketRef.current.emit("room:join", {
          roomId,
          password: password,
          user: {
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        });
        console.log("📤 Room join emitted");

        // Automatically take a seat on join only if we have a local stream
        if (localStreamRef.current) {
          socketRef.current.emit("room:takeSeat", { roomId });
          console.log("📤 Auto-takeSeat emitted");
        } else {
          console.log("📤 Joined as watcher (no local stream), skipping auto-takeSeat");
        }

        setJoined(true);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
        setError("Connection failed");
      });

      socketRef.current.on("room:users", (users) => {
        console.log("🔥 USERS WITH DISPLAY ID:", users);

        setParticipants(users);

        users.forEach((user) => {
          if (
            user.id !== currentUser.id &&
            !user.isWatcher &&
            !peerConnectionsRef.current.has(user.id) // ✅ ADD THIS
          ) {
            console.log("🔗 Connecting to:", user.id);
            createPeerConnection(user.id);
          }
        });
      });

      socketRef.current.on("room:userJoined", (user) => {
        console.log("👤 New user joined:", user.username);
        if (
          user.id !== currentUser.id &&
          !user.isWatcher &&
          !peerConnectionsRef.current.has(user.id) // ✅ ADD THIS
        ) {
          createPeerConnection(user.id);
        }
      });

      socketRef.current.on("room:userLeft", ({ userId }) => {
        console.log(`👤 User left: ${userId}`);
        const pc = peerConnectionsRef.current.get(userId);

        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(userId);
        }
        if (remoteAudioRefs.current[userId]) {
          remoteAudioRefs.current[userId].srcObject = null;
          delete remoteAudioRefs.current[userId];
        }

        remoteStreamsRef.current.delete(userId);
        setParticipants((prev) => prev.filter((u) => u.id !== userId));
      });
    } catch (err) {
      console.error("❌ Join error:", err);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setMicOn(false);

      const resData = err.response?.data;
      if (resData?.isLocked) {
        setShowJoinPasswordModal(true);
        return;
      }

      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  /* ================= SETUP SIGNALING & MESSAGE LISTENERS ================= */
  useEffect(() => {
    if (!socketRef.current || !joined) return;

    const socket = socketRef.current;

    socket.off("call:offer");
    socket.off("call:answer");
    socket.off("call:ice");
    socket.off("message:receive");
    socket.off("message:edited");
    socket.off("message:deleted");
    socket.off("message:typing");

    socket.on("call:offer", handleIncomingOffer);
    socket.on("call:answer", handleIncomingAnswer);
    socket.on("call:ice", handleIceCandidate);

    // ✅ ADD THIS FIRST
    socket.on("room:messages", (msgs) => {
      const fixed = msgs.map((m) => ({
        ...m,
        id: m.id || m._id,
      }));

      setMessages(fixed);
    });

    // ✅ LOGGING FOR MESSAG
    // ✅ MESSAGE LISTENERS
    socket.on("message:receive", (message) => {
      console.log("💬 Message received:", message);
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          id: message.id || message._id, // ✅ FORCE DB ID
        },
      ]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    socket.on("message:edited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(messageId)
            ? { ...msg, text: newText, edited: true }
            : msg,
        ),
      );
    });

    socket.on("message:deleted:me", ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((msg) => String(msg.id) !== String(messageId)),
      );
    });

    socket.on("message:deleted:everyone", ({ messageId, text }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(messageId)
            ? { ...msg, text, deleted: true }
            : msg,
        ),
      );
    });
    socket.on(
      "message:typing",
      ({ userId, username, isTyping, typingUsers }) => {
        console.log("⌨️ Typing event:", { userId, username, isTyping });
        if (userId !== currentUser.id) {
          setTypingUsers(typingUsers.filter((uid) => uid !== currentUser.id));
        }
      },
    );

    console.log("✅ All listeners registered");

    return () => {
      socket.off("call:offer", handleIncomingOffer);
      socket.off("call:answer", handleIncomingAnswer);
      socket.off("call:ice", handleIceCandidate);
      socket.off("message:receive");
      socket.off("message:edited");
      socket.off("message:deleted");
      socket.off("message:typing");
    };
  }, [joined, currentUser, roomId]);

  /* ================= TOGGLE MIC ================= */
  const toggleMic = () => {
    if (!localStreamRef.current || !socketRef.current) return;

    const track = localStreamRef.current.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);

    if (track.enabled) {
      socketRef.current.emit("mic:unmute");
      socketRef.current.emit("mic:speaking", true);
      console.log("🎤 Mic unmuted");
    } else {
      socketRef.current.emit("mic:mute");
      socketRef.current.emit("mic:speaking", false);
      console.log("🔇 Mic muted");
    }
  };

  /* ================= TOGGLE SOUND ================= */
  const toggleSound = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    soundMutedRef.current = newMuted;

    if (socketRef.current) {
      socketRef.current.emit("sound:state", newMuted);
    }

    // Apply to all active remote audio elements
    Object.keys(remoteAudioRefs.current).forEach((peerId) => {
      const audio = remoteAudioRefs.current[peerId];
      if (audio) {
        audio.muted = newMuted;
      }
    });

    // Apply to video player
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = soundMuted;
    }
  }, [soundMuted]);

  const handleLeaveSeat = () => {
    if (!socketRef.current) return;

    console.log("🪑 Leaving seat...");

    // 1. stop mic
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setMicOn(false);

    // 2. close peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // 3. stop remote audio
    Object.values(remoteAudioRefs.current).forEach((audio) => {
      try {
        audio.srcObject = null;
        audio.pause();
      } catch { }
    });

    remoteAudioRefs.current = {};
    remoteStreamsRef.current.clear();

    // 4. notify backend
    socketRef.current.emit("room:leaveSeat", { roomId });

    // ✅ 5. RESET SOCKET (FIX)

    socketRef.current.emit("room:leave", { roomId });

    // 6. update UI
    setJoined(false);
    setAudioStatus("waiting");

    console.log("✅ Now in audience mode");
  };
  const inviteUser = () => {
    if (!socketRef.current) return;

    const userId =
      selectedUser?.id || selectedUser?.userId || selectedUser?._id;

    if (!userId) {
      alert("Select user first");
      return;
    }

    socketRef.current.emit("room:invite", {
      roomId,
      toUserId: userId,
    });

    setShowSeatOptions(false);
  };

  const lockSeat = () => {
    if (!socketRef.current || !selectedSeatNumber) return;

    console.log("📤 Locking seat:", selectedSeatNumber);

    socketRef.current.emit("room:seat:lock", {
      roomId,
      seatNumber: selectedSeatNumber,
    });

    setShowSeatOptions(false);
  };

  const unlockSeat = () => {
    if (!socketRef.current || !selectedSeatNumber) return;

    console.log("📤 Unlocking seat:", selectedSeatNumber);

    socketRef.current.emit("room:seat:unlock", {
      roomId,
      seatNumber: selectedSeatNumber,
    });

    setShowSeatOptions(false);
  };

  const removeFromSeat = () => {
    if (!socketRef.current || !selectedUser) return;

    const userId = selectedUser.id || selectedUser.userId || selectedUser._id;
    if (!userId) return;

    console.log("📤 Removing user from seat:", userId);

    socketRef.current.emit("room:seat:forceLeave", {
      roomId,
      userId,
    });

    setShowSeatOptions(false);
  };
  const micOff = () => {
    if (!isHost) return alert("Only host allowed");

    const userId =
      selectedUser?.id || selectedUser?.userId || selectedUser?._id;

    if (!userId) return alert("Select user");

    socketRef.current.emit("room:mic:forceOff", {
      roomId,
      targetUserId: userId,
    });

    setShowSeatOptions(false);
  };

  const muteAll = () => {
    if (!socketRef.current || !socketRef.current.connected) return;

    console.log("📤 Mute all");

    socketRef.current.emit("room:mic:muteAll", { roomId });

    setShowSeatOptions(false);
  };


  const giveAdmin = () => {
    if (!socketRef.current || !socketRef.current.connected) return;

    const userId =
      selectedUser?.id || selectedUser?.userId || selectedUser?._id;

    if (!userId) {
      alert("Select user first");
      return;
    }

    console.log("📤 Give Admin:", userId);

    socketRef.current.emit("room:giveAdmin", {
      roomId,
      targetUserId: userId,
    });

    setShowSeatOptions(false);
  };
  const handleSeatChange = (count) => {
    if (!socketRef.current) return;

    socketRef.current.emit("room:seatCount:update", {
      roomId,
      seatCount: count,
    });

    setShowSeatModal(false);
  };
  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up...");
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      remoteStreamsRef.current.clear();
      socketRef.current?.disconnect();

      // Clear autoJoin only if navigating away from this room
      if (typeof window !== "undefined" && !window.location.pathname.includes(roomId)) {
        sessionStorage.removeItem("autoJoin");
        sessionStorage.removeItem("roomPassword");
      }
    };
  }, [roomId]);

  /* ================= AUTO-JOIN RECOVERY ================= */
  useEffect(() => {
    if (currentUser && roomId && !joined) {
      if (typeof window !== "undefined") {
        const autoJoin = sessionStorage.getItem("autoJoin");
        if (autoJoin === "true") {
          const pass = sessionStorage.getItem("roomPassword") || null;
          console.log("🔄 Auto-joining room after refresh or reconnect...");
          handleJoin(pass);
        }
      }
    }
  }, [currentUser, roomId, joined]);

  if (!room || !currentUser)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  console.log("HOST DEBUG:", {
    roomHost: room?.host,
    currentUserId: currentUser?.id,
    isHost,
  });
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        controls
        style={{ display: "none" }}
      /> */}

      {error && (
        <div className="bg-red-500 p-3 text-sm text-center sticky top-0 z-50">
          {error}
        </div>
      )}

      {joined && (
        <div className="bg-blue-600 p-2 text-sm text-center">
          Audio Status:{" "}
          <span className="font-bold">
            {audioStatus === "waiting" && "⏳ Waiting for connection..."}
            {audioStatus === "connected" && "🟢 Connected"}
            {audioStatus === "playing" && "🔊 Playing"}
          </span>
        </div>
      )}

      <AddFriend />
      {roomDescription && (
        <div className="text-sm text-gray-300 px-4 py-2">
          📄 {roomDescription}
        </div>
      )}
      {/* HEADER */}
      <div className="p-4 flex gap-3 items-center justify-between border-b border-gray-700">
        <div>
          <Image
            src={currentUser.avatar}
            width={32}
            height={32}
            alt="avatar"
            className="rounded-full"
            unoptimized
          />
          <p className="text-xs text-gray-400 mt-1">{currentUser.username}</p>
        </div>
        <p className="text-sm text-gray-300">{room.roomId}</p>
        {/* ✅ ADD THIS HERE */}
        {isHost && (
          <button
            onClick={() => {
              setTempDescription(roomDescription || "");
              setActiveTab("Privacy");
              setShowSettingsModal(true);
            }}
            className="bg-gray-800 px-3 py-1 rounded text-xs"
          >
            ⚙️ Room Settings
          </button>
        )}
        <button
          onClick={() => handleJoin()}
          disabled={joined}
          className={`px-3 py-1 rounded text-sm font-medium ${joined
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
            }`}
        >
          {joined ? "✓ Joined" : "Join"}
        </button>

        {joined && (
          <button
            onClick={handleLeaveSeat}
            className="px-3 py-1 rounded text-sm font-medium bg-red-500 hover:bg-red-600"
          >
            Leave Seat
          </button>
        )}
      </div>

      {/* ROOM SETTINGS BUTTON */}
      <div className="p-3"></div>
      <div className="flex w-full h-4 bg-gray-700 rounded overflow-hidden">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${leftPercent}%` }}
        />
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{ width: `${rightPercent}%` }}
        />
      </div>

      {participants.length > 0 && (
        <div className="grid grid-cols-4 gap-4 p-4">
          {Array.from({ length: seatCount }).map((_, i) => {
            const user = participants.find((u) => !u.isWatcher && u.seatIndex === i);
            const seatNumber = i + 1;
            const isLocked = lockedSeats.includes(seatNumber); // ✅ REQUIRED

            return (
              <div
                key={i}
                className="flex flex-col items-center"
                onClick={() => {
                  if (!isHost) {
                    if (joined && !user && !isLocked) {
                      socketRef.current.emit("room:takeSeat", { roomId, seatNumber });
                    }
                    return;
                  }

                  setSelectedSeatNumber(seatNumber);
                  setSelectedUser(user || null);
                  setShowSeatOptions(true);
                }}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer
                    ${user ? "bg-gray-800 border-2 border-green-500" : isLocked ? "bg-red-950 border border-red-600" : "bg-gray-700 hover:bg-gray-650"}
                  `}
                >
                  {user ? (
                    <img
                      src={user.avatar}
                      className="w-full h-full rounded-full"
                    />
                  ) : isLocked ? (
                    <span>🔒</span>
                  ) : (
                    <span className="text-gray-400 font-medium">N</span>
                  )}
                </div>

                <p className="text-[10px] text-gray-400 mt-1 text-center truncate w-16">
                  {user ? (user.username || `ID: ${user.displayId}`) : isLocked ? "Locked" : `No. ${seatNumber}`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ MESSAGES SECTION */}
      {(joined || participants.length > 0) && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500 text-sm">
                No messages yet. Start chatting!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                if (msg.deletedFor?.includes(currentUser.id)) return null;

                return (
                  <div key={msg.id}>
                    <p className="text-sm">
                      {msg.deleted ? (
                        <span className="italic text-gray-400">{msg.text}</span>
                      ) : (
                        <>
                          {msg.text}
                          {msg.edited && (
                            <span className="ml-2 text-[10px] text-gray-500 italic">
                              (edited)
                            </span>
                          )}
                        </>
                      )}
                    </p>
                    {String(msg.userId) === String(currentUser.id) &&
                      !msg.deleted &&
                      socketRef.current?.connected && (
                        <div className="flex gap-2 text-xs">
                          <button onClick={() => handleEditMessage(msg)}>
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteMessage(msg.id || msg.dbId, "me")
                            }
                          >
                            Delete for me
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteMessage(
                                msg.id || msg.dbId,
                                "everyone",
                              )
                            }
                          >
                            Delete for everyone
                          </button>
                        </div>
                      )}
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="text-xs text-gray-400 italic">
                  {typingUsers
                    .map((uid) => {
                      const user = participants.find((u) => u.id === uid);
                      return user?.username || "Someone";
                    })
                    .join(", ")}{" "}
                  {typingUsers.length === 1 ? "is" : "are"} typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}

      {/* 🎬 VIDEO PLAYER */}
      {videoVisible && (
        <div className="w-full bg-black p-3 flex justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            muted={soundMuted}
            className="max-w-full rounded-lg"
          />
        </div>
      )}

      {/* 🎬 VIDEO CONTROLS */}
      {joined && (
        <div className="p-3 flex gap-2 bg-gray-900">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => uploadVideo(e.target.files[0])}
          />

          <button
            onClick={playVideo}
            className="bg-green-600 px-3 py-1 rounded"
          >
            Play
          </button>

          <button
            onClick={pauseVideo}
            className="bg-yellow-600 px-3 py-1 rounded"
          >
            Pause
          </button>

          <button
            onClick={resumeVideo}
            className="bg-blue-600 px-3 py-1 rounded"
          >
            Resume
          </button>
        </div>
      )}
      <button
        onClick={() => {
          if (participants.length === 0) {
            alert("No one in room to send gift to");
            return;
          }
          setShowGifts((s) => !s);
        }}
        className="p-3 rounded-full hover:bg-gray-700 transition flex-1 flex justify-center"
      >
        🎁
      </button>

      {giftQueue.map((g, i) => (
        <div
          key={i}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 p-3 rounded"
        >
          <img src={g.gift.icon} className="w-20 mx-auto" />
          <p className="text-center text-sm">
            {g.fromUsername} sent {g.gift.name} x{g.quantity}
          </p>
        </div>
      ))}

      {showGifts && joined && socketRef.current && (
        <GiftPanel
          roomId={roomId}
          socket={socketRef.current}
          onClose={() => setShowGifts(false)}
          pkTargetUserId={pkVoteTarget}
          pkId={activePK?._id}
          pkMode={activePK?.mode}
          participants={participants} // 👈 ADD THIS
        />
      )}

      {/* 🎵 MUSIC PLAYER */}

      {joined && socketRef.current && currentUser && (
        <MusicPlayer
          roomId={roomId}
          socket={socketRef.current}
          currentUser={currentUser}
          soundMuted={soundMuted}
        />
      )}

      {/* ✅ MESSAGE INPUT */}
      {joined && (
        <div className="p-3 border-t border-gray-700 bg-black/80">
          {editingMessageId && (
            <div className="text-xs text-gray-400 mb-2 flex items-center justify-between">
              <span>✏️ Editing message</span>
              <button
                onClick={() => {
                  setEditingMessageId(null);
                  setMessageInput("");
                }}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type message..."
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
      {joined && String(room?.host) === String(currentUser.id) && !activePK && (
        <button
          onClick={() => setShowPKSetup(true)}
          className="bg-red-600 px-3 py-1 rounded text-sm"
        >
          🥊 Start PK
        </button>
      )}

      {activePK && (
        <div className="bg-gray-900 p-4 border-b border-red-600">
          <h2 className="text-center text-lg font-bold text-red-400">
            🥊 PK Battle
          </h2>

          <div className="flex justify-between mt-3 gap-4">
            <div className="text-center flex-1">
              <p>Left</p>
              <p className="text-2xl text-yellow-400">{pkScores.left}</p>
              <button
                onClick={() => supportPK("left")}
                className="mt-2 px-3 py-1 bg-green-600 rounded"
              >
                Support Left
              </button>
            </div>

            <div className="text-center flex-1">
              <p>Right</p>
              <p className="text-2xl text-yellow-400">{pkScores.right}</p>
              <button
                onClick={() => supportPK("right")}
                className="mt-2 px-3 py-1 bg-blue-600 rounded"
              >
                Support Right
              </button>
            </div>
          </div>

          {pkWinner && (
            <p className="text-center mt-3 text-green-400 font-bold">
              🏆 Winner: {pkWinner}
            </p>
          )}
        </div>
      )}

      {showPKSetup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-gray-900 p-5 rounded w-80">
            <h2 className="text-lg font-bold mb-3 text-center">🥊 Start PK</h2>

            <p className="text-sm mb-2">Select Players</p>
            <select
              className="w-full mb-2 p-2 bg-gray-800 rounded"
              onChange={(e) =>
                setPkLeftUser(participants.find((u) => u.id === e.target.value))
              }
            >
              <option value="">Select Left</option>
              {participants.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>

            <select
              className="w-full mb-3 p-2 bg-gray-800 rounded"
              onChange={(e) =>
                setPkRightUser(
                  participants.find((u) => u.id === e.target.value),
                )
              }
            >
              <option value="">Select Right</option>
              {participants.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>

            <p className="text-sm mb-2">Mode</p>
            <div className="flex gap-2 mb-3">
              {["votes", "coins", "earning"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPkMode(m)}
                  className={`flex-1 py-1 rounded ${pkMode === m ? "bg-blue-600" : "bg-gray-700"
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <p className="text-sm mb-2">Time</p>
            <div className="flex gap-2 mb-4">
              {[15, 60, 180, 300].map((t) => (
                <button
                  key={t}
                  onClick={() => setPkDuration(t)}
                  className={`flex-1 py-1 rounded ${pkDuration === t ? "bg-green-600" : "bg-gray-700"
                    }`}
                >
                  {t}s
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPKSetup(false)}
                className="flex-1 bg-gray-700 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!pkLeftUser || !pkRightUser) {
                    alert("Select both users");
                    return;
                  }

                  try {
                    // 1️⃣ Create PK via API
                    const res = await axios.post(
                      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/pk/create-pk`,
                      {
                        roomId,
                        leftUserId: pkLeftUser.id,
                        rightUserId: pkRightUser.id,
                        mode: pkMode,
                        duration: pkDuration,
                      },
                      { headers: { Authorization: `Bearer ${token}` } },
                    );

                    const pk = res.data.pk;

                    // 2️⃣ Instantly show PK for host (no waiting for socket)
                    setActivePK(pk);
                    setPkScores({
                      left: pk.leftUser?.score || 0,
                      right: pk.rightUser?.score || 0,
                    });
                    setPkWinner(null);

                    console.log("✅ PK created:", pk._id);

                    // 3️⃣ 🔴 IMPORTANT: notify others in room via socket
                    if (socketRef.current) {
                      socketRef.current.emit("pk:start", {
                        roomId,
                        pkId: pk._id,
                      });
                    }

                    // 4️⃣ Close setup modal
                    setShowPKSetup(false);
                  } catch (err) {
                    console.error("❌ PK create error:", err);
                    alert(err.response?.data?.message || "Failed to start PK");
                  }
                }}
                className="flex-1 bg-red-600 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIO CONTROLS */}
      <div className="p-4 flex gap-4 bg-black/90 border-t border-gray-700">
        <button
          onClick={toggleMic}
          className="p-3 rounded-full hover:bg-gray-700 transition flex-1 flex justify-center"
          title="Toggle microphone"
        >
          <HiOutlineMicrophone
            className={`text-2xl ${micOn ? "text-green-400" : "text-red-400"}`}
          />
        </button>
        <button
          onClick={toggleSound}
          className="p-3 rounded-full hover:bg-gray-700 transition flex-1 flex justify-center"
          title="Volume control"
        >
          {soundMuted ? (
            <HiOutlineVolumeOff className="text-2xl text-red-400" />
          ) : (
            <HiOutlineVolumeUp className="text-2xl text-green-400" />
          )}
        </button>
      </div>
      {/* ⚙️ ROOM SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center transition-all duration-300">
          <div className="w-full max-w-md bg-[#12121e] rounded-t-3xl border-t border-gray-800 p-6 shadow-2xl pb-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-white text-lg font-bold">Room Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-white transition p-1"
              >
                ✕
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-800 mb-6 text-sm">
              {["General", "Privacy", "Moderation"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-center transition-all relative font-medium ${activeTab === tab
                    ? "text-white font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full transition-all duration-300" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[220px]">
              {activeTab === "General" && (
                <div className="space-y-4">
                  {/* Select Slots */}
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">
                      Select Total Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[8, 10, 12].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleSeatChange(num)}
                          className={`py-2 px-3 rounded-xl border text-sm transition font-medium ${seatCount === num
                            ? "bg-white text-black border-white"
                            : "bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-700"
                            }`}
                        >
                          {num} Slots
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit Room Description */}
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">
                      Room Description
                    </label>
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      maxLength={150}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-gray-700 text-sm resize-none"
                      placeholder="Enter room description..."
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-gray-500">Max 150 chars</span>
                      <span className="text-xs text-gray-400 font-semibold">
                        {tempDescription.length}/150
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleSaveDescription();
                      setShowSettingsModal(false);
                    }}
                    className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-sm transition hover:bg-gray-200 active:scale-[0.98]"
                  >
                    Save General Settings
                  </button>
                </div>
              )}

              {activeTab === "Privacy" && (
                <div className="space-y-6">
                  {/* ROOM ACCESS SECTION */}
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
                      ROOM ACCESS
                    </h4>
                    <button
                      onClick={() => {
                        setShowSettingsModal(false);
                        if (isRoomLocked) {
                          setShowPasswordOptionsModal(true);
                        } else {
                          setRoomPasswordInput("");
                          setShowPasswordSetupModal(true);
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-900/60 border border-gray-800 rounded-2xl hover:bg-gray-900 transition duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg text-white">
                          🔑
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Room Password</p>
                          <p className="text-xs text-gray-400 text-ellipsis">
                            {isRoomLocked ? "Room is protected with password" : "Protect your room with a password"}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-400">❯</span>
                    </button>
                  </div>

                  {/* SOCIAL SECTION */}
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
                      SOCIAL
                    </h4>
                    <button
                      onClick={() => {
                        setShowSettingsModal(false);
                        alert("Social sharing feature coming soon!");
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-900/60 border border-gray-800 rounded-2xl hover:bg-gray-900 transition duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg text-white">
                          👤+
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Invite Friends</p>
                          <p className="text-xs text-gray-400 text-ellipsis">Grow your audience</p>
                        </div>
                      </div>
                      <span className="text-gray-400">❯</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "Moderation" && (
                <div className="space-y-3">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                    MODERATION CONTROLS
                  </h4>
                  <button
                    onClick={() => {
                      muteAll();
                      setShowSettingsModal(false);
                    }}
                    className="w-full py-3 px-4 bg-gray-900 border border-gray-800 rounded-xl text-left text-sm font-medium text-white hover:bg-gray-800 transition"
                  >
                    🔇 Mute Everyone
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔑 ROOM PASSWORD SETUP POPUP (IMAGE 2) */}
      {showPasswordSetupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121e] border border-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-white text-lg font-bold mb-4 text-center">Room Password</h3>

            <input
              type="password"
              value={roomPasswordInput}
              onChange={(e) => setRoomPasswordInput(e.target.value)}
              placeholder="Set new password"
              className="w-full p-3.5 mb-6 rounded-2xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-gray-600 text-sm text-center font-medium"
            />

            <div className="flex justify-end gap-6 text-sm font-semibold pr-2">
              <button
                onClick={() => setShowPasswordSetupModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!roomPasswordInput.trim()) {
                    alert("Please enter a password");
                    return;
                  }
                  try {
                    await axios.put(
                      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/rooms/${roomId}/password`,
                      { password: roomPasswordInput.trim() },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setIsRoomLocked(true);
                    setShowPasswordSetupModal(false);
                    alert("Password set successfully! Room is now locked.");
                  } catch (e) {
                    alert(e.response?.data?.message || "Failed to set password");
                  }
                }}
                className="text-white hover:text-gray-200 transition font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔒 ROOM PASSWORD OPTIONS POPUP (IMAGE 3) */}
      {showPasswordOptionsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl text-black">
            <p className="text-center text-sm font-medium text-gray-700 mb-6 leading-relaxed px-2">
              This room is locked, password is required to enter the room except the room Owner
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowPasswordOptionsModal(false);
                  setRoomPasswordInput("");
                  setShowPasswordSetupModal(true);
                }}
                className="w-full py-3 bg-[#1cd4d4] hover:bg-[#18c4c4] text-white font-bold rounded-full text-sm shadow-md transition active:scale-[0.98]"
              >
                Change password
              </button>

              <button
                onClick={async () => {
                  try {
                    await axios.put(
                      `${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}/api/rooms/${roomId}/unlock`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setIsRoomLocked(false);
                    setShowPasswordOptionsModal(false);
                    alert("Room unlocked successfully!");
                  } catch (e) {
                    alert(e.response?.data?.message || "Failed to unlock room");
                  }
                }}
                className="w-full py-3 bg-transparent hover:bg-gray-50 border-2 border-[#1cd4d4] text-[#1cd4d4] font-bold rounded-full text-sm transition active:scale-[0.98]"
              >
                Unlock room
              </button>

              <button
                onClick={() => setShowPasswordOptionsModal(false)}
                className="w-full py-2.5 text-center text-sm text-gray-500 font-medium hover:text-gray-700 mt-2 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗝️ JOIN PASSWORD PROMPT MODAL */}
      {showJoinPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121e] border border-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-white text-lg font-bold mb-2 text-center">Enter Room Password</h3>
            <p className="text-center text-xs text-gray-400 mb-5 leading-relaxed px-4">
              This room is locked. Please enter the correct password to join.
            </p>

            <input
              type="password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-3.5 mb-6 rounded-2xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-gray-600 text-sm text-center font-medium"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinPasswordModal(false);
                  setJoinPassword("");
                }}
                className="flex-1 py-3 bg-gray-800 text-white font-semibold rounded-2xl text-sm transition hover:bg-gray-750"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!joinPassword.trim()) {
                    alert("Password required");
                    return;
                  }
                  handleJoin(joinPassword.trim());
                }}
                className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-2xl text-sm transition hover:bg-green-600 active:scale-[0.98]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSeatOptions && isHost && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="w-full bg-[#0f0f1a] rounded-t-2xl p-5 max-w-md mx-auto border-t border-gray-800">
            <h2 className="text-center text-lg font-semibold mb-5 text-white">
              Seat {selectedSeatNumber} Options
            </h2>

            <div className="space-y-2 text-sm text-gray-300">
              {/* If occupied, show user-specific options */}
              {selectedUser ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl mb-4">
                    <img src={selectedUser.avatar} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold text-white">{selectedUser.username}</p>
                      <p className="text-xs text-gray-400">ID: {selectedUser.displayId || "Unknown"}</p>
                    </div>
                  </div>

                  <button
                    onClick={micOff}
                    className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left"
                  >
                    🎤 Mic Off
                  </button>

                  <button
                    onClick={removeFromSeat}
                    className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left text-red-400 font-semibold"
                  >
                    👢 Remove from Seat
                  </button>

                  <button
                    onClick={giveAdmin}
                    className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left"
                  >
                    👑 Give Admin
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={inviteUser}
                    className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left"
                  >
                    👥 Invite User to Seat
                  </button>
                </>
              )}

              {/* Lock / Unlock options */}
              {selectedSeatNumber && lockedSeats.includes(selectedSeatNumber) ? (
                <button
                  onClick={unlockSeat}
                  className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left text-green-400 font-semibold"
                >
                  🔓 Unlock Seat
                </button>
              ) : (
                <button
                  onClick={lockSeat}
                  className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left text-red-400"
                >
                  🔒 Lock Seat
                </button>
              )}

              <div className="border-t border-gray-800 my-2 pt-2">
                <button
                  onClick={muteAll}
                  className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-800 rounded-xl transition text-left"
                >
                  🔇 Mute Everyone
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSeatOptions(false)}
              className="mt-5 w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
