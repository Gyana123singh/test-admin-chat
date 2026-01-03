"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { io } from "socket.io-client";
import { HiOutlineMicrophone, HiOutlineVolumeUp } from "react-icons/hi";


const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function RoomPage() {
  const { roomId } = useParams();

  const handleSendRequest = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/request",
        { to: toUserId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true, // remove if not using cookies
        }
      );

      alert("Friend request sent ✅");
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  // ✅ EXISTING STATES (DO NOT CHANGE)
  const [room, setRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [audioStatus, setAudioStatus] = useState("waiting");

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
  const remoteAudioRef = useRef(null);

  // ✅ NEW MESSAGE REFS
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  /* ================= DECODE TOKEN ================= */
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({
        id: decoded.sub || decoded.roomId,
        username: decoded.username || decoded.name || "User",
        avatar: decoded.avatar || "/avatar.png",
      });
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
          `http://localhost:5000/api/rooms/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRoom(res.data.room);
      } catch (err) {
        console.error("❌ Fetch room error:", err);
        setError("Failed to load room");
      }
    })();
  }, [roomId, token]);

  /* ================= CREATE PEER CONNECTION ================= */
  const createPeerConnection = async (peerId, isInitiator = null) => {
    if (peerConnectionsRef.current.has(peerId)) {
      console.log(`🔄 Reusing existing peer connection for ${peerId}`);
      return peerConnectionsRef.current.get(peerId);
    }

    if (isInitiator === null && currentUser) {
      isInitiator = currentUser.id < peerId;
      console.log(
        `📍 Auto-determined initiator: ${isInitiator} (${currentUser.id} vs ${peerId})`
      );
    }

    console.log(
      `🔗 Creating peer connection to ${peerId}, initiator: ${isInitiator}`
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

        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.volume = 1;

          const playPromise = remoteAudioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`✅ Remote audio from ${peerId} playing`);
                setAudioStatus("playing");
              })
              .catch((error) => {
                console.warn(
                  `⚠️ Autoplay blocked: ${error.message}. User can click play.`
                );
              });
          }
        }
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
          `⚠️ Cannot accept answer - signaling state is ${pc.signalingState}`
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

      if (
        pc.signalingState !== "closed" &&
        pc.signalingState !== "have-remote-offer"
      ) {
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`✅ ICE candidate added from ${from}`);
        }
      } else {
        console.warn(
          `⚠️ Ignoring ICE - signaling state is ${pc.signalingState}`
        );
      }
    } catch (err) {
      console.warn(`⚠️ ICE candidate error from ${from}:`, err.message);
    }
  };

  /* ================= MESSAGE FUNCTIONS ================= */
  const handleSendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return;

    if (editingMessageId) {
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
      });
    }

    setMessageInput("");
  };

  const handleDeleteMessage = (messageId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("message:delete", {
      roomId,
      messageId,
    });
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
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
  const handleJoin = async () => {
    if (joined || !currentUser) return;

    try {
      console.log("📤 Joining room:", { roomId, userId: currentUser.id });

      console.log("🎤 Requesting microphone...");
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log("✅ Microphone accessed");
      setMicOn(true);

      const joinRes = await axios.post(
        `http://localhost:5000/api/rooms/${roomId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ HTTP join successful");

      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          auth: { token },
        });
      }

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected");

        socketRef.current.emit("user:connect", {
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
        });

        socketRef.current.emit("room:join", {
          roomId,
          user: {
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        });
        console.log("📤 Room join emitted");

        setJoined(true);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
        setError("Connection failed");
      });

      socketRef.current.once("room:users", (users) => {
        console.log("📋 Existing users in room:", users);
        setParticipants(users);

        users.forEach((user) => {
          if (user.id !== currentUser.id) {
            console.log(`🤝 Creating peer connection to ${user.username}`);
            createPeerConnection(user.id);
          }
        });
      });

      socketRef.current.on("room:userJoined", (user) => {
        console.log("👤 New user joined:", user.username);
        if (user.id !== currentUser.id) {
          setParticipants((prev) =>
            prev.some((u) => u.id === user.id) ? prev : [...prev, user]
          );
          console.log(`🤝 Creating peer connection to ${user.username}`);
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
        remoteStreamsRef.current.delete(userId);
        setParticipants((prev) => prev.filter((u) => u.id !== userId));
      });
    } catch (err) {
      console.error("❌ Join error:", err);
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

    // ✅ MESSAGE LISTENERS
    socket.on("message:receive", (message) => {
      console.log("💬 Message received:", message);
      setMessages((prev) => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    socket.on("message:edited", (updatedMessage) => {
      console.log("✏️ Message edited:", updatedMessage);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    });

    socket.on("message:deleted", ({ messageId }) => {
      console.log("🗑️ Message deleted:", messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    socket.on(
      "message:typing",
      ({ userId, username, isTyping, typingUsers }) => {
        console.log("⌨️ Typing event:", { userId, username, isTyping });
        if (userId !== currentUser.id) {
          setTypingUsers(typingUsers.filter((uid) => uid !== currentUser.id));
        }
      }
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

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up...");
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      remoteStreamsRef.current.clear();
      socketRef.current?.disconnect();
    };
  }, []);

  if (!room || !currentUser)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        controls
        style={{ display: "none" }}
      />

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

        <button
          onClick={handleJoin}
          disabled={joined}
          className={`px-3 py-1 rounded text-sm font-medium ${
            joined
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {joined ? "✓ Joined" : "Join"}
        </button>

        {/* for add friends  */}
        <button
          onClick={handleSendRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Friend
        </button>
      </div>

      {joined && (
        <div className="p-4 text-sm text-gray-300 border-b border-gray-700">
          <p className="font-semibold">👥 In room: {participants.length + 1}</p>
          <p className="text-xs text-green-400 mt-2">✓ You</p>
          {participants.map((user) => (
            <div key={user.id} className="text-xs mt-2 flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span>{user.username || "User"}</span>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MESSAGES SECTION */}
      {joined && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500 text-sm">
                No messages yet. Start chatting!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className="flex gap-2 group">
                  <img
                    src={message.avatar}
                    alt={message.username}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.edited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-100 break-words">
                      {message.text}
                    </p>

                    {message.userId === currentUser.id && (
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEditMessage(message)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

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
          className="p-3 rounded-full hover:bg-gray-700 transition flex-1 flex justify-center"
          title="Volume control"
        >
          <HiOutlineVolumeUp className="text-2xl text-gray-400" />
        </button>
      </div>
    </div>
  );
}
