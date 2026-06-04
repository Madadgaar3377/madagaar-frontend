import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

for (const file of walk("src")) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  content = content.replace(/router\.push\(\s*-1\s*\)/g, "router.back()");
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Updated:", file);
  }
}
