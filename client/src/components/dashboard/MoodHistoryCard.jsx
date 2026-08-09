import React, { useState, useEffect, useCallback } from "react";
import {
  FiClock,
  FiCalendar,
  FiTag,
  FiFileText,
  FiSliders,
  FiChevronDown,
  FiInbox,
  FiSmile
} from "react-icons/fi";

const moodEmojis = {
  "very happy": "😄",
  happy: "🙂",
  neutral: "😐",
  sad: "😔",
  stressed: "😣",
  angry: "😡",
  tired: "😴",
  anxious: "😰",
};

const moodColors = {
  "very happy": "#10B981",
  happy: "#3B82F6",
  neutral: "#94A3B8",
  sad: "#6366F1",
  stressed: "#F59E0B",
  angry: "#EF4444",
  tired: "#8B5CF6",
  anxious: "#EC4899",
};

const getEmoji = (moodStr) => {
  const norm = (moodStr || "").trim().toLowerCase();
  return moodEmojis[norm] || "🙂";
};

const getColor = (moodStr) => {
  const norm = (moodStr || "").trim().toLowerCase();
  return moodColors[norm] || "#3B82F6";
};

function MoodHistoryCard({ refreshKey }) {
  const [historyEntries, setHistoryEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = useCallback(async (pageNum = 1, append = false) => {
    const token = localStorage.getItem("neurosync_token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/moodtracker/history?page=${pageNum}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to load mood history.");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const newEntries = result.data || [];
      if (append) {
        setHistoryEntries((prev) => [...prev, ...newEntries]);
      } else {
        setHistoryEntries(newEntries);
      }

      setHasMore(result.hasMore);
      setTotalCount(result.totalCount || 0);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error("Error fetching mood history:", err);
      setError("Cannot connect to server to fetch history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch when component mounts or refreshKey updates
  useEffect(() => {
    fetchHistory(1, false);
  }, [fetchHistory, refreshKey]);

  const handleViewMore = () => {
    if (hasMore && !loadingMore) {
      fetchHistory(page + 1, true);
    }
  };

  return (
    <div className="ns-card mt-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 p-2 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60A5FA",
            }}
          >
            <FiClock size={22} />
          </div>
          <h2 className="mb-0 text-white fw-bold fs-5 d-flex align-items-center gap-2">
            📜 Mood History
          </h2>
        </div>
        {totalCount > 1 && (
          <span
            className="badge rounded-pill px-3 py-1 fw-bold"
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              color: "#93C5FD",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              fontSize: "0.8rem",
            }}
          >
            {totalCount - 1} Previous Log{totalCount - 1 > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content based on state */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          <span className="text-muted" style={{ fontSize: "0.88rem" }}>
            Loading mood history...
          </span>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-3 bg-danger bg-opacity-10 text-danger border-0 p-3" style={{ fontSize: "0.88rem" }}>
          {error}
        </div>
      ) : totalCount === 0 ? (
        /* Empty state when zero total entries */
        <div className="text-center py-4 px-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <FiInbox size={32} className="text-muted" />
          </div>
          <h6 className="text-white fw-bold mb-1">You haven't recorded any moods yet.</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
            Log your mood using the form above to start building your emotional history.
          </p>
        </div>
      ) : totalCount === 1 || historyEntries.length === 0 ? (
        /* Empty state when only 1 total entry exists (shown in Today's Latest Mood) */
        <div className="text-center py-4 px-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <FiSmile size={32} className="text-muted" />
          </div>
          <h6 className="text-white fw-bold mb-1">No previous mood history available.</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
            Your latest mood is displayed on the right. Subsequent mood entries will appear here.
          </p>
        </div>
      ) : (
        /* List of previous mood entries */
        <>
          <div className="d-flex flex-column gap-3 mb-3">
            {historyEntries.map((item) => {
              const color = getColor(item.mood);
              const emoji = getEmoji(item.mood);
              return (
                <div
                  key={item._id}
                  className="p-3 rounded-4 transition-all hover-lift"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {/* Header Row: Emoji, Name, Intensity, Reason */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{emoji}</span>
                      <div>
                        <span className="fw-bold me-2" style={{ color: color, fontSize: "1rem" }}>
                          {item.mood}
                        </span>
                        <span
                          className="badge rounded-pill bg-white bg-opacity-10 text-white"
                          style={{ fontSize: "0.75rem", padding: "0.3em 0.7em" }}
                        >
                          Intensity: {item.intensity}/10
                        </span>
                      </div>
                    </div>

                    <span
                      className="badge rounded-3 fw-normal"
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#93C5FD",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        fontSize: "0.8rem",
                        padding: "0.4em 0.8em",
                      }}
                    >
                      <FiTag className="me-1" /> {item.reason}
                    </span>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p
                      className="text-white-50 mb-2 mt-2 p-2 rounded-3"
                      style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.4,
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <FiFileText className="me-1 text-info" /> {item.notes}
                    </p>
                  )}

                  {/* Date & Time Footer Meta - High Contrast */}
                  <div
                    className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top border-secondary border-opacity-25"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <div className="d-flex align-items-center gap-2" style={{ color: "#93C5FD", fontWeight: 600 }}>
                      <FiCalendar style={{ color: "#60A5FA" }} />
                      <span>{item.date}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ color: "#C4B5FD", fontWeight: 600 }}>
                      <FiClock style={{ color: "#A78BFA" }} />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Button */}
          {hasMore && (
            <div className="text-center pt-2">
              <button
                type="button"
                className="btn btn-outline-light rounded-pill px-4 py-2 border-secondary border-opacity-50 text-white-50 hover-white fw-medium d-inline-flex align-items-center gap-2"
                style={{ fontSize: "0.85rem", transition: "all 0.3s ease" }}
                onClick={handleViewMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                    Loading older entries...
                  </>
                ) : (
                  <>
                    View More <FiChevronDown />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MoodHistoryCard;
