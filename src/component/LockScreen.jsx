import { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const NUMPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

const LockScreen = () => {
  const [pin,       setPin]       = useState([]);
  const [shake,     setShake]     = useState(false);
  const navigate  = useNavigate();
  const userPin   = useSelector((state) => state.user.password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => { setShake(false); setPin([]); }, 600);
  };

  const handleKey = (key) => {
    if (key === "") return;

    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }

    if (pin.length >= 4) return;

    const newPin = [...pin, key];
    setPin(newPin);

    // Auto-check when 4 digits entered
    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin.join("") === userPin) {
          navigate("/home");
        } else {
          toast.error("Incorrect PIN");
          triggerShake();
        }
      }, 120);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 select-none relative overflow-hidden"
      style={{ background: "#0a0a12" }}>

      {/* ── Animated gradient mesh ───────────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div style={{
          position:"absolute", top:"-10%", left:"-15%",
          width:"65vw", height:"65vw", borderRadius:"50%",
          background:"radial-gradient(circle, #3B82F6 0%, transparent 70%)",
          opacity:0.20, filter:"blur(48px)",
          animation:"orb1 9s ease-in-out infinite alternate",
        }}/>
        <div style={{
          position:"absolute", top:"35%", right:"-20%",
          width:"55vw", height:"55vw", borderRadius:"50%",
          background:"radial-gradient(circle, #6366F1 0%, transparent 70%)",
          opacity:0.17, filter:"blur(52px)",
          animation:"orb2 11s ease-in-out infinite alternate",
        }}/>
        <div style={{
          position:"absolute", bottom:"5%", left:"15%",
          width:"45vw", height:"45vw", borderRadius:"50%",
          background:"radial-gradient(circle, #22C55E 0%, transparent 70%)",
          opacity:0.11, filter:"blur(44px)",
          animation:"orb3 13s ease-in-out infinite alternate",
        }}/>
      </div>

      {/* ── Top section ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-4 pt-8">

        {/* App icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h6v2h-6z" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">Hisab</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your PIN to continue</p>
        </div>
      </div>

      {/* ── PIN dots ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div
          className={`flex gap-4 transition-transform ${shake ? "animate-shake" : ""}`}
          style={shake ? { animation: "shake 0.5s ease" } : {}}
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length;
            return (
              <div key={i}
                className="w-4 h-4 rounded-full border-2 transition-all duration-150"
                style={{
                  backgroundColor: filled ? "#3B82F6" : "transparent",
                  borderColor:     filled ? "#3B82F6" : "#374151",
                  transform:       filled ? "scale(1.15)" : "scale(1)",
                  boxShadow:       filled ? "0 0 10px #3B82F688" : "none",
                }}
              />
            );
          })}
        </div>

        {/* ── Numpad ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 w-72">
          {NUMPAD.flat().map((key, idx) => {
            const isEmpty  = key === "";
            const isDelete = key === "⌫";
            return (
              <button
                key={idx}
                onClick={() => handleKey(key)}
                disabled={isEmpty}
                className="h-16 rounded-2xl text-xl font-bold transition-all active:scale-90 disabled:opacity-0"
                style={{
                  backgroundColor: isEmpty
                    ? "transparent"
                    : isDelete
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(255,255,255,0.06)",
                  color: isDelete ? "#F87171" : "#F9FAFB",
                  border: isEmpty ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom hint ──────────────────────────────────────────────────── */}
      <p className="relative z-10 text-gray-600 text-xs text-center">
        Your data stays on this device only
      </p>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }
        @keyframes orb1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8vw, 6vh) scale(1.15); }
        }
        @keyframes orb2 {
          0%   { transform: translate(0, 0) scale(1.05); }
          100% { transform: translate(-6vw, -8vh) scale(0.9); }
        }
        @keyframes orb3 {
          0%   { transform: translate(0, 0) scale(0.95); }
          100% { transform: translate(5vw, -5vh) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default LockScreen;