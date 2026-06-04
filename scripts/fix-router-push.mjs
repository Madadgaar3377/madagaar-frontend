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
  content = content.replace(
    /router\.push\((['"][^'"]+['"])\s*,\s*\{\s*state:\s*([\s\S]*?)\s*\}\s*\)/g,
    "pushWithState(router, $1, $2)"
  );

  if (content !== original) {
    if (content.includes("pushWithState") && !content.includes("pushWithState")) {
      // no-op
    }
    if (content.includes("pushWithState") && !content.includes('from "../utils/navigationState"') && !content.includes("from '../../utils/navigationState'") && !content.includes("from '../../../utils/navigationState'")) {
      const depth = file.split(path.sep).length - 2;
      const prefix = "../".repeat(Math.max(depth - 1, 1));
      if (file.includes("Accounts")) {
        content = content.replace(
          /^(import .+\n)/,
          `$1import { pushWithState } from "../utils/navigationState";\n`
        );
      } else {
        content = content.replace(
          /^(import .+\n)/,
          `$1import { pushWithState } from "${prefix}utils/navigationState";\n`
        );
      }
    }
    fs.writeFileSync(file, content);
    console.log("Updated:", file);
  }
}
