"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import { submitAvailability } from "@/app/actions";

type Submission = {
  id: number;
  tripId: number;
  createdAt: Date;
  dates: { id: number; submissionId: number; date: string }[];
};

export default function AvailabilityTab({
  tripId,
  onSubmitted,
}: {
  tripId: number;
  onSubmitted: (s: Submission) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  function toggle(dateStr: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      await submitAvailability(tripId, Array.from(selected));
      // optimistically build a fake submission for local state
      const fakeSubmission: Submission = {
        id: Date.now(),
        tripId,
        createdAt: new Date(),
        dates: Array.from(selected).map((date, i) => ({
          id: Date.now() + i,
          submissionId: Date.now(),
          date,
        })),
      };
      onSubmitted(fakeSubmission);
      setSelected(new Set());
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Add my availability</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tap dates to mark when you&apos;re available.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <Calendar mode="select" selected={selected} onToggle={toggle} />
      </div>

      {selected.size > 0 && (
        <p className="text-center text-sm text-gray-600">
          {selected.size} date{selected.size > 1 ? "s" : ""} selected
        </p>
      )}

      {confirmed && (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium text-center py-3">
          ✓ Availability saved! Someone else can submit now.
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selected.size === 0 || submitting}
        className="w-full rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {submitting ? "Saving…" : "Submit my availability"}
      </button>
    </div>
  );
}
