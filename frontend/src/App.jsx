import { useState, useEffect } from 'react';
import { Download, Moon, Sun, History, FolderDown } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';
import { analyzeUrl, downloadVideo, downloadPlaylist, getFiles, getHistory, getQueue, cancelDownload } from './services/api';
import { useProgress } from './hooks/useProgress';

function App() {
  const { darkMode, toggle } = useDarkMode();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('MP4');
  const [quality, setQuality] = useState('Best');
  const [analyzedData, setAnalyzedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('download');
  
  const { progress } = useProgress(activeId);
  
  useEffect(() => {
    loadFiles();
    loadHistory();
    loadQueue();
  }, []);
  
  useEffect(() => {
    if (activeId && progress.status !== 'idle') {
      setDownloads(prev => prev.map(d => 
        d.id === activeId ? { ...d, progress: progress.progress, status: progress.status } : d
      ));
      if (progress.status === 'completed' || progress.status === 'failed') {
        setActiveId(null);
        loadFiles();
        loadHistory();
        loadQueue();
      }
    }
  }, [progress]);
  
  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data.files);
    } catch (err) {
      console.error('Load files error:', err);
    }
  };
  
  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data.history);
    } catch (err) {
      console.error('Load history error:', err);
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
    setLoading(true);
    setError(null);
    
    try {
      if (analyzedData?.type === 'playlist') {
        const result = await downloadPlaylist(url, format, quality);
        setDownloads(prev => [...prev, { id: result.id, url, format, quality, progress: 0, status: 'queued' }]);
        setActiveId(result.id);
      } else {
        const result = await downloadVideo(url, format, quality);
        setDownloads(prev => [...prev, { id: result.id, url, format, quality, progress: 0, status: 'queued' }]);
        setActiveId(result.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
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
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold">YT Installer</h1>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'download' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Download
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'files' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Files ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'history' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <History className="w-4 h-4 inline mr-1" />
            History
          </button>
        </div>
        
        {activeTab === 'download' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Enter YouTube URL</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or playlist URL"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url}
                  className="px-6 py-3 bg-gray-800 dark:bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-500 disabled:opacity-50"
                >
                  Analyze
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            
            {analyzedData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  {analyzedData.thumbnail && (
                    <img src={analyzedData.thumbnail} alt="" className="w-32 h-24 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{analyzedData.title}</h3>
                    {analyzedData.type === 'playlist' ? (
                      <p className="text-gray-500 dark:text-gray-400">{analyzedData.videoCount} videos</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">{analyzedData.duration}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${analyzedData.type === 'playlist' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                    {analyzedData.type === 'playlist' ? 'Playlist' : 'Video'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
<div>
                    <label className="block text-sm font-medium mb-2">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      {analyzedData.availableFormats?.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      disabled={format === 'MP3'}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                    >
                      {(format === 'MP3' ? ['Best'] : analyzedData.availableQualities)?.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Download ${analyzedData.type === 'playlist' ? 'Playlist' : 'Video'}`}
                </button>
              </div>
            )}
            
            {downloads.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Download Queue</h3>
                <div className="space-y-3">
                  {downloads.map((download) => (
                    <div key={download.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium truncate">{download.url}</p>
                        <p className="text-sm text-gray-500">
                          {download.format} � {download.quality}
                        </p>
                        {download.progress > 0 && (
                          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-600 transition-all"
                              style={{ width: `${download.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
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
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'files' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FolderDown className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Downloaded Files</h2>
            </div>
            {files.length === 0 ? (
              <p className="text-gray-500">No files downloaded yet</p>
            ) : (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                    </div>
                    <a
                      href={`/api/files/download?path=${encodeURIComponent(file.path)}`}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Download History</h2>
            {history.length === 0 ? (
              <p className="text-gray-500">No download history</p>
            ) : (
              <div className="space-y-2">
                {history.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium truncate">{item.url}</p>
                      <p className="text-sm text-gray-500">
                        {item.format} � {item.quality}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.status === 'completed' ? 'bg-green-100 text-green-600' :
                      item.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
