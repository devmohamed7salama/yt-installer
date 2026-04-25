const queue = [];
const history = [];

export function addToQueue(download) {
  queue.push(download);
  processNextDownload();
}

export function getQueue() {
  return queue;
}

export function removeFromQueue(id) {
  const index = queue.findIndex(d => d.id === id);
  if (index !== -1) {
    queue.splice(index, 1);
  }
}

export function cancelDownload(id) {
  const download = queue.find(d => d.id === id);
  if (download) {
    download.status = 'cancelled';
    removeFromQueue(id);
    addToHistory(download);
  }
}

export function getHistory() {
  return history;
}

export function addToHistory(download) {
  download.completedAt = new Date().toISOString();
  history.unshift(download);
}

export function clearHistory() {
  history.length = 0;
}

function processNextDownload() {
  if (queue.length === 0) return;
  
  const activeDownloads = queue.filter(d => d.status === 'downloading');
  if (activeDownloads.length >= 3) return;
  
  const nextDownload = queue.find(d => d.status === 'queued');
  if (nextDownload) {
    nextDownload.status = 'downloading';
  }
}
