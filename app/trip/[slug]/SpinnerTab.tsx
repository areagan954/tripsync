"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { addDestination, deleteDestination } from "@/app/actions";

type Destination = { id: number; tripId: number; label: string; createdAt: Date };

const COLORS = [
  "#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981",
  "#ef4444","#06b6d4","#f97316","#14b8a6","#a855f7",
];

function WheelSVG({
  options,
  rotation,
}: {
  options: Destination[];
  rotation: number;
}) {
  const n = options.length;
  if (n === 0) return null;

  const cx = 150;
  const cy = 150;
  const r = 140;
  const sliceAngle = 360 / n;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function slicePath(i: number) {
    const start = i * sliceAngle;
    const end = start + sliceAngle;
    const p1 = polarToCartesian(cx, cy, r, start);
    const p2 = polarToCartesian(cx, cy, r, end);
    const large = sliceAngle > 180 ? 1 : 0;
    return [
      `M ${cx} ${cy}`,
      `L ${p1.x} ${p1.y}`,
      `A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`,
      "Z",
    ].join(" ");
  }

  function textPosition(i: number) {
    const mid = i * sliceAngle + sliceAngle / 2;
    return polarToCartesian(cx, cy, r * 0.62, mid);
  }

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto drop-shadow-lg">
      <g
        transform={`rotate(${rotation}, ${cx}, ${cy})`}
        style={{ transition: "transform 0s" }}
      >
        {options.map((opt, i) => {
          const tp = textPosition(i);
          const mid = i * sliceAngle + sliceAngle / 2;
          return (
            <g key={opt.id}>
              <path d={slicePath(i)} fill={COLORS[i % COLORS.length]} />
              <text
                x={tp.x}
                y={tp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid}, ${tp.x}, ${tp.y})`}
                fill="white"
                fontSize={n <= 4 ? 14 : n <= 6 ? 11 : 9}
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {opt.label.length > 10 ? opt.label.slice(0, 9) + "…" : opt.label}
              </text>
            </g>
          );
        })}
      </g>
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={18} fill="white" />
      {/* Pointer */}
      <polygon
        points={`${cx - 10},8 ${cx + 10},8 ${cx},32`}
        fill="#1e293b"
      />
    </svg>
  );
}

export default function SpinnerTab({
  tripId,
  initialDestinations,
  onDestinationsChange,
}: {
  tripId: number;
  initialDestinations: Destination[];
  onDestinationsChange: (d: Destination[]) => void;
}) {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const currentRotation = useRef(0);
  const wheelRef = useRef<SVGGElement | null>(null);

  function updateDests(next: Destination[]) {
    setDestinations(next);
    onDestinationsChange(next);
  }

  async function handleAdd() {
    if (!input.trim()) return;
    setAdding(true);
    try {
      const dest = await addDestination(tripId, input.trim());
      const full: Destination = { ...dest, tripId, createdAt: new Date() };
      updateDests([...destinations, full]);
      setInput("");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteDestination(id);
    updateDests(destinations.filter((d) => d.id !== id));
    if (winner) setWinner(null);
  }

  function handleSpin() {
    if (spinning || destinations.length < 2) return;
    setWinner(null);
    setSpinning(true);

    const n = destinations.length;
    const sliceAngle = 360 / n;
    const winnerIdx = Math.floor(Math.random() * n);

    // After rotating the wheel by R degrees clockwise, the pointer (at top)
    // points at wheel-angle (360 - R) % 360. We want it to point at winnerMid.
    // So we need: R % 360 === (360 - winnerMid) % 360
    const winnerMid = winnerIdx * sliceAngle + sliceAngle / 2;
    const targetMod = (360 - winnerMid + 360) % 360;

    // Compute delta from current position to target, always moving forward
    const currentMod = currentRotation.current % 360;
    let delta = (targetMod - currentMod + 360) % 360;
    if (delta < 5) delta += 360; // ensure visible movement if already near target

    const bonusSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const newRotation = currentRotation.current + bonusSpins + delta;
    currentRotation.current = newRotation;

    // Apply via CSS transition on the SVG g element
    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 3.2s cubic-bezier(0.17, 0.67, 0.12, 1)";
      wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
      wheelRef.current.style.transformOrigin = "150px 150px";
    }

    setTimeout(() => {
      setSpinning(false);
      setWinner(destinations[winnerIdx].label);
      if (wheelRef.current) {
        wheelRef.current.style.transition = "none";
      }
    }, 3300);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Destination spinner</h2>
        <p className="text-sm text-gray-500 mt-1">Add options and spin to decide!</p>
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a destination…"
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || adding}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 transition hover:bg-blue-700"
        >
          {adding ? "…" : "Add"}
        </button>
      </div>

      {/* Destination list */}
      {destinations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {destinations.map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 text-sm text-gray-800">{d.label}</span>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-gray-400 hover:text-red-500 transition"
                aria-label={`Remove ${d.label}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Wheel */}
      {destinations.length >= 2 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-xs mx-auto drop-shadow-lg"
            >
              <g
                ref={wheelRef}
                style={{ transformOrigin: "150px 150px" }}
              >
                {destinations.map((opt, i) => {
                  const n = destinations.length;
                  const sliceAngle = 360 / n;

                  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
                    const rad = ((angleDeg - 90) * Math.PI) / 180;
                    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
                  }

                  const cx = 150, cy = 150, r = 140;
                  const start = i * sliceAngle;
                  const end = start + sliceAngle;
                  const p1 = polarToCartesian(cx, cy, r, start);
                  const p2 = polarToCartesian(cx, cy, r, end);
                  const large = sliceAngle > 180 ? 1 : 0;
                  const d = [
                    `M ${cx} ${cy}`,
                    `L ${p1.x} ${p1.y}`,
                    `A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`,
                    "Z",
                  ].join(" ");
                  const mid = start + sliceAngle / 2;
                  const tp = polarToCartesian(cx, cy, r * 0.62, mid);

                  return (
                    <g key={opt.id}>
                      <path d={d} fill={COLORS[i % COLORS.length]} />
                      <text
                        x={tp.x}
                        y={tp.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${mid}, ${tp.x}, ${tp.y})`}
                        fill="white"
                        fontSize={n <= 4 ? 14 : n <= 6 ? 11 : 9}
                        fontWeight="600"
                        fontFamily="system-ui, sans-serif"
                      >
                        {opt.label.length > 10 ? opt.label.slice(0, 9) + "…" : opt.label}
                      </text>
                    </g>
                  );
                })}
              </g>
              <circle cx={150} cy={150} r={18} fill="white" />
              <polygon points="140,6 160,6 150,30" fill="#1e293b" />
            </svg>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {spinning ? "Spinning…" : "🎯 Spin!"}
          </button>

          {winner && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center py-6 px-4 space-y-1 shadow-lg">
              <p className="text-sm font-medium opacity-80">We&apos;re going to</p>
              <p className="text-3xl font-extrabold">{winner} 🎉</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 space-y-2">
          <div className="text-4xl">🎡</div>
          <p className="font-medium">Add at least 2 destinations</p>
          <p className="text-sm">Then spin to let fate decide.</p>
        </div>
      )}
    </div>
  );
}
