// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, protocol, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;

async function createWindow() {
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

  if (process.env.UMI_ENV === 'dev') {
    // //测试时使用 加载应用 适用于 react 项目
    // mainWindow.loadURL('http://localhost:8000');
    // // 打开开发者工具
    // mainWindow.webContents.openDevTools();
    await mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
    await autoUpdater.checkForUpdatesAndNotify()
  } else {
    //打包时加载本地文件
    // 加载应用 electron-quick-start中默认的加载入口
    await mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
    await autoUpdater.checkForUpdatesAndNotify()
    // mainWindow.loadURL(`file://${__dirname}/index.html`);
  }

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
app.on('ready', createWindow);

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
