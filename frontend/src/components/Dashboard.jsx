import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard({ onEdit }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const isNewPost = (dateString) => {
    const postDate = new Date(dateString);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return postDate >= threeDaysAgo;
  };

  const processedPosts = posts
    .filter(post => {
      if (filterStatus === 'Published') return post.published;
      if (filterStatus === 'Draft') return !post.published;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortBy === 'Newest' ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <div className="p-8 text-center text-[#56494C] animate-pulse">Loading posts...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-serif font-bold mb-4 text-[#56494C] dark:text-[#EAE7E1]">Posts Dashboard</h2>
      <p className="text-lg text-[#56494C]/80 dark:text-[#EAE7E1]/80 mb-8 border-b-2 border-[#A599B5]/30 pb-6">
        This is your central command center. Manage all your drafted and published articles from here.
      </p>
      
      {/* Filters and Sorting Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/60 dark:bg-[#2A2E2C]/60 border border-[#A599B5]/40 dark:border-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] text-sm rounded-lg focus:ring-[#007EA7]/40 focus:border-[#007EA7]/40 block p-2 transition-all cursor-pointer"
          >
            <option value="All">All Posts</option>
            <option value="Published">Published</option>
            <option value="Draft">Drafts</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">Sort:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/60 dark:bg-[#2A2E2C]/60 border border-[#A599B5]/40 dark:border-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] text-sm rounded-lg focus:ring-[#007EA7]/40 focus:border-[#007EA7]/40 block p-2 transition-all cursor-pointer"
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white/40 dark:bg-[#2A2E2C]/40 rounded-xl border border-[#A599B5]/20 backdrop-blur-sm shadow-sm">
        <table className="min-w-full">
          <thead className="border-b-2 border-[#A599B5]/30 dark:border-[#A599B5]/10 bg-white/30 dark:bg-[#2A2E2C]/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">Created At</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-[#A599B5]/20 dark:divide-[#A599B5]/10">
            {processedPosts.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-[#56494C]/70 dark:text-[#EAE7E1]/70">
                  No posts match your filters.
                </td>
              </tr>
            ) : (
              processedPosts.map((post) => (
                <tr key={post.id} className="transition-all duration-200 hover:bg-white/70 dark:hover:bg-[#343936] hover:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] relative z-0 hover:z-10">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-4 bg-[#CDDDDD]/50 dark:bg-[#1A1C1A]/50 rounded-lg overflow-hidden border border-[#A599B5]/20 dark:border-[#A599B5]/10 flex items-center justify-center">
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-5 w-5 text-[#A599B5]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base font-medium text-[#56494C] dark:text-[#EAE7E1]">
                        {post.title}
                      </span>
                      {isNewPost(post.created_at) && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#007EA7]/10 dark:bg-[#007EA7]/20 text-[#007EA7] dark:text-[#4DB8D9] rounded-md border border-[#007EA7]/20 dark:border-[#007EA7]/30">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1.5 inline-flex items-center gap-2 text-xs font-bold rounded-full border ${
                      post.published 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}>
                      <span className={`rounded-full h-1.5 w-1.5 ${post.published ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-[#56494C]/80 dark:text-[#EAE7E1]/80 font-mono text-xs font-medium">
                    {new Date(post.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onEdit(post)} 
                      className="px-3 py-1.5 rounded-md text-[#007EA7] dark:text-[#4DB8D9] hover:bg-[#007EA7]/10 dark:hover:bg-[#007EA7]/20 transition-colors mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)} 
                      className="px-3 py-1.5 rounded-md text-[#56494C]/60 dark:text-[#EAE7E1]/60 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}