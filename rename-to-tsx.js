const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
        const newPath = fullPath.replace(/\.jsx?$/, '.tsx');
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed ${fullPath} to ${newPath}`);
      }
    }
  }
}

walk(dir);
console.log("Renaming complete.");
