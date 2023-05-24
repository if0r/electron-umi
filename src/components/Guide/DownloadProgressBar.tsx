import React, { useEffect, useState } from 'react';
declare global {
  interface Window {
    require: any;
  }
}
const ipcRenderer = window?.require && window?.require('electron').ipcRenderer || null

const DownloadProgressBar: React.FC = () => {
  const [isDownload, setIsDownload] = useState( false )
  useEffect(() => {
    // 監聽主進程發送的下載進度事件
    ipcRenderer?.on('download-progress', (event, progress) => {
      // 更新進度條
      setIsDownload(true)
      const progressBar = document.getElementById('progress');
      if (progressBar) {
        progressBar.style.width = `${progress?.percent}%`;
      }
    });

    // 從主進程開始下載
    ipcRenderer?.send('start-download');

    return () => {
      // 移除事件監聽器
      ipcRenderer?.removeAllListeners('download-progress');
    };
  }, []);

  return (
    <div>
      {isDownload ? '下載中' : '????'}
      <div id="progress-bar" style={{ width: '300px', height: '20px', backgroundColor: 'lightgray' }}>
        <div id="progress" style={{ height: '100%', backgroundColor: 'blue' }}></div>
      </div>
    </div>
  );
};

export default DownloadProgressBar;