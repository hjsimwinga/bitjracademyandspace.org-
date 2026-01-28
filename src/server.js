import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as QRCode from 'qrcode';
import multer from 'multer';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Email (SMTP)
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailTo = process.env.MAIL_TO || 'bitjracademyandspace@gmail.com';
const mailFrom = process.env.MAIL_FROM || 'bitjracademyandspace@gmail.com';
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

const mailer = (smtpHost && smtpUser && smtpPass && mailTo)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    })
  : null;

const formatFields = (fields) => Object.entries(fields || {})
  .filter(([, value]) => value !== undefined && value !== null && value !== '')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n');

const sendMailSafe = async ({ subject, text, replyTo, to }) => {
  if (!mailer || !mailFrom) {
    console.warn('Email not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO.');
    return;
  }

  try {
    await mailer.sendMail({
      from: mailFrom,
      to: to || mailTo,
      subject,
      text,
      replyTo
    });
  } catch (error) {
    console.error('Email send failed:', error);
  }
};


// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('layout', 'partials/layout');
app.use(expressLayouts);

// Static
app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

const getFileVersion = (file) => {
  try {
    const filePath = path.join(dataDir, file);
    return fs.statSync(filePath).mtimeMs;
  } catch (e) {
    return 0;
  }
};

// Global site data
const site = {
  title: 'BitJR Academy & Space',
  tagline: 'Bitcoin education for kids (6–17) and a circular sats economy',
};

