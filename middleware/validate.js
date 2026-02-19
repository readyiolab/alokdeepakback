const validateContactForm = (req, res, next) => {
    const { name, email, subject, message } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validSubjects = [
        'Digital Marketing Course Inquiry',
        'Hiring Needs',
        'Agency Services',
        'Website Development',
        'General Inquiry'
    ];

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All required fields must be filled' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validSubjects.includes(subject)) {
        return res.status(400).json({ error: 'Invalid subject selected' });
    }

    next();
};

const validateNewsletter = (req, res, next) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    next();
};

const validateBlog = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { title, content, author, status, categories } = req.body;

  if (!title || !content || !author || !status) {
    return res.status(400).json({ error: 'Title, content, author, and status are required' });
  }

  if (!['draft', 'published', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Adjust categories validation to handle string input (since form-data sends categories as a string)
  if (categories && typeof categories !== 'string') {
    return res.status(400).json({ error: 'Categories must be a comma-separated string' });
  }

  next();
};

module.exports = { validateContactForm, validateNewsletter, validateBlog };