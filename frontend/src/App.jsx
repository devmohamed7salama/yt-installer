import { useState, useEffect } from 'react';
import { Download, Moon, Sun, FolderOpen, Loader2, Music, Video } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';
import { analyzeUrl, downloadVideo, downloadPlaylist, getQueue, cancelDownload } from './services/api';
import { useProgress } from './hooks/useProgress';

function App() {
  const { darkMode, toggle } = useDarkMode();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('MP4');
  const [quality, setQuality] = useState('Best');
  const [analyzedData, setAnalyzedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showFiles, setShowFiles] = useState(false);
  
  const { progress } = useProgress(activeId);
  
  useEffect(() => {
    if (activeId && progress.status !== 'idle') {
      setDownloads(prev => prev.map(d => 
        d.id === activeId ? { ...d, progress: progress.progress, status: progress.status } : d
      ));
      if (progress.status === 'completed') {
        setActiveId(null);
        setDownloading(false);
      } else if (progress.status === 'failed') {
        setActiveId(null);
        setDownloading(false);
        setError('Download failed. Try again.');
      }
    }
  }, [progress]);
  
  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    if (showFiles) {
      loadDownloadedFiles();
    }
  }, [showFiles]);
  
  useEffect(() => {
    if (activeId && progress.status !== 'idle') {
      setDownloads(prev => prev.map(d => 
        d.id === activeId ? { ...d, progress: progress.progress, status: progress.status } : d
      ));
      if (progress.status === 'completed' || progress.status === 'failed') {
        setActiveId(null);
        loadQueue();
        loadDownloadedFiles();
      }
    }
  }, [progress]);

  const loadDownloadedFiles = async () => {
    try {
      const { spawn } = await import('child_process');
    } catch {
      setDownloadedFiles([{ name: 'Sample Video.mp4', size: 1024000 }]);
    }
  };
  
  const loadQueue = async () => {
    try {
      const data = await getQueue();
      setDownloads(data.queue || []);
    } catch (err) {
      console.error('Load queue error:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setAnalyzedData(null);
    
    try {
      const data = await analyzeUrl(url);
      setAnalyzedData(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;
    setDownloading(true);
    setError(null);
    
    try {
      let result;
      if (analyzedData?.type === 'playlist') {
        result = await downloadPlaylist(url, format, quality);
      } else {
        result = await downloadVideo(url, format, quality);
      }
      setDownloads([{ id: result.id, url, format, quality, progress: 0, status: 'downloading' }]);
      setActiveId(result.id);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setDownloading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelDownload(id);
      setDownloads(prev => prev.filter(d => d.id !== id));
      if (activeId === id) setActiveId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const isPlaylist = analyzedData?.type === 'playlist';
  const videoCount = analyzedData?.videoCount || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-bold">YT Installer</h1>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>
      
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Enter YouTube URL</h2>
          <div className="flex flex-col sm:flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className="px-6 py-3 bg-gray-800 dark:bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Analyze
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
        
        {analyzedData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm mt-4">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              {analyzedData.thumbnail && (
                <img src={analyzedData.thumbnail} alt="" className="w-20 h-16 sm:w-32 sm:h-24 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-lg line-clamp-2">{analyzedData.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {isPlaylist ? `${videoCount} videos` : analyzedData.duration}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${isPlaylist ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                {isPlaylist ? 'Playlist' : 'Video'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value);
                    if (e.target.value === 'MP3') {
                      setQuality('Best');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="MP4">MP4 (Video)</option>
                  <option value="MP3">MP3 (Audio)</option>
                  <option value="WebM">WebM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={format === 'MP3'}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm disabled:opacity-50"
                >
                  <option value="Best">Best</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="360p">360p</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              disabled={loading || downloading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  {format === 'MP3' ? <Music className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {`Download ${isPlaylist ? 'Playlist' : 'Video'}`}
                </>
              )}
            </button>
          </div>
        )}
        
        {downloads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm mt-4">
            <h3 className="font-semibold mb-3">Download Queue</h3>
            <div className="space-y-3">
              {downloads.map((download) => (
                <div key={download.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{download.url}</p>
                    <p className="text-xs text-gray-500">{download.format} • {download.quality}</p>
                    {download.progress > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 transition-all"
                          style={{ width: `${download.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    download.status === 'completed' ? 'bg-green-100 text-green-600' :
                    download.status === 'failed' ? 'bg-red-100 text-red-600' :
                    download.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {download.status}
                  </span>
                  {download.status !== 'completed' && download.status !== 'failed' && (
                    <button
                      onClick={() => handleCancel(download.id)}
                      className="px-2 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowFiles(false)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${!showFiles ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Download
          </button>
          <button
            onClick={() => setShowFiles(true)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${showFiles ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <FolderOpen className="w-4 h-4 inline mr-1" />
            Files
          </button>
        </div>
        
        {showFiles && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm mt-2">
            <h2 className="text-lg font-semibold mb-4">Downloaded Files</h2>
            <div className="flex items-center justify-center p-8 text-gray-500">
              <p className="text-sm">Files are downloaded to your device</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;