// Routes
app.get('/', (req, res) => {
  const events = readJson('events.json', []);
  const gallery = readJson('gallery.json', []);
  const livePoll = readJson('live-poll.json', {});
  const galleryVersion = getFileVersion('gallery.json');
  res.render('pages/home', { site, events: events.slice(0, 4), gallery, livePoll, galleryVersion, isHomePage: true });
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

// Contact
app.get('/contact', (req, res) => {
  res.render('pages/contact', { site, submitted: false });
});

app.post('/contact', async (req, res) => {
  const submissionsPath = path.join(dataDir, 'submissions.json');
  const data = readJson('submissions.json', []);
  const createdAt = new Date().toISOString();
  data.push({ ...req.body, createdAt });
  fs.writeFileSync(submissionsPath, JSON.stringify(data, null, 2));
  await sendMailSafe({
    subject: `New contact message from ${req.body.name || 'Website visitor'}`,
    replyTo: req.body.email,
    text: formatFields({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      createdAt
    })
  });
  if (req.body.email) {
    await sendMailSafe({
      to: req.body.email,
      subject: 'We received your message',
      text: [
        'Thanks for reaching out to BitJR Academy & Space.',
        'We received your message and will reply soon.',
        '',
        formatFields({
          name: req.body.name,
          email: req.body.email,
          message: req.body.message,
          createdAt
        })
      ].join('\n')
    });
  }
  res.render('pages/contact', { site, submitted: true });
});

// Volunteer
app.get('/volunteer', (req, res) => {
  const nationality = req.query.nationality;
  res.render('pages/volunteer', { site, submitted: false, nationality });
});

app.post('/volunteer', async (req, res) => {
  const volunteersPath = path.join(dataDir, 'volunteers.json');
  const data = readJson('volunteers.json', []);
  const createdAt = new Date().toISOString();
  data.push({ ...req.body, createdAt });
  fs.writeFileSync(volunteersPath, JSON.stringify(data, null, 2));
  await sendMailSafe({
    subject: `New volunteer application: ${req.body.name || 'Unknown'}`,
    replyTo: req.body.email,
    text: formatFields({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      nationality: req.body.nationality,
      motivation: req.body.motivation,
      skills: req.body.skills,
      travel_costs: req.body.travel_costs,
      local_arrangements: req.body.local_arrangements,
      location: req.body.location,
      transportation: req.body.transportation,
      availability: req.body.availability,
      local_travel_costs: req.body.local_travel_costs,
      createdAt
    })
  });
  if (req.body.email) {
    await sendMailSafe({
      to: req.body.email,
      subject: 'We received your volunteer application',
      text: [
        'Thanks for applying to volunteer with BitJR Academy & Space.',
        'We received your application and will be in touch soon.',
        '',
        formatFields({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          nationality: req.body.nationality,
          createdAt
        })
      ].join('\n')
    });
  }
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

app.post('/events/:id/register', async (req, res) => {
  const registrationsPath = path.join(dataDir, 'registrations.json');
  const events = readJson('events.json', []);
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).render('pages/404', { site });
  const registrations = readJson('registrations.json', []);
  const createdAt = new Date().toISOString();
  registrations.push({ eventId: req.params.id, ...req.body, createdAt });
  fs.writeFileSync(registrationsPath, JSON.stringify(registrations, null, 2));
  await sendMailSafe({
    subject: `New event registration: ${event.title}`,
    replyTo: req.body.email,
    text: formatFields({
      event: event.title,
      date: event.date,
      location: event.location,
      participant: req.body.name,
      age: req.body.age,
      email: req.body.email,
      notes: req.body.notes,
      createdAt
    })
  });
  if (req.body.email) {
    await sendMailSafe({
      to: req.body.email,
      subject: `Registration received: ${event.title}`,
      text: [
        'Thanks for registering with BitJR Academy & Space.',
        'We received your registration details below.',
        '',
        formatFields({
          event: event.title,
          date: event.date,
          location: event.location,
          participant: req.body.name,
          age: req.body.age,
          email: req.body.email,
          notes: req.body.notes,
          createdAt
        })
      ].join('\n')
    });
  }
  res.render('pages/event-register', { site, event, submitted: true });
});

// Admin Portal Routes
app.get('/admin', (req, res) => {
  res.render('admin/index', { site, layout: false });
});

app.get('/admin/events', (req, res) => {
  res.render('admin/events', { site, layout: false });
});

app.get('/admin/team', (req, res) => {
  res.render('admin/team', { site, layout: false });
});

app.get('/admin/partners', (req, res) => {
  res.render('admin/partners', { site, layout: false });
});

app.get('/admin/gallery', (req, res) => {
  res.render('admin/gallery', { site, layout: false });
});

app.get('/admin/polls', (req, res) => {
  res.render('admin/polls', { site, layout: false });
});

// API Routes for Admin
app.get('/api/stats', (req, res) => {
  const events = readJson('events.json', []);
  const team = readJson('team.json', []);
  const partners = readJson('partners.json', []);
  
  res.json({
    events: events.length,
    team: team.length,
    partners: partners.length
  });
});

// Events API Routes
app.get('/api/events', (req, res) => {
  console.log('GET /api/events - Loading events...');
  const events = readJson('events.json', []);
  console.log('GET /api/events - Events loaded:', events);
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const events = readJson('events.json', []);
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// Team API Routes
app.get('/api/team', (req, res) => {
  const team = readJson('team.json', []);
  const withIds = team.map((member, index) => ({ id: String(index), ...member }));
  res.json(withIds);
});

app.get('/api/team/:id', (req, res) => {
  const team = readJson('team.json', []);
  const index = Number(req.params.id);
  if (Number.isNaN(index) || index < 0 || index >= team.length) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  res.json({ id: String(index), ...team[index] });
});

app.post('/api/team', (req, res) => {
  try {
    const { name, role, twitter, photo, bio } = req.body;
    if (!name || !role || !photo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const team = readJson('team.json', []);
    team.push({ name, role, twitter, photo, bio });
    const teamPath = path.join(dataDir, 'team.json');
    fs.writeFileSync(teamPath, JSON.stringify(team, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.put('/api/team/:id', (req, res) => {
  try {
    const team = readJson('team.json', []);
    const index = Number(req.params.id);
    if (Number.isNaN(index) || index < 0 || index >= team.length) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    const { name, role, twitter, photo, bio } = req.body;
    if (!name || !role || !photo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    team[index] = { name, role, twitter, photo, bio };
    const teamPath = path.join(dataDir, 'team.json');
    fs.writeFileSync(teamPath, JSON.stringify(team, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.delete('/api/team/:id', (req, res) => {
  const team = readJson('team.json', []);
  const index = Number(req.params.id);
  if (Number.isNaN(index) || index < 0 || index >= team.length) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  team.splice(index, 1);
  const teamPath = path.join(dataDir, 'team.json');
  fs.writeFileSync(teamPath, JSON.stringify(team, null, 2));
  res.json({ success: true });
});

app.post('/api/events', (req, res) => {
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

app.put('/api/events/:id', (req, res) => {
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

app.delete('/api/events/:id', (req, res) => {
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

// Partners API Routes
app.get('/api/partners', (req, res) => {
  const partners = readJson('partners.json', []);
  const withIds = partners.map((partner, index) => ({ id: String(index), ...partner }));
  res.json(withIds);
});

app.get('/api/partners/:id', (req, res) => {
  const partners = readJson('partners.json', []);
  const index = Number(req.params.id);
  if (Number.isNaN(index) || index < 0 || index >= partners.length) {
    return res.status(404).json({ error: 'Partner not found' });
  }
  res.json({ id: String(index), ...partners[index] });
});

app.post('/api/partners', (req, res) => {
  try {
    const { name, logo, website } = req.body;
    if (!name || !logo || !website) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const partners = readJson('partners.json', []);
    partners.push({ name, logo, website });
    const partnersPath = path.join(dataDir, 'partners.json');
    fs.writeFileSync(partnersPath, JSON.stringify(partners, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.put('/api/partners/:id', (req, res) => {
  try {
    const partners = readJson('partners.json', []);
    const index = Number(req.params.id);
    if (Number.isNaN(index) || index < 0 || index >= partners.length) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    const { name, logo, website } = req.body;
    if (!name || !logo || !website) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    partners[index] = { name, logo, website };
    const partnersPath = path.join(dataDir, 'partners.json');
    fs.writeFileSync(partnersPath, JSON.stringify(partners, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.delete('/api/partners/:id', (req, res) => {
  const partners = readJson('partners.json', []);
  const index = Number(req.params.id);
  if (Number.isNaN(index) || index < 0 || index >= partners.length) {
    return res.status(404).json({ error: 'Partner not found' });
  }
  partners.splice(index, 1);
  const partnersPath = path.join(dataDir, 'partners.json');
  fs.writeFileSync(partnersPath, JSON.stringify(partners, null, 2));
  res.json({ success: true });
});

// Gallery API Routes
app.get('/api/gallery', (req, res) => {
  const gallery = readJson('gallery.json', []);
  const withIds = gallery.map((item, index) => ({ id: String(index), ...item }));
  res.json(withIds);
});

app.get('/api/gallery/:id', (req, res) => {
  const gallery = readJson('gallery.json', []);
  const index = Number(req.params.id);
  if (Number.isNaN(index) || index < 0 || index >= gallery.length) {
    return res.status(404).json({ error: 'Gallery item not found' });
  }
  res.json({ id: String(index), ...gallery[index] });
});

app.post('/api/gallery', (req, res) => {
  try {
    const { src, alt } = req.body;
    if (!src) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const gallery = readJson('gallery.json', []);
    gallery.push({ src, alt });
    const galleryPath = path.join(dataDir, 'gallery.json');
    fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.put('/api/gallery/:id', (req, res) => {
  try {
    const gallery = readJson('gallery.json', []);
    const index = Number(req.params.id);
    if (Number.isNaN(index) || index < 0 || index >= gallery.length) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    const { src, alt } = req.body;
    if (!src) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    gallery[index] = { src, alt };
    const galleryPath = path.join(dataDir, 'gallery.json');
    fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.delete('/api/gallery/:id', (req, res) => {
  const gallery = readJson('gallery.json', []);
  const index = Number(req.params.id);
  if (Number.isNaN(index) || index < 0 || index >= gallery.length) {
    return res.status(404).json({ error: 'Gallery item not found' });
  }
  gallery.splice(index, 1);
  const galleryPath = path.join(dataDir, 'gallery.json');
  fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
  res.json({ success: true });
});

// Live Poll API Routes
app.get('/api/live-poll', (req, res) => {
  const livePoll = readJson('live-poll.json', {});
  res.json(livePoll);
});

app.put('/api/live-poll', (req, res) => {
  try {
    const { members, founded, satsAwarded, meetups } = req.body || {};
    if (!members || !founded || !satsAwarded || !meetups) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const livePoll = { members, founded, satsAwarded, meetups };
    const livePollPath = path.join(dataDir, 'live-poll.json');
    fs.writeFileSync(livePollPath, JSON.stringify(livePoll, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { site });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

const startServer = (port, attemptsLeft = 5) => {
  const server = app.listen(port, () => {
    console.log(`BitJR website running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1, attemptsLeft - 1);
      return;
    }

    console.error('Server failed to start:', err);
  });
};

startServer(PORT);


