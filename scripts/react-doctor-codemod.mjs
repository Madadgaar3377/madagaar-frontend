import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "src");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx|tsx|js|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function fixTailwind(content) {
  let next = content;
  next = next.replace(/\bw-(\d+)\s+h-\1\b/g, "size-$1");
  next = next.replace(/\bh-(\d+)\s+w-\1\b/g, "size-$1");
  next = next.replace(/\bw-(\[[^\]]+\])\s+h-\1\b/g, "size-$1");
  next = next.replace(/\bh-(\[[^\]]+\])\s+w-\1\b/g, "size-$1");
  next = next.replace(/\bpx-(\d+)\s+py-\1\b/g, "p-$1");
  next = next.replace(/\bpy-(\d+)\s+px-\1\b/g, "p-$1");
  return next;
}

function fixButtonType(content) {
  return content.replace(/<button(\s(?![^>]*\btype=)[^>]*)>/g, '<button type="button"$1>');
}

function fixLabelAssociations(content) {
  const pattern =
    /<label(?![^>]*\bhtmlFor=)([^>]*)>([\s\S]*?)<\/label>\s*\n(\s*)<(input|select|textarea)((?:(?!\bid=)[\s\S])*?\bname="([^"]+)"(?:(?!\bid=)[\s\S])*?)(\s*\/)?>/g;

  return content.replace(
    pattern,
    (_match, labelAttrs, labelInner, indent, tag, controlAttrs, name, slash) =>
      `<label htmlFor="${name}"${labelAttrs}>${labelInner}</label>\n${indent}<${tag} id="${name}"${controlAttrs}${slash || ""}>`
  );
}

function fixGenericFormHandlers(content) {
  if (!/\bhandleChange\b/.test(content)) return content;
  return content.replace(/\bhandleChange\b/g, "updateFormField");
}

let changed = 0;
for (const file of walk(SRC)) {
  const original = fs.readFileSync(file, "utf8");
  let updated = fixTailwind(original);
  updated = fixButtonType(updated);
  let prev;
  do {
    prev = updated;
    updated = fixLabelAssociations(updated);
  } while (updated !== prev);
  updated = fixGenericFormHandlers(updated);
  if (updated !== original) {
    fs.writeFileSync(file, updated, "utf8");
    changed += 1;
  }
}

console.log(`Updated ${changed} files`);
