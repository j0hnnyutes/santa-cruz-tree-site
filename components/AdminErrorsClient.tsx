"use client";

import { useState, useMemo } from "react";

type ErrorLogRow = {
  id: number;
  createdAt: string;
  severity: string;
  type: string;
  message: string;
  stack: string | null;
  path: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: string | null;
};

interface Props {
  initialErrors: ErrorLogRow[];
  initialTotal: number;
}

export default function AdminErrorsClient({ initialErrors, initialTotal }: Props) {
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const filteredErrors = useMemo(() => {
    return initialErrors.filter((e) => {
      if (severity && e.severity !== severity) return false;
      if (type && e.type !== type) return false;
      if (
        search &&
        !e.message.toLowerCase().includes(search.toLowerCase()) &&
        !e.path?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [severity, type, search, initialErrors]);

  const paginatedErrors = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredErrors.slice(start, start + limit);
  }, [filteredErrors, page]);

  const totalPages = Math.ceil(filteredErrors.length / limit);

  const severityOptions = [...new Set(initialErrors.map((e) => e.severity))];
  const typeOptions = [...new Set(initialErrors.map((e) => e.type))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1 font-medium">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg bg-gray-900 text-white px-3 py-2 border border-gray-700 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/50"
            >
              <option value="">All</option>
              {severityOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1 font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg bg-gray-900 text-white px-3 py-2 border border-gray-700 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/50"
            >
              <option value="">All</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-sm text-gray-300 mb-1 font-medium">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search message or path..."
              className="w-full rounded-lg bg-gray-900 text-white px-3 py-2 border border-gray-700 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/50"
            />
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {filteredErrors.length} errors {search || severity || type ? "found" : "total"}
        </div>
      </div>

      {/* Table */}
      {paginatedErrors.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b border-gray-700"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
              >
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Severity
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Message
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Path
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedErrors.map((err) => (
                <tbody key={err.id}>
                  <tr
                    className="border-b border-gray-700/50 cursor-pointer hover:bg-gray-900/30 transition-colors"
                    onClick={() =>
                      setExpandedId(expandedId === err.id ? null : err.id)
                    }
                  >
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {new Date(err.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          err.severity === "critical"
                            ? "bg-red-900/50 text-red-200"
                            : err.severity === "error"
                            ? "bg-red-900/30 text-red-300"
                            : "bg-yellow-900/30 text-yellow-300"
                        }`}
                      >
                        {err.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-xs">{err.type}</td>
                    <td className="py-3 px-4 text-gray-400 truncate max-w-xs">
                      {err.message.length > 80
                        ? `${err.message.slice(0, 80)}...`
                        : err.message}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs truncate">
                      {err.path || "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{err.ip}</td>
                  </tr>

                  {expandedId === err.id && (
                    <tr className="border-b border-gray-700/50 bg-gray-900/20">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-300 mb-2">
                              Full Message
                            </h4>
                            <p className="text-sm text-gray-400 break-words">
                              {err.message}
                            </p>
                          </div>

                          {err.stack && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-semibold text-gray-300">
                                  Stack Trace
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(err.stack || "");
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                  Copy
                                </button>
                              </div>
                              <pre className="text-xs bg-gray-950 p-3 rounded border border-gray-700 text-gray-400 overflow-x-auto max-h-48 overflow-y-auto">
                                {err.stack}
                              </pre>
                            </div>
                          )}

                          {err.userAgent && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-300 mb-2">
                                User Agent
                              </h4>
                              <p className="text-xs text-gray-500 break-words">
                                {err.userAgent}
                              </p>
                            </div>
                          )}

                          {err.metadata && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-300 mb-2">
                                Metadata
                              </h4>
                              <pre className="text-xs bg-gray-950 p-3 rounded border border-gray-700 text-gray-400 overflow-x-auto max-h-48 overflow-y-auto">
                                {err.metadata}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">No errors found</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded bg-gray-800 text-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded bg-gray-800 text-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
