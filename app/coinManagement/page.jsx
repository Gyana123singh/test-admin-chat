"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, IndianRupee, Coins, Minus } from "lucide-react";
import AddPlanModal from "../components/modal/AddPlanModal";
import ModalComponent from "../components/modal/ModalComponents";

export default function CoinManagement() {
  const [openModal, setOpenModal] = useState(null);

  /* ===============================
     RECHARGE PLANS (FROM BACKEND)
  =============================== */
  const [plans, setPlans] = useState([]);

  /* ===============================
     GET RECHARGE PLANS API
  =============================== */
  useEffect(() => {
    const fetchRechargePlans = async () => {
      try {
        const res = await axios.get(
          "https://chat-app-1-qvl9.onrender.com/api/get-recharge-plans"
        );

        if (res.data?.success) {
          setPlans(res.data.plans);
        }
      } catch (error) {
        console.error("Failed to fetch recharge plans", error);
      }
    };

    fetchRechargePlans();
  }, []);

  /* ===============================
     INR → COIN MAPPING STATE
  =============================== */
  const [coinRate, setCoinRate] = useState("");

  /* ===============================
     GET COIN MAPPING
  =============================== */
  useEffect(() => {
    const fetchCoinMapping = async () => {
      try {
        const res = await axios.get(
          "https://chat-app-1-qvl9.onrender.com/api/get-coin-mapping"
        );

        if (res.data?.rate) {
          setCoinRate(res.data.rate);
        }
      } catch (error) {
        console.error("Failed to fetch coin mapping", error);
      }
    };

    fetchCoinMapping();
  }, []);

  /* ===============================
     UPDATE COIN MAPPING
  =============================== */
  const updateCoinMapping = async () => {
    if (!coinRate) return alert("Please enter coin rate");

    try {
      const res = await axios.post("https://chat-app-1-qvl9.onrender.com/api/coin-mapping", {
        rate: Number(coinRate),
      });

      alert(res.data?.message || "Coin mapping updated");
    } catch (error) {
      console.error("Failed to update coin mapping", error);
    }
  };

  // Delete plan
  const handleDeletePlan = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await axios.delete(
        `https://chat-app-1-qvl9.onrender.com/api/delete-recharge-plan/${id}`
      );

      // Remove from UI instantly
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete plan", error);
      alert("Failed to delete plan");
    }
  };

  return (
    <div className="p-8 w-full bg-[#f8f9fc] overflow-y-auto h-screen min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Coin Wallet & Recharge</h1>
      <p className="text-gray-500 mb-6">/ Coin Management</p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        {/* RECHARGE PLANS */}
        <div className="bg-white p-6 shadow-md rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recharge Plans</h2>
            <button
              onClick={() => setOpenModal("addPlan")}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
            >
              <Plus size={18} /> Add Plan
            </button>
          </div>

          <div className="space-y-3">
            {plans.length === 0 && (
              <p className="text-gray-400 text-sm">No plans available</p>
            )}

            {plans.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center p-4 rounded-xl border bg-purple-50 hover:bg-purple-100 duration-150"
              >
                {/* LEFT INFO */}
                <div>
                  <p className="font-semibold">
                    ₹{p.amount} →{" "}
                    <span className="text-purple-700">
                      {p.totalCoins ?? p.coins + p.bonusCoins} Coins
                    </span>
                  </p>
                  <p className="text-sm text-green-600">
                    Bonus: {p.bonusCoins} coins
                  </p>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex gap-2">
                  {/* EDIT */}
                  <button
                    onClick={() => {
                      setSelectedPlan(p); // optional
                      setOpenModal("editPlan");
                    }}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    ✏️
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDeletePlan(p._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INR TO COIN MAPPING */}
        <div className="bg-white p-6 shadow-md rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">INR → Coin Mapping</h2>

          <div className="flex items-center gap-3 mb-4">
            <IndianRupee className="text-purple-600" />
            <input
              type="number"
              value={coinRate}
              onChange={(e) => setCoinRate(e.target.value)}
              placeholder="1 INR equals how many coins?"
              className="border p-2 rounded-xl w-full"
            />
          </div>

          <button
            onClick={updateCoinMapping}
            className="w-full bg-purple-600 text-white py-2 rounded-xl"
          >
            Update Mapping
          </button>
        </div>

        {/* MANUAL COIN CONTROL */}
        <div className="bg-white p-6 shadow-md rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Manual Coin Update</h2>

          <input
            type="text"
            placeholder="Enter User Email"
            className="border p-2 w-full rounded-xl mb-3"
          />

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-600 text-white flex items-center justify-center gap-2 py-2 rounded-xl">
              <Coins size={18} /> Add Coins
            </button>
            <button className="bg-red-600 text-white flex items-center justify-center gap-2 py-2 rounded-xl">
              <Minus size={18} /> Deduct Coins
            </button>
          </div>
        </div>
      </div>

      {openModal === "addPlan" && (
        <ModalComponent title="" onClose={() => setOpenModal(null)}>
          <AddPlanModal onClose={() => setOpenModal(null)} />
        </ModalComponent>
      )}
    </div>
  );
}
