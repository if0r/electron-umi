import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';

const DownloadProgressBar: React.FC = () => {
  useEffect(() => {
    // 監聽主進程發送的下載進度事件
    ipcRenderer.on('download-progress', (event, progress) => {
      // 更新進度條
      const progressBar = document.getElementById('progress');
      if (progressBar) {
        progressBar.style.width = `${progress.percent}%`;
      }
    });

    // 從主進程開始下載
    ipcRenderer.send('start-download');

    return () => {
      // 移除事件監聽器
      ipcRenderer.removeAllListeners('download-progress');
    };
  }, []);

  return (
    <div>
      <div id="progress-bar" style={{ width: '300px', height: '20px', backgroundColor: 'lightgray' }}>
        <div id="progress" style={{ height: '100%', backgroundColor: 'blue' }}></div>
      </div>
    </div>
  );
};

export default DownloadProgressBar;