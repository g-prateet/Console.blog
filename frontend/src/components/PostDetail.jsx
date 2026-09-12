import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PostDetail({ postId, onBack, onTagClick, onViewPost }) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      setLoading(true);
      try {
        // Fetch specific post
        const postRes = await fetch(`${API_URL}/posts/${postId}`);
        if (!postRes.ok) throw new Error('Failed to fetch post');
        const postData = await postRes.json();
        setPost(postData);

        // Fetch related posts
        const relatedRes = await fetch(`${API_URL}/posts/${postId}/related`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedPosts(relatedData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndRelated();
  }, [postId]);

  const getExcerpt = (htmlContent) => {
    if (!htmlContent) return '';
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const text = doc.body.textContent || "";
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  if (loading) {
    return (
      <div className="max-w-4xl p-8 mx-auto mt-4 animate-pulse">
        <div className="h-8 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-1/4 mb-8"></div>
        <div className="h-96 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded-2xl mb-8"></div>
        <div className="space-y-4">
          <div className="h-6 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-full"></div>
          <div className="h-6 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-5/6"></div>
          <div className="h-6 bg-[#A599B5]/20 dark:bg-[#A599B5]/10 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl p-8 mx-auto mt-4">
        <button onClick={onBack} className="mb-6 text-[#007EA7] dark:text-[#4DB8D9] font-bold hover:underline flex items-center gap-2">
          <span>&larr;</span> Back to Feed
        </button>
        <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          {error || 'Post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-8 mx-auto mt-4">
      <button 
        onClick={onBack} 
        className="mb-8 text-[#56494C]/70 dark:text-[#EAE7E1]/70 hover:text-[#56494C] dark:hover:text-[#EAE7E1] font-bold transition-colors flex items-center gap-2 text-sm uppercase tracking-widest"
      >
        <span>&larr;</span> Back to Feed
      </button>

      {post.cover_image_url && (
        <div className="w-full h-[400px] rounded-3xl overflow-hidden mb-10 shadow-lg border border-[#A599B5]/20 dark:border-[#A599B5]/10">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <header className="mb-10 text-center">
        <div className="text-sm text-[#5B7553] dark:text-[#7EA873] mb-4 font-mono font-semibold tracking-wider">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>
        <h1 className="text-5xl font-serif font-black mb-8 text-[#56494C] dark:text-[#EAE7E1] leading-tight">
          {post.title}
        </h1>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 border-b-2 border-[#A599B5]/20 dark:border-[#A599B5]/10 pb-10">
            {post.tags.map((tagObj, index) => (
              <button
                key={index}
                onClick={() => onTagClick(tagObj.name)}
                className="px-4 py-1.5 text-xs font-mono font-bold rounded-full bg-[#A599B5]/15 dark:bg-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] hover:bg-[#5B7553] hover:text-white dark:hover:bg-[#7EA873] dark:hover:text-[#121413] transition-colors border border-[#A599B5]/30 dark:border-transparent"
              >
                #{tagObj.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Article Content - using the same prose styles configured globally or inline */}
      <div 
        className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-[#56494C] dark:prose-headings:text-[#EAE7E1] prose-a:text-[#007EA7] dark:prose-a:text-[#4DB8D9] max-w-none text-[#56494C]/90 dark:text-[#EAE7E1]/90 mb-20 whitespace-normal break-words max-w-full overflow-x-hidden [&_*]:whitespace-normal [&_*]:break-words [&_*]:max-w-full"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="pt-12 border-t-2 border-[#A599B5]/30 dark:border-[#A599B5]/20">
          <h3 className="text-2xl font-serif font-bold mb-8 text-[#56494C] dark:text-[#EAE7E1]">
            Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <article 
                key={related.id} 
                onClick={() => onViewPost(related.id)}
                className="bg-white/60 dark:bg-[#2A2E2C]/60 backdrop-blur-sm rounded-xl border border-[#A599B5]/30 dark:border-[#A599B5]/10 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="h-32 bg-[#CDDDDD]/50 dark:bg-[#1A1C1A]/50 relative overflow-hidden">
                  {related.cover_image_url ? (
                    <img src={related.cover_image_url} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#A599B5]/40 dark:text-[#A599B5]/20 group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-[#CDDDDD] to-[#A599B5]/20 dark:from-[#1A1C1A] dark:to-[#2A2E2C]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="text-lg font-serif font-bold mb-2 text-[#56494C] dark:text-[#EAE7E1] group-hover:text-[#007EA7] dark:group-hover:text-[#4DB8D9] transition-colors line-clamp-2">
                    {related.title}
                  </h4>
                  <p className="text-xs text-[#56494C]/70 dark:text-[#EAE7E1]/70 line-clamp-2 mt-auto">
                    {getExcerpt(related.content)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
