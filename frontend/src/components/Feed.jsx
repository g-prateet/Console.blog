import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Feed({ onViewPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTags, setAllTags] = useState([]);

  // Initialize state from URL params
  const [selectedTags, setSelectedTags] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get('tag');
    return tagParam ? tagParam.split(',') : [];
  });
  
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all tags for the filter row
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_URL}/tags`);
        if (response.ok) {
          const data = await response.json();
          setAllTags(data);
        }
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, []);

  // Sync URL and fetch posts when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (selectedTags.length > 0) {
      params.set('tag', selectedTags.join(','));
    } else {
      params.delete('tag');
    }
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);

    fetchPublishedPosts(selectedTags, debouncedSearch);
  }, [selectedTags, debouncedSearch]);

  const fetchPublishedPosts = async (tags, search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tags.length > 0) params.append('tag', tags.join(','));
      if (search) params.append('search', search);
      
      const url = `${API_URL}/posts${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      const publishedPosts = data.filter(post => post.published);
      setPosts(publishedPosts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getExcerpt = (htmlContent) => {
    if (!htmlContent) return '';
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const text = doc.body.textContent || "";
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-6xl p-8 mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-4 text-[#56494C] dark:text-[#EAE7E1]">
        Latest Articles
      </h1>
      <p className="text-lg text-[#56494C]/80 dark:text-[#EAE7E1]/80 mb-8 border-b-2 border-[#A599B5]/30 dark:border-[#A599B5]/20 pb-6">
        This is the public feed where all your published articles are displayed for visitors to read and discover.
      </p>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-[#2A2E2C]/60 border border-[#A599B5]/40 dark:border-[#A599B5]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007EA7]/40 transition-all text-[#56494C] dark:text-[#EAE7E1] dark:placeholder-[#EAE7E1]/40 shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-[#A599B5]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Tag Filters Row */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 items-center">
          <span className="text-sm font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mr-2">Filter:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-1.5 text-xs font-mono font-bold rounded-full transition-all border ${
                selectedTags.includes(tag)
                  ? 'bg-[#5B7553] text-white border-[#5B7553] dark:bg-[#7EA873] dark:text-[#121413] dark:border-[#7EA873] shadow-md'
                  : 'bg-white/40 dark:bg-[#2A2E2C]/40 text-[#56494C] dark:text-[#EAE7E1]/80 border-[#A599B5]/30 hover:border-[#5B7553]/50'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1.5 ml-2 text-xs font-bold text-[#56494C]/60 dark:text-[#EAE7E1]/60 hover:text-[#56494C] dark:hover:text-[#EAE7E1] transition-colors"
            >
              Clear All ✕
            </button>
          )}
        </div>
      )}

      {error && <div className="p-4 mb-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">Error: {error}</div>}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/40 dark:bg-[#2A2E2C]/40 rounded-2xl border border-[#A599B5]/20 overflow-hidden animate-pulse flex flex-col h-full">
              <div className="h-48 bg-[#A599B5]/20 dark:bg-[#A599B5]/10"></div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="h-4 w-1/3 bg-[#A599B5]/30 dark:bg-[#A599B5]/20 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-[#A599B5]/30 dark:bg-[#A599B5]/20 rounded mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-full"></div>
                  <div className="h-3 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-5/6"></div>
                </div>
                <div className="mt-auto flex gap-2">
                  <div className="h-6 w-16 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded-full"></div>
                  <div className="h-6 w-16 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center flex flex-col items-center justify-center bg-white/30 dark:bg-[#2A2E2C]/30 rounded-3xl border border-[#A599B5]/20 border-dashed">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#A599B5]/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-2xl font-serif font-bold text-[#56494C] dark:text-[#EAE7E1] mb-2">No articles found</h3>
          <p className="text-[#56494C]/70 dark:text-[#EAE7E1]/70">Try adjusting your filters or write a new article.</p>
        </div>
      ) : (
        /* Article Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id} 
              onClick={() => onViewPost && onViewPost(post.id)}
              className="bg-white/70 dark:bg-[#2A2E2C]/70 backdrop-blur-sm rounded-2xl border border-[#A599B5]/30 dark:border-[#A599B5]/10 overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#A599B5]/10 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              {/* Cover Image Placeholder */}
              <div className="h-48 bg-[#CDDDDD]/50 dark:bg-[#1A1C1A]/50 relative overflow-hidden">
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A599B5]/40 dark:text-[#A599B5]/20 group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-[#CDDDDD] to-[#A599B5]/20 dark:from-[#1A1C1A] dark:to-[#2A2E2C]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                {/* Publish Date - Monospace */}
                <div className="text-xs text-[#5B7553] dark:text-[#7EA873] mb-3 font-mono font-semibold tracking-wider">
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>

                <h2 className="text-2xl font-serif font-bold mb-3 text-[#56494C] dark:text-[#EAE7E1] group-hover:text-[#007EA7] dark:group-hover:text-[#4DB8D9] transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                {/* Excerpt */}
                <p className="text-sm text-[#56494C]/80 dark:text-[#EAE7E1]/80 leading-relaxed mb-6 flex-grow line-clamp-3">
                  {getExcerpt(post.content)}
                </p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[#A599B5]/10 dark:border-[#A599B5]/20">
                    {post.tags.map((tagObj, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); toggleTag(tagObj.name); }}
                        className="px-3 py-1 text-[11px] font-mono font-medium rounded-md bg-[#A599B5]/10 dark:bg-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] hover:bg-[#5B7553]/15 dark:hover:bg-[#5B7553]/30 hover:text-[#5B7553] dark:hover:text-[#7EA873] transition-colors border border-[#A599B5]/20 dark:border-transparent"
                      >
                        #{tagObj.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}