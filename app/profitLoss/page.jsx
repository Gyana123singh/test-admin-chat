"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, Save, RefreshCw, HelpCircle, Coins, Percent } from "lucide-react";

export default function ProfitLossManagement() {
  const [minCoinsRequired, setMinCoinsRequired] = useState(5000);
  const [outcomes, setOutcomes] = useState([
    { type: "big_profit", chance: 20, percent: 30 },
    { type: "profit", chance: 20, percent: 10 },
    { type: "neutral", chance: 20, percent: 0 },
    { type: "loss", chance: 25, percent: -10 },
    { type: "big_loss", chance: 15, percent: -25 },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch P&L configurations from API
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun";
      const res = await axios.get(`${apiURL}/api/profit-loss-config`);
      if (res.data?.success && res.data?.data) {
        const { minCoinsRequired, outcomes } = res.data.data;
        setMinCoinsRequired(minCoinsRequired);
        // Ensure standard ordering or order from backend
        setOutcomes(outcomes);
      }
    } catch (error) {
      console.error("Failed to fetch P&L settings", error);
      alert("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Calculate sum of chances
  const totalChance = outcomes.reduce((sum, item) => sum + Number(item.chance || 0), 0);
  const isChanceSumValid = totalChance === 100;

  // Handle chance change
  const handleChanceChange = (index, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index].chance = Number(value);
    setOutcomes(newOutcomes);
  };

  // Handle percent multiplier change
  const handlePercentChange = (index, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index].percent = Number(value);
    setOutcomes(newOutcomes);
  };

  // Save changes to API
  const handleSave = async () => {
    if (!isChanceSumValid) {
      alert(`The sum of chances must be exactly 100%. Currently it is ${totalChance}%.`);
      return;
    }

    setSaving(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun";
      const res = await axios.post(`${apiURL}/api/profit-loss-config`, {
        outcomes,
        minCoinsRequired: Number(minCoinsRequired),
      });

      if (res.data?.success) {
        alert("Settings saved successfully!");
      } else {
        alert(res.data?.message || "Failed to save settings.");
      }
    } catch (error) {
      console.error("Failed to save configuration", error);
      alert(error.response?.data?.message || "Server error saving configuration");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    if (confirm("Reset values to defaults? (Your changes won't be saved until you click Save)")) {
      setMinCoinsRequired(5000);
      setOutcomes([
        { type: "big_profit", chance: 20, percent: 30 },
        { type: "profit", chance: 20, percent: 10 },
        { type: "neutral", chance: 20, percent: 0 },
        { type: "loss", chance: 25, percent: -10 },
        { type: "big_loss", chance: 15, percent: -25 },
      ]);
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case "big_profit": return "🔥 Big Profit";
      case "profit": return "📈 Profit";
      case "neutral": return "⚖️ Neutral";
      case "loss": return "📉 Loss";
      case "big_loss": return "💥 Big Loss";
      default: return type;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "big_profit": return "bg-green-50 border-green-200 text-green-700";
      case "profit": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "neutral": return "bg-gray-50 border-gray-200 text-gray-700";
      case "loss": return "bg-orange-50 border-orange-200 text-orange-700";
      case "big_loss": return "bg-red-50 border-red-200 text-red-700";
      default: return "bg-blue-50";
    }
  };

  if (loading) {
    return (
      <div className="p-8 w-full bg-[#f8f9fc] h-screen flex flex-col justify-center items-center">
        <RefreshCw className="animate-spin text-purple-600 mb-2" size={40} />
        <p className="text-gray-500 font-medium">Loading Profit & Loss configurations...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full bg-[#f8f9fc] min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-800">Luck Engine Configuration</h1>
          <p className="text-gray-500 text-xs sm:text-sm">/ Profit & Loss Settings</p>
        </div>
        
        <div className="flex items-center gap-2.5 mt-2 md:mt-0">
          <button
            onClick={handleResetDefaults}
            className="flex items-center justify-center gap-1.5 border border-gray-300 bg-white text-gray-700 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer"
          >
            Reset Defaults
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !isChanceSumValid}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white font-semibold text-xs sm:text-sm whitespace-nowrap transition shadow-sm cursor-pointer ${
              !isChanceSumValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* CHANCES SUM ERROR ALERT */}
      {!isChanceSumValid && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-red-700">
          <AlertTriangle className="flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Validation Error</h4>
            <p className="text-sm">
              The sum of the chances for all outcomes must equal exactly <strong>100%</strong>. 
              Currently, it is <strong>{totalChance}%</strong>. Please adjust the chance sliders below to save your changes.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* GENERAL SETTINGS CARD */}
        <div className="xl:col-span-1 bg-white p-6 shadow-md rounded-2xl h-fit border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="text-purple-600" size={22} />
            <h2 className="text-xl font-bold text-gray-800">General Rules</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-1.5">
              Minimum Coins spent
              <span className="group relative cursor-pointer text-gray-400 hover:text-purple-600">
                <HelpCircle size={16} />
                <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white text-xs rounded-lg w-64 shadow-lg z-30">
                  Minimum total cost of a sent gift (e.g. price * comboCount) required to trigger the P&L roll.
                </span>
              </span>
            </label>
            <input
              type="number"
              value={minCoinsRequired}
              onChange={(e) => setMinCoinsRequired(e.target.value)}
              placeholder="e.g. 5000"
              className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Gifts costing fewer coins will always yield 0 coins (Neutral result).
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-1.5">
              <Percent size={16} /> Total Probabilities
            </h3>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600">Configured Chance Sum:</span>
              <span className={`font-bold ${isChanceSumValid ? "text-green-600" : "text-red-600"}`}>
                {totalChance}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full duration-300 ${isChanceSumValid ? "bg-green-600" : "bg-red-500"}`} 
                style={{ width: `${Math.min(totalChance, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* OUTCOMES CHANCES AND PERCENTAGES CARD */}
        <div className="xl:col-span-2 bg-white p-6 shadow-md rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🎛️ Probability & Return Multipliers
          </h2>

          <div className="space-y-6">
            {outcomes.map((item, index) => (
              <div key={item.type} className={`border rounded-2xl p-5 ${getBgColor(item.type)}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-[150px]">
                    <span className="font-bold text-lg">{getLabel(item.type)}</span>
                  </div>

                  {/* SLIDER CHANCE CONTROL */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span className="text-gray-500">Roll Probability:</span>
                      <span className="font-bold">{item.chance}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={item.chance}
                        onChange={(e) => handleChanceChange(index, e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.chance}
                        onChange={(e) => handleChanceChange(index, e.target.value)}
                        className="border rounded-lg p-1 w-16 text-center text-sm text-gray-700 bg-white"
                      />
                    </div>
                  </div>

                  {/* MULTIPLIER PERCENT CONTROL */}
                  <div className="md:w-48">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span className="text-gray-500">Coin Return %:</span>
                      <span className={`font-bold ${item.percent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.percent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.percent}
                        onChange={(e) => handlePercentChange(index, e.target.value)}
                        placeholder="e.g. 30"
                        className="border rounded-lg p-2 w-full text-center text-sm text-gray-700 bg-white"
                      />
                      <span className="text-gray-500 text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
