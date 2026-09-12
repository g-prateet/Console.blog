import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard({ onEdit }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch(API_URL + '/posts?dashboard=true', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(API_URL + '/posts/' + id, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const isNewPost = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 2;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto mt-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-6 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-1/4 mb-10"></div>
            <div className="space-y-3">
              <div className="h-20 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded-xl"></div>
              <div className="h-20 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded-xl"></div>
              <div className="h-20 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto mt-4">
      <div className="flex justify-between items-end mb-8 border-b-2 border-[#A599B5]/30 dark:border-[#A599B5]/20 pb-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#56494C] dark:text-[#EAE7E1] mb-2">
            Your Articles
          </h2>
          <p className="text-sm font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest">
            Manage, edit, and publish
          </p>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#2A2E2C]/60 backdrop-blur-sm rounded-2xl border border-[#A599B5]/30 dark:border-[#A599B5]/10 overflow-hidden shadow-sm">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-[#56494C]/60 dark:text-[#EAE7E1]/60">
            <p className="text-lg">You haven't written any articles yet.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#A599B5]/20 dark:divide-[#A599B5]/10">
            <thead className="bg-[#CDDDDD]/30 dark:bg-[#1A1C1A]/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A599B5]/20 dark:divide-[#A599B5]/10">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/40 dark:hover:bg-[#343936]/40 transition-colors">
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
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5B7553]/15 text-[#5B7553] dark:bg-[#7EA873]/20 dark:text-[#7EA873] border border-[#5B7553]/20 dark:border-[#7EA873]/30">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A599B5]/15 text-[#56494C]/70 dark:text-[#EAE7E1]/70 border border-[#A599B5]/30">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#56494C]/70 dark:text-[#EAE7E1]/70 font-mono">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(post)}
                      className="text-[#007EA7] dark:text-[#4DB8D9] hover:text-[#005A7A] dark:hover:text-[#2E9EC0] mr-4 font-bold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500/80 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-300 font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
