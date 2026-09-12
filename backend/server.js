const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: ["https://console-blog-five.vercel.app/", "http://localhost:5173"],
}));
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://yhfebrarkrplfyifscpe.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmVicmFya3JwbGZ5aWZzY3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODkyMzAsImV4cCI6MjEwMzY2NTIzMH0.WIBm1oYfFvTPDGfFvuR2-bUeTTA_LPU5-JzZ0V_xkwo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to pass JWT to Supabase to enforce RLS
const getAuthClient = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
  }
  return supabase;
};

// Create a new post
app.post('/api/posts', async (req, res) => {
  const { title, content, published, tags, cover_image_url } = req.body; 
  const client = getAuthClient(req);
  
  // Enforce auth and attach user_id
  const { data: { user }, error: authErr } = await client.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  // 1. Insert the Post
  const { data: postData, error: postError } = await client
    .from('posts')
    .insert([{ 
      title, 
      content, 
      published, 
      cover_image_url: cover_image_url || null,
      user_id: user.id 
    }])
    .select()
    .single();
    
  if (postError) return res.status(500).json({ error: postError.message });

  // 2. Handle Tags
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const { data: tagData, error: tagError } = await client
        .from('tags')
        .upsert([{ name: tagName }], { onConflict: 'name' })
        .select()
        .single();

      if (tagError) continue;

      await client
        .from('post_tags')
        .insert([{ post_id: postData.id, tag_id: tagData.id }]);
    }
  }

  res.status(201).json({ message: "Post created successfully", post: postData });
});

// Retrieve all posts
app.get('/api/posts', async (req, res) => {
  const { tag, search, dashboard } = req.query;
  const client = getAuthClient(req);

  let query = client.from('posts').select(`
    *,
    tags ( name )
  `).order('created_at', { ascending: false });

  // If fetching for public feed, restrict to published. 
  // RLS will also enforce this, but it's good practice.
  if (dashboard === 'true') {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('published', true);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data, error } = await query;
    
  if (error) {
      return res.status(500).json({ error: error.message });
  }

  let filteredData = data;
  if (tag) {
    const tagArray = tag.split(',');
    filteredData = filteredData.filter(post => {
      if (!post.tags) return false;
      const postTagNames = post.tags.map(t => t.name);
      return tagArray.every(t => postTagNames.includes(t));
    });
  }

  res.status(200).json(filteredData);
});

// Retrieve all distinct tags
app.get('/api/tags', async (req, res) => {
  try {
    const client = getAuthClient(req);
    const { data, error } = await client
      .from('posts')
      .select('tags!inner(name)')
      .eq('published', true);

    if (error) throw error;

    const uniqueTags = new Set();
    if (data) {
      data.forEach(post => {
        if (post.tags) {
          post.tags.forEach(t => uniqueTags.add(t.name));
        }
      });
    }

    res.status(200).json(Array.from(uniqueTags).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve a specific post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = getAuthClient(req);
    const { data, error } = await client
      .from('posts')
      .select('*, tags(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Post not found' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve related posts
app.get('/api/posts/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const client = getAuthClient(req);

    const { data: post, error: postError } = await client
      .from('posts')
      .select('tags(name)')
      .eq('id', id)
      .single();

    if (postError) throw postError;
    if (!post || !post.tags || post.tags.length === 0) {
      return res.status(200).json([]);
    }

    const tagNames = post.tags.map(t => t.name);

    const { data: relatedPosts, error: relatedError } = await client
      .from('posts')
      .select('*, tags!inner(name)')
      .in('tags.name', tagNames)
      .eq('published', true)
      .neq('id', id)
      .order('created_at', { ascending: false });

    if (relatedError) throw relatedError;

    const uniquePosts = [];
    const seenIds = new Set();
    for (const p of relatedPosts) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniquePosts.push(p);
      }
      if (uniquePosts.length === 3) break;
    }

    res.status(200).json(uniquePosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const client = getAuthClient(req);

    const { error: uploadError } = await client.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = client.storage
      .from('images')
      .getPublicUrl(fileName);

    res.status(200).json({ url: publicUrl });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, published, cover_image_url, tags } = req.body;
    const client = getAuthClient(req);
    
    // RLS will reject if the user is not the owner
    const { data: postData, error: postError } = await client
      .from('posts')
      .update({ title, content, published, cover_image_url: cover_image_url || null })
      .eq('id', id)
      .select()
      .single();

    if (postError) throw postError;
    if (!postData) return res.status(404).json({ error: 'Post not found or unauthorized' });

    if (tags !== undefined) {
      await client.from('post_tags').delete().eq('post_id', id);

      if (tags.length > 0) {
        for (const tagName of tags) {
          const { data: tagData, error: tagError } = await client
            .from('tags')
            .upsert([{ name: tagName }], { onConflict: 'name' })
            .select()
            .single();

          if (tagError) continue;

          await client
            .from('post_tags')
            .insert([{ post_id: id, tag_id: tagData.id }]);
        }
      }
    }

    res.status(200).json(postData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = getAuthClient(req);
    
    const { data, error } = await client
      .from('posts')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Post not found or unauthorized' });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
