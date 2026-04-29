"use client";

import { useState } from "react";
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
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="text-xs text-blue-500 hover:text-blue-700 transition truncate"
                title="Copy link"
              >
                📋 Copy invite link
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
