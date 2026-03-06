import { useNavigate } from "react-router-dom";

const Navbar = ({ totalBalance = 0, profileImage = null }) => {
  const navigate   = useNavigate();
  const isPositive = totalBalance >= 0;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
      style={{
        background:           "rgba(13,13,18,0.80)",
        backdropFilter:       "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom:         "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Left: App branding ──────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/settings")}
        className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          K
        </div>
        <span className="text-sm font-bold text-white hidden sm:inline tracking-tight">
          Karazdar
        </span>
      </button>

      {/* ── Center: Balance ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">
          Total Balance
        </p>
        <p
          className="text-xl font-black leading-tight"
          style={{ color: isPositive ? "#22C55E" : "#F43F5E" }}
        >
          {isPositive ? "" : "−"}₹
          {Math.abs(totalBalance).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* ── Right: Avatar ───────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/settings")}
        className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center active:opacity-70 transition-opacity"
        style={{
          background:  profileImage ? "transparent" : "linear-gradient(135deg, #34D399, #22C55E)",
          border:      "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-black text-white">M</span>
        )}
      </button>
    </div>
  );
};

export default Navbar;