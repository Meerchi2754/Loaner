import React, { useState } from "react";
import BottomNav from "../component/BottomNav";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { jsPDF } from "jspdf";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";

// ── icons (inline SVG so no extra dep) ──────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  pdf:    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z",
  json:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  reset:  "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5",
  chevron:"M9 18l6-6-6-6",
  warn:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  check:  "M20 6L9 17l-5-5",
};

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);

// ── Reusable card ────────────────────────────────────────────────────────────
function SettingCard({ icon, iconColor = "#60A5FA", title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-[#1C1C1E] border border-white/8 overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconColor + "22" }}>
          <Icon d={icon} size={18} color={iconColor} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ── Primary button ───────────────────────────────────────────────────────────
function Btn({ onClick, color = "#3B82F6", children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);

  const currentMonth  = new Date().getMonth();
  const currentYear   = new Date().getFullYear();

  const [showResetModal,    setShowResetModal]    = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMonth,     setSelectedMonth]     = useState("");
  const [exporting,         setExporting]         = useState(false);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportToPDF = async () => {
    if (!selectedMonth) { toast.error("Please select a month."); return; }

    const monthIdx    = Number(selectedMonth) - 1;
    const monthName   = MONTHS[monthIdx];
    let   filtered    = [];

    if (monthIdx === currentMonth) {
      filtered = (transactions ?? []).filter((tx) => {
        const d = new Date(tx.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else {
      try {
        const res = await fetch(`/Data/${currentYear}-${String(selectedMonth).padStart(2,"0")}.json`);
        if (!res.ok) throw new Error();
        filtered = await res.json();
      } catch {
        toast.error("No data found for that month.");
        return;
      }
    }

    if (!filtered.length) { toast.error(`No transactions for ${monthName}.`); return; }

    const doc = new jsPDF();
    doc.setFontSize(8);
    doc.text(`Transaction History — ${monthName} ${currentYear}`, 10, 10);
    let y = 20;
    filtered.forEach((tx, i) => {
      doc.text(
        `${i+1}) ${tx.type}: ${tx.date} - ${tx.subcategories || "N/A"} - Rs.${tx.amount}`,
        10, y
      );
      y += 10;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    doc.save(`${monthName}_Hisab.pdf`);
    toast.success(`Exported ${monthName} to PDF!`);
    setIsExportModalOpen(false);
  };

  // ── Export JSON — APK-safe ─────────────────────────────────────────────────
  // Strategy:
  //   1. Try Web Share API  → works natively on Android WebView
  //   2. Fall back to data: URI anchor click (works on desktop / some browsers)
  const exportToJSON = async () => {
    if (!transactions?.length) { toast.error("No transactions to export."); return; }

    setExporting(true);
    try {
      const now       = new Date();
      const fileName  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}.json`;
      const jsonStr   = JSON.stringify(transactions, null, 2);

      // ── Path 1: Web Share API (Android WebView friendly) ──────────────────
      if (navigator.canShare) {
        const file = new File([jsonStr], fileName, { type: "application/json" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title:  "Hisab Transactions",
            text:   `Transaction backup — ${fileName}`,
            files:  [file],
          });
          toast.success("Shared successfully!");
          setExporting(false);
          return;
        }
      }

      // ── Path 2: data: URI fallback (desktop / browsers without share) ─────
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
      const a       = document.createElement("a");
      a.href        = dataUri;
      a.download    = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started!");
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        toast.error("Export failed. Try on desktop.");
      }
    } finally {
      setExporting(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleResetTransactions = async () => {
    await db.transactions.clear();
    toast.success("All transactions reset!");
    setShowResetModal(false);
    navigate("/home");
  };

  const txCount = transactions?.length ?? 0;

  return (
    <>
      <div className="min-h-screen bg-[#121212] text-white px-4 pt-8 pb-28 space-y-4">

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 bg-[#1C1C1E] border border-white/8 rounded-2xl p-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500
                          flex items-center justify-center text-2xl font-black text-white shadow-lg">
            M
          </div>
          <div>
            <p className="font-bold text-base">Meetraj Parmar</p>
            <p className="text-xs text-gray-500">meet@email.com</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-[10px] text-emerald-400">{txCount} transactions stored</span>
            </div>
          </div>
        </div>

        {/* ── Section label ────────────────────────────────────────────────── */}
        <p className="text-[10px] uppercase tracking-widest text-gray-600 px-1">Data Management</p>

        {/* ── Export PDF ───────────────────────────────────────────────────── */}
        <SettingCard
          icon={ICONS.pdf}
          iconColor="#F43F5E"
          title="Export to PDF"
          subtitle="Download monthly transaction history"
        >
          <Btn onClick={() => setIsExportModalOpen(true)} color="#F43F5E">
            Choose Month & Export
          </Btn>
        </SettingCard>

        {/* ── Export JSON ──────────────────────────────────────────────────── */}
        <SettingCard
          icon={ICONS.json}
          iconColor="#34D399"
          title="Backup as JSON"
          subtitle="Share or save current month's data — works on phone too"
        >
          <Btn onClick={exportToJSON} color="#34D399" disabled={exporting}>
            {exporting ? "Exporting…" : "Export / Share JSON"}
          </Btn>
          <p className="text-[10px] text-gray-600 mt-2 text-center">
            On Android, this opens the share sheet so you can save to Drive, WhatsApp, etc.
          </p>
        </SettingCard>

        {/* ── Reset ────────────────────────────────────────────────────────── */}
        <p className="text-[10px] uppercase tracking-widest text-gray-600 px-1 pt-2">Danger Zone</p>

        <SettingCard
          icon={ICONS.reset}
          iconColor="#F97316"
          title="Reset All Transactions"
          subtitle="Permanently deletes every transaction from this device"
        >
          <Btn onClick={() => setShowResetModal(true)} color="#F97316">
            Reset Database
          </Btn>
        </SettingCard>

      </div>

      {/* ── Reset confirm modal ───────────────────────────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResetModal(false)} />
          <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-xs z-10">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center">
                <Icon d={ICONS.warn} size={24} color="#F97316" />
              </div>
            </div>
            <h2 className="text-base font-bold text-center mb-1">Reset all data?</h2>
            <p className="text-xs text-gray-400 text-center mb-5">
              This will permanently delete all transactions from IndexedDB. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleResetTransactions}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-sm font-bold">
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Month picker modal ────────────────────────────────────────────── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)} />
          <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-xs z-10">
            <h2 className="text-base font-bold text-center mb-4">Select Month</h2>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {MONTHS.map((name, i) => {
                const val = String(i + 1);
                const active = selectedMonth === val;
                return (
                  <button key={val} onClick={() => setSelectedMonth(val)}
                    className="py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: active ? "#F43F5E" : "rgba(255,255,255,0.06)",
                      color: active ? "#fff" : "#9CA3AF",
                    }}>
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsExportModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm font-semibold">
                Cancel
              </button>
              <button onClick={handleExportToPDF}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-sm font-bold">
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}