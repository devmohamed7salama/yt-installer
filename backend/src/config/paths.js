import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const DOWNLOAD_DIR = path.join(ROOT_DIR, 'downloads');

try {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    console.log('Created downloads directory:', DOWNLOAD_DIR);
  } else {
    console.log('Downloads directory exists:', DOWNLOAD_DIR);
  }
} catch (error) {
  console.error('Error creating downloads directory:', error.message);
}

export const paths = {
  root: ROOT_DIR,
  downloads: DOWNLOAD_DIR,
};

export const config = {
  port: process.env.PORT || 3001,
  maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 3,
};
