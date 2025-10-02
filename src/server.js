import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as QRCode from 'qrcode';
import multer from 'multer';
import dotenv from 'dotenv';
import session from 'express-session';

// Load environment variables (suppress console output)
const originalLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalLog;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;


// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

// Static files with cache control
const staticOptions = {
  maxAge: '1h', // Cache static files for 1 hour instead of 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // CSS and JS can be cached shorter for easier updates
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
  }
};

app.use('/static', express.static(path.join(__dirname, '..', 'public'), staticOptions));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images'), staticOptions));

// Cache Control Middleware - Prevent caching of HTML pages
app.use((req, res, next) => {
  // Don't cache HTML pages
  if (!req.path.startsWith('/static') && !req.path.startsWith('/images') && !req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Admin authentication middleware (disabled - no password required)
const requireAdminAuth = (req, res, next) => {
  // Always allow access - no authentication required
  return next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'images', 'blog');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multer for event flyers
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'events');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Multer destination error:', error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'flyer-' + uniqueSuffix + path.extname(file.originalname));
    } catch (error) {
      console.error('Multer filename error:', error);
      cb(error, null);
    }
  }
});

const uploadEventFlyer = multer({ 
  storage: eventStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    try {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    } catch (error) {
      console.error('Multer fileFilter error:', error);
      cb(error, false);
    }
  }
});

