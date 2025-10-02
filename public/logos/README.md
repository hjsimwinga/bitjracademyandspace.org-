# Partner Logos

Upload partner organization logos here for the Partners page.

## How to Add Partner Logos:

### Step 1: Upload Logo Files
1. Save your partner logo files in this folder: `public/logos/`
2. Use descriptive filenames like:
   - `bitcoin-foundation.png`
   - `lightning-network.jpg`
   - `educational-partners.svg`

### Step 2: Update the Data File
1. Open `data/partners.json`
2. Add your partner information:
```json
[
  { "name": "Partner Name", "logo": "/static/logos/your-logo-file.png" },
  { "name": "Another Partner", "logo": "/static/logos/another-logo.png" }
]
```

### Step 3: Logo Specifications
- **Formats**: PNG, JPG, SVG (PNG recommended for transparency)
- **Size**: 200x100 pixels or similar aspect ratio
- **Background**: Transparent PNG preferred
- **Quality**: High resolution for crisp display

### Current Partner Slots:
1. Bitcoin Foundation
2. Lightning Network  
3. Bitcoin Education
4. Kids Bitcoin
5. Educational Partners
6. Community Support

### Notes:
- Logos will automatically appear on the Partners page
- If a logo file is missing, it will show with reduced opacity
- The page uses a responsive grid layout
- Hover effects are included for better interactivity

