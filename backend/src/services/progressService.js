const progressStreams = new Map();

export function startProgressStream(id, res) {
  if (progressStreams.has(id)) {
    progressStreams.get(id).end();
  }
  progressStreams.set(id, res);
}

export function updateProgress(id, data) {
  const res = progressStreams.get(id);
  if (res) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

export function cancelProgress(id) {
  const res = progressStreams.get(id);
  if (res) {
    res.end();
    progressStreams.delete(id);
  }
}

export function getProgressStream(id) {
  return progressStreams.get(id);
}
