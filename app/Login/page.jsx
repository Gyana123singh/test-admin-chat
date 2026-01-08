"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

/* ---------------- FIREBASE INIT ---------------- */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Login() {
  const router = useRouter();

  /* ---------------- EMAIL LOGIN ---------------- */
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---------------- OTP STATES ---------------- */
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  /* ---------------- EMAIL LOGIN (UNCHANGED) ---------------- */
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert("Enter email & password");
        return;
      }

      const res = await axios.post(
        "https://chat-app-1-qvl9.onrender.com/admin/login",
        { email, password }
      );

      const data = res.data;

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
        })
      );

      router.push("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  /* ---------------- SEND OTP ---------------- */
  const sendOTP = async () => {
    if (!phone) return alert("Enter phone number");

    try {
      const fullPhone = `${countryCode}${phone}`;

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }

      const result = await signInWithPhoneNumber(
        auth,
        fullPhone,
        window.recaptchaVerifier
      );

      setConfirmation(result);
      setOtpSent(true);
      alert("OTP Sent");
    } catch (error) {
      console.error(error);
      alert("OTP sending failed");
    }
  };

  /* ---------------- VERIFY OTP + BACKEND LOGIN ---------------- */
  const verifyOTP = async () => {
    if (!otp || !confirmation) return alert("Enter OTP");

    try {
      const result = await confirmation.confirm(otp);

      const idToken = await result.user.getIdToken();

      const res = await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/auth/otp/firebase-otp-login",
        { idToken }
      );

      const data = res.data;

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <div id="recaptcha-container"></div>

      <div className="absolute bottom-0 left-0 w-full h-[55%] bg-[#6c3eff] -z-10 skew-y-[-8deg] origin-bottom"></div>

      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg z-20">
        <div className="flex justify-center mb-6">
          <Image src="/Dil (2).png" alt="Logo" width={100} height={20} />
        </div>

        <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>

        {/* ---------------- EMAIL LOGIN ---------------- */}
        <div className="mb-5">
          <label className="block mb-1 font-medium">Email *</label>
          <input
            type="email"
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        <button
          className="w-full bg-[#6c3eff] text-white py-3 rounded-lg text-lg"
          onClick={handleLogin}
        >
          Login
        </button>

        {/* ---------------- OTP LOGIN ---------------- */}
        <div className="mt-6 border-t pt-6">
          <div className="flex gap-2 mb-3">
            <select
              className="border rounded-lg px-3 py-2"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+92">🇵🇰 +92</option>
              <option value="+880">🇧🇩 +880</option>
            </select>

            <input
              type="tel"
              placeholder="XXXXXXXXXX"
              className="flex-1 border rounded-lg px-4 py-2"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {!otpSent ? (
            <button
              className="w-full bg-black text-white py-3 rounded-lg"
              onClick={sendOTP}
            >
              Send OTP
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full border rounded-lg px-4 py-2 mb-3"
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                className="w-full bg-green-600 text-white py-3 rounded-lg"
                onClick={verifyOTP}
              >
                Verify OTP & Login
              </button>
            </>
          )}
        </div>

        {/* ---------------- GOOGLE LOGIN ---------------- */}
        <button
          onClick={() =>
            (window.location.href =
              "https://chat-app-1-qvl9.onrender.com/auth/google")
          }
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-lg mt-4"
        >
          <img src="/google.svg" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
