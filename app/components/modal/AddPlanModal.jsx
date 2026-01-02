"use client";

import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function AddPlanModal({ onClose }) {
  const [amount, setAmount] = useState("");
  const [coins, setCoins] = useState("");
  const [bonus, setBonus] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===============================
     CALCULATE COINS (BACKEND)
  =============================== */
  const calculateCoins = async (inrValue) => {
    if (!inrValue || inrValue <= 0) {
      setCoins("");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/calculate-coins`, {
        amountINR: Number(inrValue),
      });

      setCoins(res.data.coins);
    } catch (error) {
      console.error("Failed to calculate coins", error);
      setCoins("");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     SUBMIT PLAN → SAVE TO DB
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount) {
      return alert("Amount is required");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/recharge-plan`, {
        amount: Number(amount),
        bonusCoins: Number(bonus || 0),
      });

      alert("Recharge plan created successfully");

      console.log("Saved Plan:", res.data.plan);

      onClose(); // close modal after success
    } catch (error) {
      console.error("Failed to add plan", error);
      alert(
        error?.response?.data?.message || "Failed to create recharge plan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Recharge Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* INR */}
          <div>
            <label className="text-sm font-medium">Amount (INR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                calculateCoins(e.target.value);
              }}
              required
              className="w-full mt-1 border p-2 rounded-xl"
              placeholder="100"
            />
          </div>

          {/* Coins (AUTO) */}
          <div>
            <label className="text-sm font-medium">Coins</label>
            <input
              type="number"
              value={coins}
              readOnly
              className="w-full mt-1 border p-2 rounded-xl bg-gray-100"
              placeholder={loading ? "Calculating..." : "Auto calculated"}
            />
          </div>

          {/* Bonus */}
          <div>
            <label className="text-sm font-medium">Bonus Coins</label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="w-full mt-1 border p-2 rounded-xl"
              placeholder="50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
