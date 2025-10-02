# BitJR Academy & Space Website

Node.js (Express + EJS) website for BitJR Academy & Space — Bitcoin education for kids (6–17) and a playful circular sats economy.

## Features
- Home, About, Activities, Team, Partners, Blog, Contact, Volunteer, Donate
- Events list, simple calendar, and event registration
- JSON-based storage for demo (no external DB)
- Accessible, responsive, kid-friendly UI

## Requirements
- Node.js 18+

## Setup
```
npm install
npm run dev
# or
npm start
```
Visit http://localhost:3000

## Structure
```
src/server.js          # Express app and routes
views/                 # EJS templates
public/                # Static assets
data/                  # JSON data
```

## Customize
- Edit `data/*.json` for posts, events, partners, and team.
- Replace images/logos in `public/images` and `public/logos`.
- Tweak styles in `public/css/styles.css`.

## Notes
- Flat JSON is for demo only. Use a database for production.
- Donation details in `views/pages/donate.ejs` are placeholders.


