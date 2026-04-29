"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";
import AvailabilityTab from "./AvailabilityTab";
import OverlapTab from "./OverlapTab";
import SpinnerTab from "./SpinnerTab";

type AvailableDate = { id: number; submissionId: number; date: string };
type Submission = { id: number; tripId: number; createdAt: Date; dates: AvailableDate[] };
type DestinationOption = { id: number; tripId: number; label: string; createdAt: Date };
type Trip = {
  id: number;
  slug: string;
  name: string;
  createdAt: Date;
  submissions: Submission[];
  destinations: DestinationOption[];
};

const TABS = ["availability", "overlap", "spinner"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  availability: "My Dates",
  overlap: "Group Overlap",
  spinner: "Spinner",
};

export default function TripPageClient({ trip }: { trip: Trip }) {
  const [activeTab, setActiveTab] = useState<Tab>("availability");
  const [submissions, setSubmissions] = useState(trip.submissions);
  const [destinations, setDestinations] = useState(trip.destinations);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 leading-tight">
                {trip.name}
              </h1>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                  copied ? "text-green-600" : "text-blue-500 hover:text-blue-700"
                }`}
                title="Copy invite link"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Link copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy invite link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 flex gap-1 border-t border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold transition border-b-2 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {activeTab === "availability" && (
          <AvailabilityTab
            tripId={trip.id}
            onSubmitted={(s) => setSubmissions((prev) => [...prev, s])}
          />
        )}
        {activeTab === "overlap" && <OverlapTab submissions={submissions} />}
        {activeTab === "spinner" && (
          <SpinnerTab
            tripId={trip.id}
            initialDestinations={destinations}
            onDestinationsChange={setDestinations}
          />
        )}
      </div>
    </div>
  );
}
