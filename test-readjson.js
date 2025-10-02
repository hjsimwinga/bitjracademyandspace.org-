const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
console.log('dataDir:', dataDir);

const readJson = (file, fallback) => {
  try {
    const filePath = path.join(dataDir, file);
    console.log('readJson - filePath:', filePath);
    console.log('readJson - file exists:', fs.existsSync(filePath));
    if (!fs.existsSync(filePath)) {
      console.log('readJson - file does not exist, returning fallback');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    console.log('readJson - raw length:', raw ? raw.length : 'null');
    console.log('readJson - raw preview:', raw ? raw.substring(0, 100) : 'null');
    const parsed = raw ? JSON.parse(raw) : fallback;
    console.log('readJson - parsed keys:', Object.keys(parsed));
    return parsed;
  } catch (e) {
    console.log('readJson - error:', e.message);
    return fallback;
  }
};

const posts = readJson('posts.json', {});
console.log('Final result:', posts);
console.log('Final keys:', Object.keys(posts));
