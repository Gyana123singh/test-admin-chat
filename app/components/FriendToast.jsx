"use client";

import { useState } from "react";
import useFriendSocket from "../utils/friendsRequestSoket";

export default function FriendToast() {
  const [toast, setToast] = useState(null);

  useFriendSocket((data) => {
    setToast(data);
    setTimeout(() => setToast(null), 4000);
  });

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg p-4 rounded">
      <p>
        👋 <b>{toast.fromUsername}</b> sent you a friend request
      </p>
    </div>
  );
}
