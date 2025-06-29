const db = require('../config/db');
const slugify = require('slugify');
const { uploadToSpaces } = require('../middleware/upload');

const createBlog = async (req, res) => {
  try {
    const { title, content, author, status, categories, tags, meta_description } = req.body;
    let featuredImageUrl = null;

    if (req.file) {
      featuredImageUrl = await uploadToSpaces(req.file);
    }

    const slug = slugify(title, { lower: true, strict: true });

    const result = await db.insert('tbl_blogs', {
      title,
      slug,
      content,
      author,
      status,
      categories: JSON.stringify(categories ? categories.split(',').map(c => c.trim()) : []),
      tags: JSON.stringify(tags ? tags.split(',').map(t => t.trim()) : []),
      featured_image: featuredImageUrl,
      meta_description,
      published_at: status === 'published' ? new Date() : null,
      created_at: new Date(),
    });

    res.status(201).json({ message: 'Blog created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, categories, tags, meta_description } = req.body;
    let featuredImageUrl = req.body.featured_image;

    if (req.file) {
      featuredImageUrl = await uploadToSpaces(req.file);
    }

    const slug = title ? slugify(title, { lower: true, strict: true }) : undefined;

    const updateData = {
      title,
      content,
      status,
      categories: categories ? JSON.stringify(categories.split(',').map(c => c.trim())) : undefined,
      tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : undefined,
      featured_image: featuredImageUrl,
      meta_description,
      published_at: status === 'published' ? new Date() : null,
      updated_at: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    // Pass the condition as an object
    const result = await db.update('tbl_blogs', updateData, { id: parseInt(id) }, [], true);

    if (result.affected_rows === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Pass a WHERE clause string and the id as a parameter
    const result = await db.delete('tbl_blogs', 'id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await db.selectAll('tbl_blogs'); // Use selectAll instead of select
    res.json(
      blogs.map((blog) => ({
        ...blog,
        categories: JSON.parse(blog.categories || '[]'),
        tags: JSON.parse(blog.tags || '[]'),
      }))
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.select('tbl_blogs', '*', 'id = ?', [id]);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      ...blog,
      categories: JSON.parse(blog.categories || '[]'),
      tags: JSON.parse(blog.tags || '[]'),
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createBlog, updateBlog, deleteBlog, getAllBlogs, getBlogById };