// Data helpers
const dataDir = path.join(__dirname, '..', 'data');
const readJson = (file, fallback) => {
  try {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Global site data with version for cache busting
const site = {
  title: 'BitJR Academy & Space',
  tagline: 'Bitcoin education for kids (6–17) and a circular sats economy',
  version: Date.now(), // Cache busting version number
};

// Routes - Root route with admin subdomain detection
app.get('/', (req, res) => {
  const isAdminSubdomain = req.get('host') && req.get('host').startsWith('admin.');
  
  // If on admin subdomain, serve admin panel directly
  if (isAdminSubdomain) {
    return res.render('admin/index', { site, isAdminSubdomain: true });
  }
  
  // Otherwise serve the regular homepage
  const posts = readJson('posts.json', {});
  const events = readJson('events.json', []);
  res.render('pages/home', { site, posts: Object.values(posts).slice(0, 3), events: events.slice(0, 4), isHomePage: true });
});

app.get('/about', (req, res) => {
  res.render('pages/about', { site });
});

app.get('/activities', (req, res) => {
  res.render('pages/activities', { site });
});

// Activity detail pages
app.get('/activities/teacher-training', (req, res) => {
  res.render('pages/activities/teacher-training', { site });
});

app.get('/activities/graduation-meetups', (req, res) => {
  res.render('pages/activities/graduation-meetups', { site });
});

app.get('/activities/holiday-cohorts-school-break', (req, res) => {
  res.render('pages/activities/holiday-cohorts-school-break', { site });
});

app.get('/activities/conferences-workshops', (req, res) => {
  res.render('pages/activities/conferences-workshops', { site });
});

app.get('/activities/conference-workshops', (req, res) => {
  res.redirect('/activities/conferences-workshops');
});

app.get('/activities/money-playground', (req, res) => {
  res.render('pages/activities/money-playground', { site });
});

app.get('/activities/bitcoin-basics', (req, res) => {
  res.render('pages/activities/bitcoin-basics', { site });
});

app.get('/activities/builders-club', (req, res) => {
  res.render('pages/activities/builders-club', { site });
});

app.get('/activities/entrepreneur-kids', (req, res) => {
  res.render('pages/activities/entrepreneur-kids', { site });
});

app.get('/activities/coming-soon', (req, res) => {
  res.render('pages/activities/coming-soon', { site });
});

app.get('/activities/satoshi-playground', (req, res) => {
  res.render('pages/activities/satoshi-playground', { site });
});

app.get('/activities/bjas-bit-quiz', (req, res) => {
  res.render('pages/activities/bjas-bit-quiz', { site });
});

app.get('/activities/area-satoshi-club', (req, res) => {
  res.render('pages/activities/area-satoshi-club', { site });
});

app.get('/team', (req, res) => {
  const team = readJson('team.json', []);
  res.render('pages/team', { site, team });
});

app.get('/partners', (req, res) => {
  const partners = readJson('partners.json', []);
  res.render('pages/partners', { site, partners });
});

// Blog
app.get('/blog', (req, res) => {
  const posts = readJson('posts.json', {});
  // Show all posts (published and those without status field)
  const list = Object.values(posts)
    .filter(post => !post.status || post.status === 'published')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  res.render('pages/blog', { site, posts: list });
});

app.get('/blog/:slug', (req, res) => {
  const posts = readJson('posts.json', {});
  const post = posts[req.params.slug];
  if (!post || (post.status && post.status !== 'published')) return res.status(404).render('pages/404', { site });
  res.render('pages/blog-detail', { site, post });
});

// Contact
app.get('/contact', (req, res) => {
  res.render('pages/contact', { site, submitted: false });
});

app.post('/contact', (req, res) => {
  const submissionsPath = path.join(dataDir, 'submissions.json');
  const data = readJson('submissions.json', []);
  data.push({ ...req.body, createdAt: new Date().toISOString() });
  fs.writeFileSync(submissionsPath, JSON.stringify(data, null, 2));
  res.render('pages/contact', { site, submitted: true });
});

// Volunteer
app.get('/volunteer', (req, res) => {
  const nationality = req.query.nationality;
  res.render('pages/volunteer', { site, submitted: false, nationality });
});

app.post('/volunteer', (req, res) => {
  const volunteersPath = path.join(dataDir, 'volunteers.json');
  const data = readJson('volunteers.json', []);
  data.push({ ...req.body, createdAt: new Date().toISOString() });
  fs.writeFileSync(volunteersPath, JSON.stringify(data, null, 2));
  res.render('pages/volunteer', { site, submitted: true, nationality: req.body.nationality });
});

// Donations
app.get('/donate', (req, res) => {
  const lnAddr = 'bitjracademyandspace@blink.sv';
  const btcAddr = 'bc1qcyeekgu7wdnyanm5vtfjxsdwaqnuy36dxth80a';
  const lnPayload = `lightning:${lnAddr}`;
  const btcPayload = `bitcoin:${btcAddr}`;
  Promise.all([
    QRCode.toDataURL(lnPayload, { margin: 1, width: 220 }),
    QRCode.toDataURL(btcPayload, { margin: 1, width: 220 }),
  ]).then(([lnQr, btcQr]) => {
    res.render('pages/donate', { site, lnAddr, btcAddr, lnQr, btcQr });
  }).catch(() => {
    res.render('pages/donate', { site, lnAddr, btcAddr, lnQr: null, btcQr: null });
  });
});

// Events & Calendar
app.get('/events', (req, res) => {
  const events = readJson('events.json', []);
  res.render('pages/events', { site, events });
});

app.get('/events/calendar', (req, res) => {
  const events = readJson('events.json', []);
  res.json(events);
});

app.get('/events/:id/register', (req, res) => {
  const events = readJson('events.json', []);
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).render('pages/404', { site });
  res.render('pages/event-register', { site, event, submitted: false });
});

app.post('/events/:id/register', (req, res) => {
  const registrationsPath = path.join(dataDir, 'registrations.json');
  const events = readJson('events.json', []);
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).render('pages/404', { site });
  const registrations = readJson('registrations.json', []);
  registrations.push({ eventId: req.params.id, ...req.body, createdAt: new Date().toISOString() });
  fs.writeFileSync(registrationsPath, JSON.stringify(registrations, null, 2));
  res.render('pages/event-register', { site, event, submitted: true });
});

