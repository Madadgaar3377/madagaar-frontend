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
  content = content.replace(/,\s*navigate\]/g, ", router]");
  content = content.replace(/\[\s*navigate\s*\]/g, "[router]");
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Updated:", file);
  }
}

// Rewrite app route entry files without BOM
const routes = {
  "page.js": "../views/clients/HomePages",
  "about/page.js": "../../views/clients/About",
  "not-found.js": "../views/404Page",
};

for (const [rel, importPath] of Object.entries(routes)) {
  const filePath = path.join("src/app", rel);
  const content = `'use client';\n\nimport Page from '${importPath}';\nexport default Page;\n`;
  fs.writeFileSync(filePath, content);
  console.log("Rewrote:", filePath);
}
