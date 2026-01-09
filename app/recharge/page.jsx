"use client";

import { useEffect, useState } from "react";
import api from "../api/api";
import loadRazorpay from "../api/loadRazorpay";
import CoinPackageCard from "../components/CoinPackageCard";
import BalanceBar from "../components/BalanceBar";
import "../styles/recharge.css";

export default function RechargePage() {
  const [packages, setPackages] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchPackages();
    fetchBalance();
  }, []);

  const fetchPackages = async () => {
    const res = await api.get("/coins/packages");
    setPackages(res.data.packages);
  };

  const fetchBalance = async () => {
    const res = await api.get("/balance");
    setBalance(res.data.coinBalance);
  };

  const handleBuy = async (pkg) => {
    const loaded = await loadRazorpay();
    if (!loaded) return alert("Razorpay SDK failed");

    // 1️⃣ Create order
    const orderRes = await api.post("/create-order", {
      packageId: pkg._id,
    });

    const { orderId, amount, currency, transactionId } = orderRes.data;

    // 2️⃣ Open Razorpay
    const options = {
      key: "rzp_test_xxxxxxxx", // ONLY KEY ID
      amount,
      currency,
      order_id: orderId,
      name: "Recharge Store",
      description: "Coin Recharge",

      handler: async function (response) {
        // 3️⃣ Verify payment
        const verifyRes = await api.post("/verify-payment", {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          transactionId,
        });

        alert("✅ Coins Added");
        setBalance(verifyRes.data.newBalance);
      },

      theme: { color: "#f5c542" },
    };

    new window.Razorpay(options).open();
  };

  return (
    <div className="container">
      <h2>💰 Recharge Store</h2>

      <BalanceBar balance={balance} />

      {packages.map((pkg) => (
        <CoinPackageCard key={pkg._id} pkg={pkg} onBuy={handleBuy} />
      ))}
    </div>
  );
}
