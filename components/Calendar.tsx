"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type CalendarProps =
  | {
      mode: "select";
      selected: Set<string>;
      onToggle: (dateStr: string) => void;
    }
  | {
      mode: "heatmap";
      heatmap: Map<string, number>;
      maxCount: number;
    };

export default function Calendar(props: CalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="select-none">
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = toDateStr(year, month, day);

          if (props.mode === "select") {
            const selected = props.selected.has(dateStr);
            return (
              <button
                key={dateStr}
                onClick={() => props.onToggle(dateStr)}
                className={cn(
                  "calendar-cell mx-auto w-9 h-9 rounded-full text-sm font-medium transition flex items-center justify-center",
                  selected
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-50"
                )}
              >
                {day}
              </button>
            );
          }

          // heatmap mode
          const count = props.heatmap.get(dateStr) ?? 0;
          const intensity = props.maxCount > 0 ? count / props.maxCount : 0;
          const bg =
            count === 0
              ? "bg-gray-100 text-gray-400"
              : intensity < 0.25
              ? "bg-blue-100 text-blue-800"
              : intensity < 0.5
              ? "bg-blue-300 text-blue-900"
              : intensity < 0.75
              ? "bg-blue-500 text-white"
              : "bg-blue-700 text-white";

          return (
            <div
              key={dateStr}
              title={count > 0 ? `${count} person${count > 1 ? "s" : ""}` : undefined}
              className={cn(
                "calendar-cell mx-auto w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center",
                bg
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
