import React from "react";

interface JobCardProps {
  fileName: string;
  uploadedAt: string;
  validEmails: number;
  invalidEmails: number;
  unknownEmails: number;
  totalEmails: number;
  processingTime: string;
  speed: string;
  status: "COMPLETED" | "PROCESSING" | "FAILED";
}

export default function JobCard({
  fileName,
  uploadedAt,
  validEmails,
  invalidEmails,
  unknownEmails,
  totalEmails,
  processingTime,
  speed,
  status,
}: JobCardProps) {
  const validPercent = Math.round((validEmails / totalEmails) * 100);
  const invalidPercent = Math.round((invalidEmails / totalEmails) * 100);
  const unknownPercent = Math.round((unknownEmails / totalEmails) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9l-5-5H7a2 2 0 00-2 2v13a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {fileName}
            </h3>
            <p className="text-sm text-slate-500">Added on {uploadedAt}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition">
            Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition">
            Statistics
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
            Remove
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
        <div>
          <p className="text-slate-500 text-sm mb-1">Valid Emails</p>
          <p className="text-3xl font-bold text-green-600">
            {validEmails.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{validPercent}% of total</p>
        </div>
        <div>
          <p className="text-slate-500 text-sm mb-1">Invalid Emails</p>
          <p className="text-3xl font-bold text-red-500">
            {invalidEmails.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{invalidPercent}% of total</p>
        </div>
        <div>
          <p className="text-slate-500 text-sm mb-1">Unknown / Catch-all</p>
          <p className="text-3xl font-bold text-yellow-500">
            {unknownEmails.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{unknownPercent}% of total</p>
        </div>
        <div>
          <p className="text-slate-500 text-sm mb-1">Total Processed</p>
          <p className="text-3xl font-bold text-indigo-600">
            {totalEmails.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">100% completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-6 rounded-full h-6 bg-slate-100 overflow-hidden">
        <div
          className="h-6 bg-green-500 inline-block text-center text-white font-semibold text-sm leading-6"
          style={{ width: `${validPercent}%` }}
        >
          {validPercent > 10 ? `${validPercent}%` : ""}
        </div>
        <div
          className="h-6 bg-red-500 inline-block text-center text-white font-semibold text-sm leading-6"
          style={{ width: `${invalidPercent}%` }}
        >
          {invalidPercent > 10 ? `${invalidPercent}%` : ""}
        </div>
        <div
          className="h-6 bg-yellow-500 inline-block text-center text-white font-semibold text-sm leading-6"
          style={{ width: `${unknownPercent}%` }}
        >
          {unknownPercent > 10 ? `${unknownPercent}%` : ""}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-sm"></span> Valid
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-sm"></span> Invalid
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-sm"></span> Unknown
        </div>
      </div>

      <hr className="my-6 border-slate-200" />

      {/* Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <span className="text-indigo-500 text-lg">⏱</span>
            <span>
              <strong>Processing Time:</strong>{" "}
              <span className="font-semibold text-slate-800">{processingTime}</span>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-indigo-500 text-lg">⚡</span>
            <span>
              <strong>Average Speed:</strong>{" "}
              <span className="font-semibold text-slate-800">{speed}</span>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600 text-lg">✔</span>
            <span>
              <strong>Status:</strong>{" "}
              <span className="text-green-600 font-semibold">Completed</span>
            </span>
          </p>
        </div>

        <div>
          <p className="font-semibold text-slate-800 mb-2">
            Verification Methods Applied
          </p>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div className="flex items-center gap-2">
              ✅ SMTP Verification
            </div>
            <div className="flex items-center gap-2">
              ✅ DNS Validation
            </div>
            <div className="flex items-center gap-2">
              ✅ Syntax Check
            </div>
            <div className="flex items-center gap-2">
              ✅ Disposable Detection
            </div>
            <div className="flex items-center gap-2">
              ✅ Catch-all Detection
            </div>
            <div className="flex items-center gap-2">
              ✅ Role Account Detection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