// Admin Authentication Routes (no password required)
app.get('/admin/login', (req, res) => {
  // Redirect directly to admin panel - no login required
  res.redirect('/admin');
});

app.post('/admin/authenticate', (req, res) => {
  // No authentication required - redirect to admin panel
  res.redirect('/admin');
});

app.get('/admin/logout', (req, res) => {
  // No logout needed since there's no authentication - redirect to admin
  res.redirect('/admin');
});

// Admin Portal Routes
app.get('/admin', requireAdminAuth, (req, res) => {
  // If accessed via admin subdomain, make sure all admin assets work correctly
  const isAdminSubdomain = req.get('host') && req.get('host').startsWith('admin.');
  res.render('admin/index', { site, isAdminSubdomain });
});

// Root route already defined above - removed duplicate

app.get('/admin/blogs', requireAdminAuth, (req, res) => {
  const isAdminSubdomain = req.get('host') && req.get('host').startsWith('admin.');
  res.render('admin/blogs', { site, isAdminSubdomain });
});

app.get('/admin/events', requireAdminAuth, (req, res) => {
  const isAdminSubdomain = req.get('host') && req.get('host').startsWith('admin.');
  res.render('admin/events', { site, isAdminSubdomain });
});

// API Routes for Admin
app.get('/api/stats', requireAdminAuth, (req, res) => {
  const posts = readJson('posts.json', {});
  const events = readJson('events.json', []);
  const team = readJson('team.json', []);
  const partners = readJson('partners.json', []);
  
  res.json({
    blogs: Object.keys(posts).length,
    events: events.length,
    team: team.length,
    partners: partners.length
  });
});

// Blog API Routes
app.get('/api/blogs', requireAdminAuth, (req, res) => {
  const posts = readJson('posts.json', {});
  res.json(posts);
});

