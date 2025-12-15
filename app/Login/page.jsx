"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // Fake Login Validation
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    // Store login token
    localStorage.setItem("adminAuth", "true");

    // Redirect to Dashboard inside (admin) layout
    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://chat-app-1-qvl9.onrender.com/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Purple Background */}
      <div className="absolute bottom-0 left-0 w-full h-[55%] bg-[#6c3eff] -z-10 skew-y-[-8deg] origin-bottom"></div>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg z-20">
        <div className="flex justify-center mb-6">
          <Image src="/Dil (2).png" alt="Logo" width={100} height={20} />
        </div>

        <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>

        {/* Email */}
        <div className="mb-5">
          <label className="block mb-1 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Password <span className="text-red-500">*</span>
          </label>
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

        {/* Login Button */}
        <button
          className="w-full bg-[#6c3eff] text-white py-3 rounded-lg text-lg cursor-pointer"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center gap-3 px-4 py-2 border rounded-lg shadow hover:bg-gray-100 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
