// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, protocol, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
let antdServerProcess;
const localServerUrl = 'http://localhost:8000';
const isLocal = process.argv.includes('--local');

function checkUpdate(){
  const feedURL = 'http://192.168.1.79:8080/updater/'
  autoUpdater.setFeedURL({ url: feedURL })  //设置要检测更新的路径
  
  //检测更新
  autoUpdater.checkForUpdates().then(it => {
    const downloadPromise = it.downloadPromise
    if (downloadPromise === null) {
      dialog.showMessageBox({
        type: 'info',
        title: 'info',
        message: 'downloadPromise === null'
      })
      return
    }

    downloadPromise.then(() => {
      dialog.showMessageBox({
        type: 'info',
        title: 'info',
        message: '新版本提醒'
      })
    })
  })
  
  //监听'error'事件
  autoUpdater.on('error', (err) => {
    dialog.showMessageBox({
      type: 'err',
      title: '更新',
      message: err
    })
  })
  
  //监听'update-available'事件，发现有新版本时触发
  autoUpdater.on('update-available', () => {
    // 有可用的更新
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: [],
      title: '更新可用',
      message: '有新版本的應用程式可供下載和安裝。',
      detail: '正在下載更新，請稍候...'
    });

    // 阻止使用者操作
    mainWindow.setEnabled(false);
  })
  
  autoUpdater.on('update-not-available', () => {
    // 沒有可用的更新
    // 這裡可以顯示提示訊息告知使用者沒有新版本
    dialog.showMessageBox({
      type: 'info',
      title: '更新',
      message: '沒有可用的更新'
    })
  });


  //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
  
  //监听'update-downloaded'事件，新版本下载完成时触发
  autoUpdater.on('update-downloaded', () => {
    // 在更新下載完成後觸發的程式碼
    const response = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['是'],
      defaultId: 0,
      message: '新版本已下載完成，是否立即安裝？',
      title: '更新可用'
    });
  
    if (response === 0) { // 如果使用者選擇「是」
      autoUpdater.quitAndInstall(); // 強制退出並安裝更新
      app.quit()
    }
  })
}

function createWindow() {
  // Create the browser window.
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    // frame: true,
    // autoHideMenuBar: true,
    // fullscreenable: true,
    // transparent: false,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // 關閉安全策略
      nodeIntegration: true,
      allowRunningInsecureContent: true,
    },
  });

    //打包时加载本地文件
    // 加载应用 electron-quick-start中默认的加载入口
  if (isLocal) {
    // 載入本地伺服器網頁
    mainWindow.loadURL(localServerUrl);
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }

  // Emitted when the window is closed.
  // 当窗口关闭时调用的方法
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
    // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
    if (isLocal) {
      antdServerProcess?.kill();
    }
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// 当Electron完成初始化并且已经创建了浏览器窗口，则该方法将会被调用。
// 有些API只能在该事件发生后才能被使用。
app.on('ready', () => {
  if (isLocal) {
    // 启动 Antd Pro 服务器
    antdServerProcess = exec('yarn start');
    const waitOn = require('wait-on');

    // 等待 Antd Pro 本地服务器启动完成
    waitOn({
      resources: [localServerUrl],
    })
      .then(() => {
        console.log('Antd Pro server is running');
        createWindow();
      })
      .catch((error) => {
        console.error('Antd Pro start fail', error);
      });
  } else {
    //每次启动程序，就检查更新
    checkUpdate();
    createWindow();
  }
});

// Quit when all windows are closed.
// 当所有的窗口被关闭后退出应用
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
  // 对于OS X系统，应用和相应的菜单栏会一直激活直到用户通过Cmd + Q显式退出
  // if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他窗口打开
  if (mainWindow === null) createWindow();
});
