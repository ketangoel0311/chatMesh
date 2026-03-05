import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const srcDir = path.join(__dirname, 'src');

const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src)) {
    const from = path.join(src, entry);
    const to   = path.join(dest, entry);
    fs.statSync(from).isDirectory() ? copyDir(from, to) : fs.copyFileSync(from, to);
  }
};

copyDir(srcDir, distDir);
