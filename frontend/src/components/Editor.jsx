import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Editor({ postToEdit, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '', 
    published: false,
    cover_image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (postToEdit) {
      setFormData({
        title: postToEdit.title,
        content: postToEdit.content,
        tags: postToEdit.tags ? postToEdit.tags.map(t => t.name).join(', ') : '', 
        published: postToEdit.published,
        cover_image_url: postToEdit.cover_image_url || ''
      });
    }
  }, [postToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const quillRef = useRef(null);
  const coverImageInputRef = useRef(null);

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: uploadData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      if (data.url) {
        setFormData(prev => ({ ...prev, cover_image_url: data.url }));
      }
    } catch (err) {
      console.error('Cover image upload failed:', err);
      alert(`Failed to upload cover image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();

        if (data.url) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          
          quill.insertEmbed(range.index, 'image', data.url);
          quill.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Failed to upload image.');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
      matchers: [
        [Node.ELEMENT_NODE, (node, delta) => {
          delta.ops = delta.ops.map(op => {
            if (op.attributes) {
              const allowedAttributes = ['bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'header', 'link', 'image'];
              Object.keys(op.attributes).forEach(attr => {
                if (!allowedAttributes.includes(attr)) {
                  delete op.attributes[attr];
                }
              });
            }
            return op;
          });
          return delta;
        }]
      ]
    }
  }), []);

  const handleSubmit = async (e, publishStatus) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Article title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const isUpdate = !!postToEdit;
    const url = isUpdate ? `${API_URL}/posts/${postToEdit.id}` : `${API_URL}/posts`;
    const method = isUpdate ? 'PUT' : 'POST';

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const payload = {
      title: formData.title,
      content: formData.content,
      published: publishStatus,
      tags: tagsArray,
      cover_image_url: formData.cover_image_url
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) throw new Error('Failed to save post');
      const savedPost = await response.json();
      onSave(savedPost);
      
      if (!isUpdate) {
        setFormData({ title: '', content: '', tags: '', published: false, cover_image_url: '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate word count and read time
  const doc = new DOMParser().parseFromString(formData.content, 'text/html');
  const plainTextContent = (doc.body.textContent || "").trim();
  const wordCount = plainTextContent ? plainTextContent.split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 200) || 1;

  return (
    <div className="p-8 max-w-4xl mx-auto mt-4 transition-colors duration-500">
      
      <h2 className="text-4xl font-serif font-bold mb-4 text-[#56494C] dark:text-[#EAE7E1]">
        {postToEdit ? 'Edit Article' : 'Write a New Article'}
      </h2>
      <p className="text-lg text-[#56494C]/80 dark:text-[#EAE7E1]/80 mb-8 border-b-2 border-[#A599B5]/30 dark:border-[#A599B5]/20 pb-6">
        This is your workspace. Draft your articles here, add images, and tag them by topic before publishing them live to your feed.
      </p>
      
      {error && <div className="mb-8 p-4 text-[#56494C] bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>}
      
      <form className="space-y-8">
        
        {/* Cover Image Upload */}
        <div>
          <label className="block text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mb-3">
            Cover Image
          </label>
          <div className="flex items-center gap-4">
            {formData.cover_image_url && (
              <img src={formData.cover_image_url} alt="Cover Preview" className="h-24 w-40 object-cover rounded-lg border border-[#A599B5]/40 dark:border-[#A599B5]/20" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={coverImageInputRef} 
              onChange={handleCoverImageUpload} 
            />
            <button
              type="button"
              onClick={() => coverImageInputRef.current.click()}
              className="px-4 py-2 border-2 border-dashed border-[#A599B5]/60 dark:border-[#A599B5]/40 rounded-lg text-sm font-bold text-[#56494C]/80 dark:text-[#EAE7E1]/80 hover:bg-[#A599B5]/10 dark:hover:bg-[#A599B5]/20 hover:border-[#A599B5] transition-colors"
            >
              {formData.cover_image_url ? 'Change Cover Image' : '+ Add Cover Image'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mb-3">
            Article Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/40 dark:bg-[#2A2E2C]/40 border border-[#A599B5]/40 dark:border-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] font-serif text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007EA7]/40 dark:focus:ring-[#007EA7]/60 focus:bg-white dark:focus:bg-[#2A2E2C] transition-all placeholder:text-[#56494C]/40 dark:placeholder:text-[#EAE7E1]/40"
            placeholder="What are we writing about today?"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mb-3">
            The Story
          </label>
          {/* Custom class 'custom-quill-editor' added for global CSS styling */}
          <div className="bg-white dark:bg-[#2A2E2C]/60 border border-[#A599B5]/40 dark:border-[#A599B5]/20 rounded-lg overflow-hidden custom-quill-editor">
            <ReactQuill 
              ref={quillRef}
              modules={modules}
              theme="snow" 
              value={formData.content} 
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))} 
              className="h-[400px] mb-10" 
            />
          </div>
          
          {/* Live Word Count & Read Time */}
          <div className="flex justify-between items-center mt-2 px-1">
             <span className="text-xs font-mono font-medium text-[#A599B5] dark:text-[#A599B5]/80">
                {wordCount} words
             </span>
             <span className="text-xs font-mono font-medium text-[#A599B5] dark:text-[#A599B5]/80">
                ~{readTime} min read
             </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mb-3">
            Topics & Categories
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/40 dark:bg-[#2A2E2C]/40 border border-[#A599B5]/40 dark:border-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007EA7]/40 dark:focus:ring-[#007EA7]/60 focus:bg-white dark:focus:bg-[#2A2E2C] transition-all placeholder:text-[#56494C]/40 dark:placeholder:text-[#EAE7E1]/40"
            placeholder="e.g. design, architecture, web..."
          />
        </div>
        
        <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-[#A599B5]/20 dark:border-[#A599B5]/20">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-bold text-[#56494C]/70 dark:text-[#EAE7E1]/70 hover:text-[#56494C] dark:hover:text-[#EAE7E1] hover:bg-[#A599B5]/10 dark:hover:bg-[#A599B5]/20 rounded-full transition-all focus:outline-none mr-auto"
          >
            Cancel
          </button>
          
          {/* Save Draft (Secondary / Outline) */}
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="px-6 py-2.5 rounded-full border-2 border-[#5B7553] dark:border-[#7EA873] text-sm font-bold text-[#5B7553] dark:text-[#7EA873] bg-transparent hover:bg-[#5B7553]/10 dark:hover:bg-[#7EA873]/10 focus:outline-none focus:ring-4 focus:ring-[#5B7553]/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : (formData.published && postToEdit ? 'Revert to Draft' : 'Save Draft')}
          </button>

          {/* Publish (Primary / Filled) */}
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-8 py-2.5 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#007EA7] hover:bg-[#005A7A] dark:hover:bg-[#0092C4] focus:outline-none focus:ring-4 focus:ring-[#007EA7]/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Publishing...' : (formData.published && postToEdit ? 'Update Published' : 'Publish')}
          </button>
        </div>
      </form>
    </div>
  );
}