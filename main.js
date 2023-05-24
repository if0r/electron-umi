// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, protocol, session, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;

function checkUpdate(){
  const feedURL = `https://github.com/if0r/electron-umi/releases/latest`; // 'http://192.168.1.79:8080/updater/'
  autoUpdater.setFeedURL(feedURL)  //设置要检测更新的路径
  
  //检测更新
  autoUpdater.checkForUpdates().then(it => {
    const downloadPromise = it?.downloadPromise
    if (downloadPromis === null) {
      dialog.showMessageBox({
        type: 'info',
        title: 'info',
        message: 'downloadPromise === null'
      })
      return
    }

    downloadPromise?.then(() => {
      dialog.showMessageBox({
        type: 'info',
        title: 'info',
        message: '新版本提醒'
      })
    })
  })
  
  //监听'error'事件
  autoUpdater.on('error', (err) => {
    console.log(err)
    dialog.showMessageBox({
      type: 'err',
      title: '应用更新',
      message: err
    })
  })
  
  //监听'update-available'事件，发现有新版本时触发
  autoUpdater.on('update-available', () => {
    console.log('found new version')
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: 'found new version'
    })
  })

  // 監聽自動更新下載進度事件
  autoUpdater.on('download-progress', progress => {
    // 向渲染進程傳送下載進度
    mainWindow.webContents.send('download-progress', progress);
  });
  
  //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
  
  //监听'update-downloaded'事件，新版本下载完成时触发
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: '发现新版本，是否更新？',
      buttons: ['是', '否']
    }).then((buttonIndex) => {
      if(buttonIndex.response === 0) {  //选择是，则退出程序，安装新版本
        autoUpdater.quitAndInstall() 
        app.quit()
      }
    })
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
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );

  // Emitted when the window is closed.
  // 当窗口关闭时调用的方法
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
    // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// 当Electron完成初始化并且已经创建了浏览器窗口，则该方法将会被调用。
// 有些API只能在该事件发生后才能被使用。
app.on('ready', () => {
  //每次启动程序，就检查更新
  checkUpdate()
  createWindow();
});

// Quit when all windows are closed.
// 当所有的窗口被关闭后退出应用
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // 对于OS X系统，应用和相应的菜单栏会一直激活直到用户通过Cmd + Q显式退出
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他窗口打开
  if (mainWindow === null) createWindow();
});

// 在下載進度條畫面設定中，可以使用以下程式碼接收下載進度
ipcMain.on('start-download', () => {
  autoUpdater.downloadUpdate();
});

// // 監聽渲染進程發送的檢查更新事件
// ipcMain.on('check-for-updates', () => {
//   // 開始檢查更新
//   autoUpdater.checkForUpdates();
// });