app.get('/api/blogs/:slug', requireAdminAuth, (req, res) => {
  const posts = readJson('posts.json', {});
  const post = posts[req.params.slug];
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.post('/api/blogs', requireAdminAuth, upload.any(), (req, res) => {
  const posts = readJson('posts.json', {});
  const { title, slug, date, status, excerpt, content, scheduleDate, coverPhotoOrder } = req.body;
  
  if (!title || !slug || !date || !excerpt || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const postData = { 
    title, 
    slug, 
    date, 
    status: status || 'published', 
    excerpt, 
    content,
    createdAt: new Date().toISOString()
  };
  
  // Add schedule date if provided
  if (scheduleDate) {
    postData.scheduleDate = scheduleDate;
  }
  
  // Add images if uploaded
  if (req.files && req.files.length > 0) {
    const imageFiles = req.files.filter(file => file.fieldname === 'blogImage');
    if (imageFiles.length > 0) {
      let images = imageFiles.map(file => `/images/blog/${file.filename}`);
      
      // Reorder images based on cover photo selection
      if (coverPhotoOrder) {
        try {
          const orderData = JSON.parse(coverPhotoOrder);
          const coverPhotoIndex = orderData.findIndex(item => item.isCoverPhoto);
          if (coverPhotoIndex !== -1 && coverPhotoIndex < images.length) {
            // Move cover photo to first position
            const coverPhoto = images[coverPhotoIndex];
            images.splice(coverPhotoIndex, 1);
            images.unshift(coverPhoto);
          }
        } catch (e) {
          console.log('Error parsing cover photo order:', e);
        }
      }
      
      postData.images = images;
    }
  }
  
  posts[slug] = postData;
  
  const postsPath = path.join(dataDir, 'posts.json');
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  
  res.json({ success: true });
});

app.put('/api/blogs/:slug', requireAdminAuth, upload.any(), (req, res) => {
  const posts = readJson('posts.json', {});
  const { title, slug, date, status, excerpt, content, scheduleDate, existingImages, coverPhotoOrder } = req.body;
  
  if (!title || !slug || !date || !excerpt || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // If slug changed, remove old entry
  if (req.params.slug !== slug && posts[req.params.slug]) {
    delete posts[req.params.slug];
  }
  
  const postData = { 
    title, 
    slug, 
    date, 
    status: status || 'published', 
    excerpt, 
    content,
    updatedAt: new Date().toISOString()
  };
  
  // Preserve creation date
  if (posts[req.params.slug] && posts[req.params.slug].createdAt) {
    postData.createdAt = posts[req.params.slug].createdAt;
  }
  
  // Add schedule date if provided
  if (scheduleDate) {
    postData.scheduleDate = scheduleDate;
  }
  
  // Handle images
  let images = [];
  
  // Add existing images if provided
  if (existingImages) {
    try {
      const existing = JSON.parse(existingImages);
      images = Array.isArray(existing) ? existing : [];
    } catch (e) {
      // If parsing fails, check if it's a comma-separated string
      if (typeof existingImages === 'string' && existingImages.includes(',')) {
        images = existingImages.split(',').map(img => img.trim()).filter(img => img.length > 0);
      } else {
        images = [existingImages];
      }
    }
  }
  
  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const imageFiles = req.files.filter(file => file.fieldname === 'blogImage');
    if (imageFiles.length > 0) {
      const newImages = imageFiles.map(file => `/images/blog/${file.filename}`);
      images = [...images, ...newImages];
    }
  }
  
  // Reorder images based on cover photo selection
  if (coverPhotoOrder) {
    try {
      const orderData = JSON.parse(coverPhotoOrder);
      const coverPhotoIndex = orderData.findIndex(item => item.isCoverPhoto);
      if (coverPhotoIndex !== -1 && coverPhotoIndex < images.length) {
        // Move cover photo to first position
        const coverPhoto = images[coverPhotoIndex];
        images.splice(coverPhotoIndex, 1);
        images.unshift(coverPhoto);
      }
    } catch (e) {
      console.log('Error parsing cover photo order:', e);
    }
  }
  
  // If no existing images and no new images, keep old ones
  if (images.length === 0 && posts[req.params.slug] && posts[req.params.slug].images) {
    images = posts[req.params.slug].images;
  }
  
  if (images.length > 0) {
    postData.images = images;
  }
  
  posts[slug] = postData;
  
  const postsPath = path.join(dataDir, 'posts.json');
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  
  res.json({ success: true });
});

app.delete('/api/blogs/:slug', requireAdminAuth, (req, res) => {
  const posts = readJson('posts.json', {});
  
  if (!posts[req.params.slug]) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  delete posts[req.params.slug];
  
  const postsPath = path.join(dataDir, 'posts.json');
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  
  res.json({ success: true });
});

// Events API Routes
app.get('/api/events', requireAdminAuth, (req, res) => {
  console.log('GET /api/events - Loading events...');
  const events = readJson('events.json', []);
  console.log('GET /api/events - Events loaded:', events);
  res.json(events);
});

app.get('/api/events/:id', requireAdminAuth, (req, res) => {
  const events = readJson('events.json', []);
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.post('/api/events', requireAdminAuth, (req, res) => {
  uploadEventFlyer.single('flyer')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    
    try {
      const events = readJson('events.json', []);
      const { title, date, location, summary } = req.body;
      
      if (!title || !date || !location || !summary) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const newEvent = {
        id: 'ev-' + Date.now(),
        title,
        date,
        location,
        summary,
        flyer: req.file ? `/images/events/${req.file.filename}` : null
      };
      
      events.push(newEvent);
      
      const eventsPath = path.join(dataDir, 'events.json');
      fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
      
      res.json({ success: true, event: newEvent });
    } catch (error) {
      console.error('Error in POST /api/events:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });
});

app.put('/api/events/:id', requireAdminAuth, (req, res) => {
  console.log('PUT /api/events/:id - ID:', req.params.id);
  uploadEventFlyer.single('flyer')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    
    try {
      const events = readJson('events.json', []);
      const { title, date, location, summary, removeFlyer } = req.body;
      
      console.log('PUT /api/events/:id - Body:', { title, date, location, summary, removeFlyer });
      console.log('PUT /api/events/:id - File:', req.file);
      
      if (!title || !date || !location || !summary) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const eventIndex = events.findIndex(e => e.id === req.params.id);
      console.log('Event index found:', eventIndex);
      
      if (eventIndex === -1) {
        console.log('Event not found');
        return res.status(404).json({ error: 'Event not found' });
      }
      
      const updatedEvent = { 
        ...events[eventIndex], 
        title, 
        date, 
        location, 
        summary 
      };
      
      // Handle flyer updates
      if (req.file) {
        console.log('New flyer uploaded:', req.file.filename);
        updatedEvent.flyer = `/images/events/${req.file.filename}`;
      } else if (removeFlyer === 'true') {
        console.log('Removing flyer');
        updatedEvent.flyer = null;
      } else {
        console.log('No new flyer, keeping existing:', events[eventIndex].flyer);
        // Keep existing flyer if no new file uploaded and not removing
        updatedEvent.flyer = events[eventIndex].flyer;
      }
      
      events[eventIndex] = updatedEvent;
      
      const eventsPath = path.join(dataDir, 'events.json');
      fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
      
      console.log('Event updated successfully');
      console.log('Updated event:', updatedEvent);
      console.log('All events after update:', events);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error in PUT /api/events/:id:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });
});

app.delete('/api/events/:id', requireAdminAuth, (req, res) => {
  const events = readJson('events.json', []);
  const eventIndex = events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  events.splice(eventIndex, 1);
  
  const eventsPath = path.join(dataDir, 'events.json');
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
  
  res.json({ success: true });
});

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { site });
});

// Scheduled post checker
function checkScheduledPosts() {
  const posts = readJson('posts.json', {});
  const now = new Date();
  let hasChanges = false;
  
  Object.keys(posts).forEach(slug => {
    const post = posts[slug];
    if (post.status === 'scheduled' && post.scheduleDate) {
      const scheduleDate = new Date(post.scheduleDate);
      if (scheduleDate <= now) {
        posts[slug].status = 'published';
        posts[slug].date = scheduleDate.toISOString().split('T')[0];
        posts[slug].scheduledAt = new Date().toISOString();
        hasChanges = true;
        console.log(`Scheduled post "${post.title}" has been published.`);
      }
    }
  });
  
  if (hasChanges) {
    const postsPath = path.join(dataDir, 'posts.json');
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  }
}

// Content image upload route
app.post('/api/upload-content-image', requireAdminAuth, upload.single('contentImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  
  // Resize image to small size (optional - you can add image processing here)
  const imageUrl = `/images/blog/${req.file.filename}`;
  
  res.json({ 
    success: true, 
    imageUrl: imageUrl,
    message: 'Image uploaded successfully'
  });
});

// Admin Cache Management Routes
app.post('/api/admin/clear-cache', requireAdminAuth, (req, res) => {
  // Update version number to bust cache
  site.version = Date.now();
  
  res.json({ 
    success: true, 
    message: 'Cache version updated. New version: ' + site.version,
    version: site.version
  });
});

app.post('/api/admin/restart-server', requireAdminAuth, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server restart requested. If using PM2, run: pm2 restart bitjr-website' 
  });
  
  // Give response time to send before exiting
  setTimeout(() => {
    console.log('Server restart requested via admin panel');
    process.exit(0);
  }, 1000);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

// Check for scheduled posts every minute
setInterval(checkScheduledPosts, 60000);

app.listen(PORT, () => {
  console.log('\n🚀 BitJR Academy & Space Server Started!');
  console.log(`🌐 Main Website: http://localhost:${PORT}`);
  console.log(`⚙️ Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`📅 Scheduled post checker is running...`);
  console.log('───────────────────────────────────────');
});


