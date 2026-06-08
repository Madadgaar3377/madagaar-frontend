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

function migrateFile(file) {
  if (file.endsWith("App.js") || file.endsWith("index.js")) return false;

  let content = fs.readFileSync(file, "utf8");
  const original = content;

  if (!content.includes("react-router-dom") && !content.includes("useLocation(")) {
    return false;
  }

  content = content.replace(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react-router-dom['"];?\s*\n/gm, (match, imports) => {
    const parts = imports.split(",").map((s) => s.trim()).filter(Boolean);
    const nextImports = new Set();
    let needsLink = false;

    for (const p of parts) {
      if (p === "Link" || p === "NavLink") {
        needsLink = true;
        continue;
      }
      if (p === "useNavigate") nextImports.add("useRouter");
      else if (p === "useLocation") nextImports.add("usePathname");
      else if (p === "useParams" || p === "useSearchParams") nextImports.add(p);
      else if (p === "Navigate" || p === "BrowserRouter" || p === "Routes" || p === "Route" || p === "Outlet") {
        continue;
      }
    }

    let result = "";
    if (needsLink) result += "import Link from 'next/link';\n";
    if (nextImports.size) result += `import { ${[...nextImports].join(", ")} } from 'next/navigation';\n`;
    return result || "";
  });

  content = content.replace(/\bto=\{/g, "href={");
  content = content.replace(/\bto="/g, 'href="');
  content = content.replace(/\bto='/g, "href='");
  content = content.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();");
  content = content.replace(
    /\bnavigate\((['"][^'"]+['"])\s*,\s*\{\s*replace:\s*true\s*\}\)/g,
    "router.replace($1)"
  );
  content = content.replace(/\bnavigate\(/g, "router.push(");
  content = content.replace(/\bNavLink\b/g, "Link");
  content = content.replace(/const location = useLocation\(\);/g, "const pathname = usePathname();");
  content = content.replace(/location\.pathname/g, "pathname");
  content = content.replace(/location\.search/g, "searchParams.toString()");

  content = content.replace(
    /return\s*<Navigate\s+href=(['"][^'"]+['"])\s+replace\s*\/>;/g,
    "return null;"
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Updated:", file);
    return true;
  }
  return false;
}

const files = walk("src");
let count = 0;
for (const file of files) {
  if (migrateFile(file)) count++;
}
console.log(`Done. Updated ${count} files.`);
