import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

const files = [...walk("src/app"), "src/app/not-found.js"].filter((f) => fs.existsSync(f));

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  content = content.replace(/\/pages\//g, "/views/");
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Updated:", file);
  }
}
