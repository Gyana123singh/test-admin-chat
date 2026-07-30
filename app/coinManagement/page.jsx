"use client";

import { useState, useEffect } from "react";
import instanceApi from "../utils/api/axiosConfig";
import { Plus, IndianRupee, Coins, Minus, RefreshCw } from "lucide-react";
import AddPlanModal from "../components/modal/AddPlanModal";
import ModalComponent from "../components/modal/ModalComponents";

export default function CoinManagement() {
  const [openModal, setOpenModal] = useState(null);

  const [email, setEmail] = useState("");
  const [coins, setCoins] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  /* ===============================
     RECHARGE PLANS (FROM BACKEND)
  =============================== */
  const [plans, setPlans] = useState([]);

  /* ===============================
     GET RECHARGE PLANS API
  =============================== */
  const fetchRechargePlans = async () => {
    try {
      const res = await instanceApi.get("/api/get-recharge-plans");
      if (res.data?.success) {
        setPlans(res.data.plans || []);
      }
    } catch (error) {
      console.error("Failed to fetch recharge plans", error);
    }
  };

  useEffect(() => {
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
        const res = await instanceApi.get("/api/get-coin-mapping");
        if (res.data?.rate !== undefined) {
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
    if (!coinRate || Number(coinRate) <= 0) return alert("Please enter a valid coin rate");

    try {
      const res = await instanceApi.post("/api/coin-mapping", {
        rate: Number(coinRate),
      });

      alert(res.data?.message || "INR → Coin mapping updated successfully");
    } catch (error) {
      console.error("Failed to update coin mapping", error);
      alert(error?.response?.data?.message || "Failed to update coin mapping");
    }
  };

  // Delete plan
  const handleDeletePlan = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await instanceApi.delete(`/api/delete-recharge-plan/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      alert("Recharge plan deleted successfully");
    } catch (error) {
      console.error("Failed to delete plan", error);
      alert(error?.response?.data?.message || "Failed to delete plan");
    }
  };

  /* ===============================
     MANUAL COIN UPDATE (ADD & DEDUCT)
  =============================== */

  const addCoins = async () => {
    const trimmedInput = email.trim();
    if (!trimmedInput) return alert("Please enter User Email, Phone, Username or User ID");
    if (!coins || Number(coins) <= 0) return alert("Please enter a valid positive coin amount");

    try {
      setActionLoading(true);
      const res = await instanceApi.post("/api/add-coins", {
        email: trimmedInput,
        coins: Number(coins),
      });

      alert(res.data?.message || "Coins added successfully");
      setCoins("");
    } catch (error) {
      console.error("Add coins failed", error);
      alert(error?.response?.data?.message || "Failed to add coins to user");
    } finally {
      setActionLoading(false);
    }
  };

  const deductCoins = async () => {
    const trimmedInput = email.trim();
    if (!trimmedInput) return alert("Please enter User Email, Phone, Username or User ID");
    if (!coins || Number(coins) <= 0) return alert("Please enter a valid positive coin amount");

    try {
      setActionLoading(true);
      const res = await instanceApi.post("/api/deduct-coins", {
        email: trimmedInput,
        coins: Number(coins),
      });

      alert(res.data?.message || "Coins deducted successfully");
      setCoins("");
    } catch (error) {
      console.error("Deduct coins failed", error);
      alert(error?.response?.data?.message || "Failed to deduct coins from user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full bg-[#f8f9fc] min-h-screen">
      <h1 className="text-3xl font-bold mb-1 text-gray-900">Coin Wallet & Recharge</h1>
      <p className="text-gray-500 mb-6 text-sm">/ Coin Management</p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        {/* RECHARGE PLANS */}
        <div className="bg-white p-6 shadow-md rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recharge Plans</h2>

            <button
              onClick={() => setOpenModal("addPlan")}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 font-medium text-sm transition cursor-pointer"
            >
              <Plus size={18} /> Add Plan
            </button>
          </div>

          <div className="space-y-3">
            {plans.length === 0 && (
              <p className="text-gray-400 text-sm py-4 text-center">No active plans available</p>
            )}

            {plans.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/50 transition duration-150"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    ₹{p.amount} →{" "}
                    <span className="text-purple-700 font-bold">
                      {(p.totalCoins ?? (p.coins + p.bonusCoins)).toLocaleString()} Coins
                    </span>
                  </p>

                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                    Bonus: {p.bonusCoins} coins
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeletePlan(p._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                    title="Delete Plan"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INR TO COIN MAPPING */}
        <div className="bg-white p-6 shadow-md rounded-2xl border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">INR → Coin Mapping</h2>

          <div className="flex items-center gap-3 mb-4">
            <IndianRupee className="text-purple-600 shrink-0" />

            <input
              type="number"
              value={coinRate}
              onChange={(e) => setCoinRate(e.target.value)}
              placeholder="1 INR equals how many coins?"
              className="border border-gray-300 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <button
            onClick={updateCoinMapping}
            className="w-full bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition cursor-pointer text-sm"
          >
            Update Mapping
          </button>
        </div>

        {/* MANUAL COIN CONTROL */}
        <div className="bg-white p-6 shadow-md rounded-2xl border border-gray-100">
          <h2 className="text-xl font-semibold mb-1 text-gray-900">Manual Coin Update</h2>
          <p className="text-xs text-gray-500 mb-4">
            Directly credit or debit coins from any user account by Email, Username, Phone or User ID.
          </p>

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">User Identifier</label>
              <input
                type="text"
                placeholder="Enter User Email, Username, Phone or ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-2.5 w-full rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Coins Amount</label>
              <input
                type="number"
                placeholder="Enter Coins to Add/Deduct"
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
                className="border border-gray-300 p-2.5 w-full rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              disabled={actionLoading}
              onClick={addCoins}
              className="bg-emerald-600 text-white flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl hover:bg-emerald-700 font-semibold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Coins size={16} />}
              <span>Add Coins</span>
            </button>

            <button
              disabled={actionLoading}
              onClick={deductCoins}
              className="bg-rose-600 text-white flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl hover:bg-rose-700 font-semibold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Minus size={16} />}
              <span>Deduct Coins</span>
            </button>
          </div>
        </div>
      </div>

      {openModal === "addPlan" && (
        <ModalComponent title="" onClose={() => setOpenModal(null)}>
          <AddPlanModal
            onClose={() => {
              setOpenModal(null);
              fetchRechargePlans();
            }}
          />
        </ModalComponent>
      )}
    </div>
  );
}
