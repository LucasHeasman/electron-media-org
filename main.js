'use strict';

// Import parts of electron to use
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

// File system
const fs = require('fs');

// Database
let knex = require('knex') ({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  },
  useNullAsDefault: true
})

// Constants used for IPCs
const {
  CATCH_ON_MAIN,
  SEND_TO_RENDERER,
  GET_ALL_FILES,
  RETURN_ALL_FILES,
  ADD_IMAGE
} = require('./utils/constants');

// App data path
const appDataPath = app.getPath('userData');
console.log(appDataPath)
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width:1600, height:1200, minWidth: 850, minHeight: 650, show: false, icon:__dirname+'/src/assets/icons/mediaIcon.png'
  });

  // and load the index.html of the app.
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:4000',
      pathname: '/',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL( indexPath );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

/* -------------------------------------------------------------------------------------------------------------------------------------------
  Start of IPCs
------------------------------------------------------------------------------------------------------------------------------------------- */

ipcMain.on(CATCH_ON_MAIN, (event, args) => {
  console.log('Here 001', args);
  mainWindow.send(SEND_TO_RENDERER, 'pong');
})

// Get all records
ipcMain.on(GET_ALL_FILES, (event) => {
  let result = knex.select('fileName', 'description', 'dateAdded', 'fileType').from('files');
  console.log(result);
  result.then(function(data) {
    mainWindow.send(RETURN_ALL_FILES, data);
  });
})

// Add an image to the app data folder
ipcMain.on(ADD_IMAGE, (event, args) => {
  const filePath = appDataPath+'\\storedFiles\\images\\'+args.fileName;
  fs.createReadStream(args.filePath).pipe(fs.createWriteStream(filePath));
  // fs.copyFile(args.filePath, appDataPath, (err) => {
  //   if (err) throw err;
  //   console.log('The file has been saved');
  // })
})