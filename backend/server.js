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
  const { title, content, published, tags } = req.body; 
  // Expects 'tags' to be an array of strings: ['react', 'cloud']

  // 1. Insert the Post
  const { data: postData, error: postError } = await supabase
    .from('posts')
    .insert([{ title, content, published }])
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
// READ: Fetch all posts, with optional tag filtering
app.get('/api/posts', async (req, res) => {
  const { tag } = req.query;

  // By default, fetch posts and their related tags
  let query = supabase.from('posts').select(`
    *,
    tags ( name )
  `);

  // If a '?tag=' query parameter exists, filter the results
  if (tag) {
    query = supabase.from('posts').select(`
      *,
      tags!inner ( name )
    `).eq('tags.name', tag); 
    // !inner forces the database to only return posts that successfully match the tag
  }

  const { data, error } = await query;
    
  if (error) {
      return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
});

// Retrieve a specific post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Post not found' });
    
    res.status(200).json(data);
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
    const { title, content, published } = req.body;
    const { data, error } = await supabase
      .from('posts')
      .update({ title, content, published })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json(data[0]);
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
