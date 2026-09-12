const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://yhfebrarkrplfyifscpe.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmVicmFya3JwbGZ5aWZzY3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODkyMzAsImV4cCI6MjEwMzY2NTIzMH0.WIBm1oYfFvTPDGfFvuR2-bUeTTA_LPU5-JzZ0V_xkwo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new post
// CREATE: Add a new post with tags
app.post('/api/posts', async (req, res) => {
  const { title, content, published, tags, cover_image_url } = req.body; 
  // Expects 'tags' to be an array of strings: ['react', 'cloud']

  // 1. Insert the Post
  const { data: postData, error: postError } = await supabase
    .from('posts')
    .insert([{ title, content, published, cover_image_url: cover_image_url || null }])
    .select()
    .single();
    
  if (postError) return res.status(500).json({ error: postError.message });

  // 2. Handle Tags (if any are provided)
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      // Upsert the tag (insert if new, do nothing if it already exists)
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .upsert([{ name: tagName }], { onConflict: 'name' })
        .select()
        .single();

      if (tagError) continue; // Skip to the next tag if there's an issue

      // Link the post and the tag in the join table
      await supabase
        .from('post_tags')
        .insert([{ post_id: postData.id, tag_id: tagData.id }]);
    }
  }

  res.status(201).json({ message: "Post created successfully", post: postData });
});

// Retrieve all posts
// READ: Fetch all posts, with optional tag filtering (AND logic) and search
app.get('/api/posts', async (req, res) => {
  const { tag, search } = req.query;

  let query = supabase.from('posts').select(`
    *,
    tags ( name )
  `).order('created_at', { ascending: false });

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

// Retrieve all distinct tags that are currently in use by published posts
app.get('/api/tags', async (req, res) => {
  try {
    // Query published posts and only select their tags via inner join.
    // This dynamically filters out orphaned tags at query time.
    const { data, error } = await supabase
      .from('posts')
      .select('tags!inner(name)')
      .eq('published', true);

    if (error) throw error;

    // Flatten and deduplicate the tags
    const uniqueTags = new Set();
    if (data) {
      data.forEach(post => {
        if (post.tags) {
          post.tags.forEach(t => uniqueTags.add(t.name));
        }
      });
    }

    // Sort alphabetically and return
    res.status(200).json(Array.from(uniqueTags).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve a specific post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
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

// Retrieve related posts based on shared tags
app.get('/api/posts/:id/related', async (req, res) => {
  try {
    const { id } = req.params;

    // First get the tags for the current post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('tags(name)')
      .eq('id', id)
      .single();

    if (postError) throw postError;
    if (!post || !post.tags || post.tags.length === 0) {
      return res.status(200).json([]);
    }

    const tagNames = post.tags.map(t => t.name);

    // Find other published posts that share at least one tag
    const { data: relatedPosts, error: relatedError } = await supabase
      .from('posts')
      .select('*, tags!inner(name)')
      .in('tags.name', tagNames)
      .eq('published', true)
      .neq('id', id)
      .order('created_at', { ascending: false });

    if (relatedError) throw relatedError;

    // Since a post could match multiple tags and might be duplicated or just have matched tags returned, 
    // we take the first 3 unique posts.
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
    // Generate a unique filename to prevent overwriting
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // 1. Upload to the 'images' bucket
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // 2. Get the public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    // 3. Send the URL back to the frontend
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
    
    // 1. Update the post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .update({ title, content, published, cover_image_url: cover_image_url || null })
      .eq('id', id)
      .select()
      .single();

    if (postError) throw postError;
    if (!postData) return res.status(404).json({ error: 'Post not found' });

    // 2. Handle Tags
    if (tags !== undefined) {
      // First, delete existing tags for this post
      await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id);

      // Then insert new tags if any
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Upsert the tag
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .upsert([{ name: tagName }], { onConflict: 'name' })
            .select()
            .single();

          if (tagError) continue;

          // Link post and tag
          await supabase
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
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
