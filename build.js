const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const sourceFile = path.join(__dirname, 'index.html');

// Создаём папку public, если нет
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created directory: public/');
}

// Копируем index.html
if (fs.existsSync(sourceFile)) {
  fs.copyFileSync(sourceFile, path.join(publicDir, 'index.html'));
  console.log('Copied index.html to public/');
} else {
  console.error('index.html not found in root!');
  process.exit(1);
}

console.log('Build completed successfully!');