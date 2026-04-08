import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Star, Film, Tv, Loader2, X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { getWatchHistory, removeFromWatchHistory } from "./ContentDetailModal";
import { moviesAPI, seriesAPI } from "../services/api";

const ContentCard = ({ item, onSelectContent }) => (
  <div onClick={() => onSelectContent(item)} className="group cursor-pointer">
    <div className="relative rounded-xl overflow-hidden mb-2 transition-transform duration-300 group-hover:scale-105">
      {item.poster ? (
        <img src={item.poster} alt={item.title} className="w-full h-60 object-cover bg-gray-800" loading="lazy" />
      ) : (
        <div className="w-full h-60 bg-gray-800 flex items-center justify-center">
          <Film className="w-12 h-12 text-gray-600" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/30">
        <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
          <Play className="w-7 h-7 text-white fill-white ml-1" />
        </div>
      </div>
      {item.rating > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-lg">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span className="text-white text-xs font-medium">{item.rating}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600/80 rounded text-xs text-white font-medium">
        {item.type === "series" ? "TV" : "Movie"}
      </div>
    </div>
    <h4 className="text-white font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">{item.title}</h4>
    <p className="text-gray-400 text-xs mt-1">{item.year}</p>
  </div>
);

const ContinueWatchingRow = ({ onSelectContent }) => {
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    let items = getWatchHistory();
    items.sort((a, b) => b.lastWatched - a.lastWatched);
    setHistory(items);
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener("watchHistoryUpdated", handleUpdate);
    return () => window.removeEventListener("watchHistoryUpdated", handleUpdate);
  }, []);

  const handleRemove = (e, item) => {
    e.stopPropagation();
    removeFromWatchHistory(item.id, item.type);
    loadHistory();
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-600/30 rounded-lg">
          <Clock className="w-5 h-5 text-green-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">Continue Watching</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
        {history.map((item) => (
          <div
            key={`continue-${item.type}-${item.id}`}
            onClick={() => onSelectContent(item)}
            className="flex-shrink-0 w-64 sm:w-80 group cursor-pointer relative"
          >
            <div className="relative rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {item.backdrop || item.poster ? (
                <img src={item.backdrop || item.poster} alt={item.title} className="w-full h-36 sm:h-44 object-cover bg-gray-800" loading="lazy" />
              ) : (
                <div className="w-full h-36 sm:h-44 bg-gray-800 flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
              )}
              <button onClick={(e) => handleRemove(e, item)} className="absolute top-3 right-3 p-2 bg-black/80 hover:bg-red-600 rounded-full transition-colors z-20 shadow-lg">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <h4 className="text-white font-semibold truncate text-sm">{item.title}</h4>
                <p className="text-gray-300 text-xs">{item.type === "series" ? `S${item.season} E${item.episode}` : item.year}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div className="h-full bg-purple-600 transition-all" style={{ width: `${item.progress || 30}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryRow = ({ title, fetchFn, onSelectContent, icon }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const seenIds = useRef(new Set());

  useEffect(() => {
    setLoading(true);
    fetchFn(1)
      .then(res => {
        const data = res.data || res; // services/api returns {items, total_pages} directly or via .data
        const rawItems = data.items || data.results || [];
        const allItems = [];
        rawItems.forEach(item => {
          const key = `${item.type}-${item.id}`;
          if (!seenIds.current.has(key)) {
            seenIds.current.add(key);
            allItems.push(item);
          }
        });
        setItems(allItems);
        const totalPages = data.total_pages || 1;
        setHasMore(totalPages > 1);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFn(nextPage)
      .then(res => {
        const data = res.data || res;
        const rawItems = data.items || data.results || [];
        const newItems = rawItems.filter(item => {
          const key = `${item.type}-${item.id}`;
          if (seenIds.current.has(key)) return false;
          seenIds.current.add(key);
          return true;
        });
        setItems(prev => [...prev, ...newItems]);
        const totalPages = data.total_pages || 1;
        if (nextPage >= totalPages) setHasMore(false);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, page, fetchFn]);

  const handleShowAll = () => {
    setExpanded(true);
    if (hasMore) loadMore();
  };

  const displayed = expanded ? items : items.slice(0, 12);

  if (!loading && items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-purple-600/30 rounded-lg">{icon}</div>}
          <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
          {items.length > 0 && <span className="text-gray-400 text-sm">({items.length})</span>}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayed.map(item => (
              <ContentCard key={`${item.type}-${item.id}`} item={item} onSelectContent={onSelectContent} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            {!expanded && items.length > 12 && (
              <button
                onClick={handleShowAll}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" /> Show All ({items.length})
              </button>
            )}
            {expanded && hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : "Load More"}
              </button>
            )}
            {expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <ChevronUp className="w-4 h-4" /> Collapse
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const MOVIE_CATEGORIES = [
  { key: "popular",     title: "Top Popular",        fn: (p) => moviesAPI.getPopular(p) },
  { key: "oscars",      title: "The Oscars 2026",    fn: (p) => moviesAPI.getOscars(p) },
  { key: "action",      title: "Action",             fn: (p) => moviesAPI.getAction(p) },
  { key: "animation",   title: "Animation",          fn: (p) => moviesAPI.getAnimation(p) },
  { key: "horror",      title: "Horror",             fn: (p) => moviesAPI.getHorror(p) },
  { key: "newly",       title: "Just Released",      fn: (p) => moviesAPI.getNewlyAdded(p) },
  { key: "southafrica", title: "South Africa",       fn: (p) => moviesAPI.getSouthAfrica(p) },
  { key: "africa",      title: "Africa's Homegrown", fn: (p) => moviesAPI.getAfrica(p) },
  { key: "netflix",     title: "Netflix",            fn: (p) => moviesAPI.getNetflix(p) },
  { key: "hbo",         title: "HBO",                fn: (p) => moviesAPI.getHBO(p) },
  { key: "prime",       title: "Prime Video",        fn: (p) => moviesAPI.getPrime(p) },
  { key: "disney",      title: "Disney+",            fn: (p) => moviesAPI.getDisney(p) },
  { key: "korea",       title: "K-Cinema",           fn: (p) => moviesAPI.getKorea(p) },
  { key: "tyler",       title: "Tyler Perry",        fn: (p) => moviesAPI.getTylerPerry(p) },
  { key: "documentary", title: "Documentary",        fn: (p) => moviesAPI.getDocumentary(p) },
  { key: "anime",       title: "Anime",              fn: (p) => moviesAPI.getAnime(p) },
  { key: "romance",     title: "Romance",            fn: (p) => moviesAPI.getRomance(p) },
  { key: "nollywood",   title: "Nollywood",          fn: (p) => moviesAPI.getNollywood(p) },
  { key: "hollywood",   title: "Hollywood",          fn: (p) => moviesAPI.getHollywood(p) },
  { key: "classics",    title: "Classic",            fn: (p) => moviesAPI.getClassics(p) },
  { key: "franchise",   title: "Franchise",          fn: (p) => moviesAPI.getFranchise(p) },
];

const SERIES_CATEGORIES = [
  { key: "popular",     title: "Top Popular",        fn: (p) => seriesAPI.getPopular(p) },
  { key: "action",      title: "Action",             fn: (p) => seriesAPI.getAction(p) },
  { key: "animation",   title: "Animation",          fn: (p) => seriesAPI.getAnimation(p) },
  { key: "horror",      title: "Horror",             fn: (p) => seriesAPI.getHorror(p) },
  { key: "newly",       title: "Just Released",      fn: (p) => seriesAPI.getNewlyAdded(p) },
  { key: "southafrica", title: "South Africa",       fn: (p) => seriesAPI.getSouthAfrica(p) },
  { key: "africa",      title: "Africa's Homegrown", fn: (p) => seriesAPI.getAfrica(p) },
  { key: "netflix",     title: "Netflix",            fn: (p) => seriesAPI.getNetflix(p) },
  { key: "hbo",         title: "HBO",                fn: (p) => seriesAPI.getHBO(p) },
  { key: "prime",       title: "Prime Video",        fn: (p) => seriesAPI.getPrime(p) },
  { key: "disney",      title: "Disney+",            fn: (p) => seriesAPI.getDisney(p) },
  { key: "korea",       title: "K-Cinema",           fn: (p) => seriesAPI.getKorea(p) },
  { key: "tyler",       title: "Tyler Perry",        fn: (p) => seriesAPI.getTylerPerry(p) },
  { key: "documentary", title: "Documentary",        fn: (p) => seriesAPI.getDocumentary(p) },
  { key: "anime",       title: "Anime",              fn: (p) => seriesAPI.getAnime(p) },
  { key: "romance",     title: "Romance",            fn: (p) => seriesAPI.getRomance(p) },
  { key: "nollywood",   title: "Nollywood",          fn: (p) => seriesAPI.getNollywood(p) },
  { key: "hollywood",   title: "Hollywood",          fn: (p) => seriesAPI.getHollywood(p) },
  { key: "classics",    title: "Classic",            fn: (p) => seriesAPI.getClassics(p) },
  { key: "franchise",   title: "Franchise",          fn: (p) => seriesAPI.getFranchise(p) },
];

const ContentSection = ({ type = "movies", onSelectContent, filterMode }) => {
  const categories = type === "movies" ? MOVIE_CATEGORIES : SERIES_CATEGORIES;

  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {type === "movies" && <ContinueWatchingRow onSelectContent={onSelectContent} />}
        {categories.map(cat => (
          <CategoryRow
            key={cat.key}
            title={cat.title}
            fetchFn={cat.fn}
            onSelectContent={onSelectContent}
          />
        ))}
      </div>
    </section>
  );
};

export default ContentSection;