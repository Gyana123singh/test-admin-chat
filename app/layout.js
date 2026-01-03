"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { useEffect, useState } from "react";
import useFriendSocket from "./utils/friendsRequestSoket";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chat Admin Panel",
  description: "Admin Panel",
};

export default function RootLayout({ children }) {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userId");
      const data = localStorage.getItem("userData");

      setUserId(id);
      if (data) {
        try {
          setUserData(JSON.parse(data));
        } catch (e) {
          console.error("Failed to parse userData:", e);
        }
      }
    }
  }, []);

  useFriendSocket(userId, userData?.username, userData?.avatar, {
    onRequestReceived: (data) => {
      console.log("🔔 Friend request from:", data.fromUsername);
    },
    onRequestAccepted: (data) => {
      console.log("🎉 Request accepted by:", data.fromUsername);
    },
  });
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
