import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ENERGY_UTILITIES = {
    "Main Meter": "ENG-001",
    Generator: "ENG-002",
    Solar: "ENG-003",
    HVAC: "ENG-004",
};

const WATER_UTILITIES = {
    Borewell: "WTR-001",
    Municipal: "WTR-002",
    "RO Plant": "WTR-003",
    "Cooling Tower": "WTR-004",
};

export default function ManualEntry() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("energy");
    const [customUtility, setCustomUtility] = useState("");

    const utilities =
        activeTab === "energy" ? ENERGY_UTILITIES : WATER_UTILITIES;

    const [formData, setFormData] = useState({
        timestamp: "",
        zone: "",
        subUtility: "",
        utilityId: "",
        energy: "",
        water: "",
        temperature: "",
        humidity: "",
    });

    // Handle select change
    const handleUtilityChange = (value) => {
        setFormData({
            ...formData,
            subUtility: value,
            utilityId: utilities[value] || "CUSTOM",
        });
    };

    // Add custom sub-utility
    const addCustomUtility = () => {
        if (!customUtility) return;
        toast.success("Custom sub-utility added");
        handleUtilityChange(customUtility);
        setCustomUtility("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted Data:", { ...formData, type: activeTab });
        toast.success("Data submitted successfully");
    };

    return (
        <div
            className="min-h-screen p-8 text-white"
            style={{
                background:
                    "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)",
            }}
        >

            <div className="flex justify-end mb-1">
                <button
                    onClick={() => navigate("/homepage")}
                    className="px-4 py-2 rounded-lg text-white border border-white/30 
               hover:bg-white/10 transition-all backdrop-blur-md flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="white"
                        strokeWidth="2"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>


                    Go to Homepage
                </button>
            </div>

            {/* PAGE TITLE */}
            <div className="text-center mb-6 mt-2">
                <h1 className="text-4xl font-bold text-white tracking-wide">
                    Manual Data Entry
                </h1>
                <p className="text-gray-300 mt-2 text-lg">
                    Enter utility consumption data manually
                </p>
            </div>

            {/* Tabs */}
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                {["energy", "water"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl font-medium transition backdrop-blur-md border
        ${activeTab === tab
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                            }`}
                    >
                        {tab === "energy" ? "Energy" : "Water"}
                    </button>
                ))}
            </div>


            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="
  bg-white/10 backdrop-blur-xl
  border border-white/20
  rounded-2xl p-8 space-y-6 shadow-2xl
"
            >


                {/* Timestamp + Zone */}
                <div className="grid grid-cols-2 gap-6">
  <div>
    <label className="text-white/80 font-medium mb-1 block">
      Timestamp *
    </label>
    <input
      type="datetime-local"
      className="glass-input bg-transparent"
      onChange={(e) =>
        setFormData({ ...formData, timestamp: e.target.value })
      }
    />
  </div>

  <div>
    <label className="text-white/80 font-medium mb-1 block">
      Zone / Sector *
    </label>
    <select
      className="glass-input"
      onChange={(e) =>
        setFormData({ ...formData, zone: e.target.value })
      }
    >
      <option>Select zone</option>
      <option>Building A</option>
      <option>Building B</option>
      <option>Plant 1</option>
    </select>
  </div>
</div>


                {/* Sub-utility */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="font-medium">Sub-Utility Type *</label>
                        <select
                            className="glass-input"
                            value={formData.subUtility}
                            onChange={(e) => handleUtilityChange(e.target.value)}
                        >
                            <option>Select sub-utility</option>
                            {Object.keys(utilities).map((u) => (
                                <option key={u}>{u}</option>
                            ))}
                        </select>

                        {/* Add custom */}
                        <div className="flex gap-2 mt-2">
                            <input
                                className="glass-input"
                                placeholder="Add custom type"
                                value={customUtility}
                                onChange={(e) => setCustomUtility(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={addCustomUtility}
                                className="px-4 py-2 rounded-lg
               bg-white/20 text-white
               hover:bg-white/30 transition
               border border-white/30"
                            >
                                Add
                            </button>
                        </div>

                    </div>

                    <div>
                        <label className="font-medium">Utility ID</label>
                        <input
                            className="glass-input bg-white/5"
                            value={formData.utilityId}
                            readOnly
                        />
                    </div>
                </div>

                {/* Consumption */}
                <div className="grid grid-cols-2 gap-6">
                    {activeTab === "energy" ? (
                        <div>
                            <label className="font-medium">Energy Usage (kWh) *</label>
                            <input
                                className="glass-input"
                                type="number"
                                onChange={(e) =>
                                    setFormData({ ...formData, energy: e.target.value })
                                }
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="font-medium">Water Usage (L) *</label>
                            <input
                                className="glass-input"
                                type="number"
                                onChange={(e) =>
                                    setFormData({ ...formData, water: e.target.value })
                                }
                            />
                        </div>
                    )}

                    <div>
                        <label className="font-medium">Temperature (°C)</label>
                        <input
                            className="glass-input"
                            type="number"
                            onChange={(e) =>
                                setFormData({ ...formData, temperature: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Humidity */}
                <div>
                    <label className="font-medium">Humidity (%)</label>
                    <input
                        className="glass-input"
                        type="number"
                        onChange={(e) =>
                            setFormData({ ...formData, humidity: e.target.value })
                        }
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl font-semibold
               bg-gradient-to-r from-green-400 to-blue-500
               text-white hover:opacity-90 transition"
                    >
                        Submit Data
                    </button>

                    <button
                        type="reset"
                        className="px-6 py-3 rounded-xl
               bg-white/10 text-white
               border border-white/20
               hover:bg-white/20 transition"
                    >
                        Clear Form
                    </button>
                </div>

            </form>
        </div>
    );
}
