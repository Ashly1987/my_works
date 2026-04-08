import { useCallback, useEffect, useRef, useState } from "react";
import { VideoCard } from "../components/VideoCard";
import { apiClient } from "../services/apiClient";

const PAGE_SIZE = 25;

export function BrowsePage() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  async function loadAnalytics() {
    try {
      const summary = await apiClient.getAnalyticsSummary();
      setAnalytics(summary);
    } catch {
      setAnalytics(null);
    }
  }

  async function loadCatalog({
    nextSearch = "",
    nextPage = 1,
    append = false,
  } = {}) {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const result = await apiClient.listCatalog({
        search: nextSearch,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      const nextItems = Array.isArray(result.items) ? result.items : [];
      const nextTotal = Number(result.meta?.total || nextItems.length);

      setActiveSearch(nextSearch);
      setPage(Number(result.meta?.page || nextPage));
      setTotal(nextTotal);
      setItems((previousItems) => {
        if (!append) {
          return nextItems;
        }

        const seenIds = new Set(previousItems.map((item) => item.id));
        const appendedItems = nextItems.filter((item) => !seenIds.has(item.id));
        return [...previousItems, ...appendedItems];
      });
    } catch (err) {
      setError(err.message);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadCatalog();
    loadAnalytics();
  }, []);

  const hasMore = items.length < total;
  const sentinelRef = useRef(null);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      return;
    }

    loadCatalog({ nextSearch: activeSearch, nextPage: page + 1, append: true });
  }, [loadingMore, hasMore, activeSearch, page]);

  // Infinite scroll: trigger next page when the sentinel enters the viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  function handleSearch() {
    loadCatalog({ nextSearch: search.trim(), nextPage: 1, append: false });
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Curated film index</p>
          <h1>Find the one title worth tonight.</h1>
          <p className="hero__lede">
            Search by title and move straight into the watch page, where the
            source link or playable media is waiting.
          </p>
        </div>
        <div className="hero__aside">
          <div className="hero__stats" aria-live="polite">
            <article className="hero__stat">
              <p className="hero__stat-label">Daily Views</p>
              <p className="hero__stat-value">{analytics?.today?.count || 0}</p>
            </article>
            <article className="hero__stat">
              <p className="hero__stat-label">Total Views</p>
              <p className="hero__stat-value">
                {analytics?.totalRequests || 0}
              </p>
            </article>
          </div>

          <div className="hero__panel">
            <div className="hero__search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title"
              />
              <button type="button" onClick={handleSearch}>
                Search
              </button>
            </div>
            <p className="hero__hint">
              {items.length} of {total || items.length} title
              {(total || items.length) === 1 ? "" : "s"}
              {activeSearch
                ? ` matched for "${activeSearch}"`
                : " ready to browse"}
            </p>
          </div>
        </div>
      </section>

      {loading ? <p>Loading catalog...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <section className="grid">
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </section>
      {!loading && !error && items.length === 0 ? (
        <p>No films matched your search.</p>
      ) : null}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="browse__sentinel" aria-hidden="true" />

      {!loading && !error && items.length > 0 ? (
        <div className="browse__footer">
          {loadingMore ? (
            <p className="browse__end">Loading more titles…</p>
          ) : !hasMore ? (
            <p className="browse__end">
              You have reached the end of the catalog.
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
