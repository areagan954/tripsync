import { createTrip } from "./actions";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Hero */}
        <div className="text-center space-y-2">
          <div className="text-5xl">✈️</div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            TripSync
          </h1>
          <p className="text-gray-500 text-sm">
            Coordinate travel dates with anyone — no accounts, no fuss.
          </p>
        </div>

        {/* Create trip card */}
        <div className="rounded-2xl bg-white shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Plan a new trip
          </h2>
          <form action={createTrip} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Trip name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Cabo with the crew"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition"
            >
              Create trip →
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          Create a new trip, then Copy invite link and share with your friends
        </p>
      </div>
    </div>
  );
}
