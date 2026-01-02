
/* ===============================
   REGISTER ROOM EVENTS
   =============================== */

export const registerRoomEvents = (socket, setParticipants, setMessages, setTypingUsers, currentUserId) => {
  if (!socket) return () => {};

  /* =========================
     ROOM USERS (INITIAL)
  ========================== */
  socket.off("room:users");
  socket.on("room:users", (users) => {
    console.log("📋 Room users:", users);
    setParticipants(users);
  });

  /* =========================
     USER JOIN
  ========================== */
  socket.off("room:userJoined");
  socket.on("room:userJoined", (user) => {
    console.log("👤 User joined:", user.username);
    setParticipants((prev) => {
      if (prev.some((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
  });

  /* =========================
     USER LEAVE
  ========================== */
  socket.off("room:userLeft");
  socket.on("room:userLeft", ({ userId }) => {
    console.log("👤 User left:", userId);
    setParticipants((prev) => prev.filter((u) => u.id !== userId));
  });

  /* =========================
     MIC STATUS
  ========================== */
  socket.off("mic:update");
  socket.on("mic:update", ({ userId, speaking, muted }) => {
    console.log(`🎤 Mic update [${userId}]:`, { speaking, muted });
    setParticipants((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, speaking, muted } : u))
    );
  });

  /* =========================
     HOST CONTROLS
  ========================== */
  socket.off("user:muted");
  socket.on("user:muted", ({ userId }) => {
    console.log(`🔇 User muted by host: ${userId}`);
    setParticipants((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, muted: true, speaking: false } : u
      )
    );
  });

  socket.off("user:kicked");
  socket.on("user:kicked", ({ userId }) => {
    console.log(`🚫 User kicked: ${userId}`);
    setParticipants((prev) => prev.filter((u) => u.id !== userId));
  });

  /* =========================
     MESSAGE RECEIVED
  ========================== */
  socket.off("message:receive");
  socket.on("message:receive", (message) => {
    console.log("💬 Message received:", message);
    if (setMessages) {
      setMessages((prev) => [...prev, message]);
    }
  });

  /* =========================
     MESSAGE EDITED
  ========================== */
  socket.off("message:edited");
  socket.on("message:edited", (editedMessage) => {
    console.log("✏️ Message edited:", editedMessage);
    if (setMessages) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === editedMessage.id ? editedMessage : msg))
      );
    }
  });

  /* =========================
     MESSAGE DELETED
  ========================== */
  socket.off("message:deleted");
  socket.on("message:deleted", ({ messageId }) => {
    console.log("🗑️ Message deleted:", messageId);
    if (setMessages) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }
  });

  /* =========================
     MESSAGE HISTORY
  ========================== */
  socket.off("room:messages");
  socket.on("room:messages", (roomMessages) => {
    console.log("📋 Message history loaded:", roomMessages.length);
    if (setMessages) {
      setMessages(roomMessages);
    }
  });

  /* =========================
     TYPING INDICATOR
  ========================== */
  socket.off("message:typing");
  socket.on("message:typing", ({ userId, username, isTyping, typingUsers: users }) => {
    console.log(`⌨️ ${username} is ${isTyping ? "typing" : "not typing"}`);
    if (setTypingUsers) {
      // Filter out current user from typing users
      const filteredUsers = users.filter((id) => id !== currentUserId);
      setTypingUsers(filteredUsers);
    }
  });

  /* =========================
     ERROR HANDLING
  ========================== */
  socket.off("message:error");
  socket.on("message:error", ({ messageId, error }) => {
    console.error(`❌ Message error [${messageId}]:`, error);
  });

  /* =========================
     WEBRTC SIGNALING
  ========================== */
  socket.off("call:offer");
  socket.on("call:offer", (data) => {
    console.log("📥 Incoming offer:", data);
  });

  socket.off("call:answer");
  socket.on("call:answer", (data) => {
    console.log("📤 Call answered:", data);
  });

  socket.off("call:ice");
  socket.on("call:ice", (data) => {
    console.log("❄️ ICE candidate:", data);
  });

  /* =========================
     CLEANUP (CRITICAL)
  ========================== */
  return () => {
    console.log("🧹 Cleaning up room event listeners");
    socket.off("room:users");
    socket.off("room:userJoined");
    socket.off("room:userLeft");
    socket.off("mic:update");
    socket.off("user:muted");
    socket.off("user:kicked");
    socket.off("message:receive");
    socket.off("message:edited");
    socket.off("message:deleted");
    socket.off("room:messages");
    socket.off("message:typing");
    socket.off("message:error");
    socket.off("call:offer");
    socket.off("call:answer");
    socket.off("call:ice");
  };
};

/* ===============================
   SEND MESSAGE HELPER
   =============================== */
export const sendMessage = (socket, roomId, text) => {
  if (!socket || !roomId || !text.trim()) {
    console.error("❌ Invalid message params");
    return;
  }

  socket.emit("message:send", {
    roomId,
    text: text.trim(),
  });
  console.log(`💬 Message sent: ${text}`);
};

/* ===============================
   EDIT MESSAGE HELPER
   =============================== */
export const editMessage = (socket, roomId, messageId, newText) => {
  if (!socket || !roomId || !messageId || !newText.trim()) {
    console.error("❌ Invalid edit params");
    return;
  }

  socket.emit("message:edit", {
    roomId,
    messageId,
    newText: newText.trim(),
  });
  console.log(`✏️ Message edited: ${messageId}`);
};

/* ===============================
   DELETE MESSAGE HELPER
   =============================== */
export const deleteMessage = (socket, roomId, messageId) => {
  if (!socket || !roomId || !messageId) {
    console.error("❌ Invalid delete params");
    return;
  }

  socket.emit("message:delete", {
    roomId,
    messageId,
  });
  console.log(`🗑️ Message deleted: ${messageId}`);
};

/* ===============================
   TYPING INDICATOR HELPER
   =============================== */
export const setTyping = (socket, roomId, isTyping) => {
  if (!socket || !roomId) {
    console.error("❌ Invalid typing params");
    return;
  }

  socket.emit("message:typing", {
    roomId,
    isTyping,
  });
  console.log(`⌨️ Typing: ${isTyping}`);
};