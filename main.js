'use strict';

// Import parts of electron to use
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

// File system
const fs = require('fs');
const base64Img = require('base64-img');

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
  ADD_FILE,
  GET_APP_DATA_PATH,
  RETURN_APP_DATA_PATH,
  GET_FILE_RECORDS,
  RETURN_FILE_RECORDS,
  GET_FILE_COLLECTIONS,
  RETURN_FILE_COLLECTIONS,
  GET_FILE_TAGS,
  RETURN_FILE_TAGS
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
    width:1600, height:1200, minWidth: 850, minHeight: 650, show: false, icon:__dirname+'/src/assets/images/mediaIcon.png'
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

// Get the default and current file location
ipcMain.on(GET_APP_DATA_PATH, (event) => {
  mainWindow.send(RETURN_APP_DATA_PATH, appDataPath);
})

// Get all records
ipcMain.on(GET_ALL_FILES, (event) => {
  let result = knex.select('fileName', 'description', 'dateAdded', 'fileType').from('files');
  console.log(result);
  result.then(function(data) {
    mainWindow.send(RETURN_ALL_FILES, data);
  });
})

// Get all records from the files table where fileType is image
ipcMain.on(GET_FILE_RECORDS, (event, args) => {
  console.log(args);
  let params = {
    fileType: args.fileType,
  }
  let tags = [];
  if (args.currentTags) {
    for (var i=0; i < args.currentTags.length; i++) {
      tags.push(args.currentTags[i].value);
    }
  }
  let result = null;
  if (args && args.currentCollection && args.currentTags && args.currentTags.length) {
    params.collectionName = args.currentCollection;
    result = knex.select()
      .from('files')
      .join('files_collections', {'files_collections.fileId': 'files.fileId'})
      .join('collections', {'files_collections.collectionId': 'collections.collectionId'})
      .join('files_tags', {'files_tags.fileId': 'files.fileId'})
      .join('tags', {'files_tags.tagId': 'tags.tagId'})
      .whereIn('tags.tag', tags)
      .andWhere(params)
      .groupBy('files.fileName');
  } else if (args && args.currentCollection) {
    params.collectionName = args.currentCollection;
    result = knex.select()
      .from('files')
      .join('files_collections', {'files_collections.fileId': 'files.fileId'})
      .join('collections', {'files_collections.collectionId': 'collections.collectionId'})
      .join('files_tags', {'files_tags.fileId': 'files.fileId'})
      .join('tags', {'files_tags.tagId': 'tags.tagId'})
      .where(params)
      .groupBy('files.fileName');
  } else if(args && args.currentTags && args.currentTags.length) {
    result = knex.select()
      .from('files')
      .join('files_tags', {'files_tags.fileId': 'files.fileId'})
      .join('tags', {'files_tags.tagId': 'tags.tagId'})
      .whereIn('tags.tag', tags)
      .andWhere(params)
      .groupBy('files.fileName');
  } else {
    result = knex.select()
      .from('files')
      .where(params);
  }
  result.then(function(data) {
    console.log(data);
    let sendData;
    if (data && data.length) {
      sendData = data;
      for (var i=0; i<sendData.length; i++) {
        sendData[i].src  = base64Img.base64Sync(appDataPath + '\\storedFiles\\images\\' + sendData[i].fileName);
        // sendData[i].src = imgSrc;
        // console.log(imgSrc);
      }
    }
    mainWindow.send(RETURN_FILE_RECORDS, sendData);
  });
})

// Get all Collections with a sum of how many files are in them
ipcMain.on(GET_FILE_COLLECTIONS, (event, args) => {
  let result = knex('files_collections')
    .select('collections.collectionName', 'collections.collectionName as value', 'collections.collectionName as label')
    .count('fileId as totalFiles')
    .join('collections', {'collections.collectionId' : 'files_collections.collectionId'})
    .where('collections.collectionType', args.fileType)
    .groupBy('collections.collectionId');
  result.then(function(collections) {
    console.log(collections);
    mainWindow.send(RETURN_FILE_COLLECTIONS, collections);
  });
})

// Get all tags
ipcMain.on(GET_FILE_TAGS, (event, args) => {
  let result = knex('files_tags')
    .select('tags.tag as value', 'tags.tag as label')
    .join('tags', {'tags.tagId': 'files_tags.tagId'})
    .where('tags.tagType', args.fileType)
    .groupBy('tags.tagId');
  result.then(function(tags) {
    console.log(tags);
    mainWindow.send(RETURN_FILE_TAGS, tags);
  });
})

// Add an image to the app data folder
ipcMain.on(ADD_FILE, (event, args) => {
  console.log(args);
  const date = new Date(Date.now()).toLocaleString('en-GB').split(',')[0];
  let collectionIds = [];
  
  function collections() {
    for (var i=0; i < args.collections.length; i++) {
      if (args.collections[i].__isNew__) {
        let collectionResult = knex('collections')
          .insert([{collectionName: args.collections[i].value, collectionType: args.fileType}]);
        collectionResult.then(function(newCollectionId) {
          console.log('NEW: ' + newCollectionId);
          collectionIds.push(newCollectionId);
        })
      } else {
        let collectionResult = knex('collections')
          .select('collectionId')
          .where('collectionName', args.collections[i].value);
        collectionResult.then(function(collection) {
          console.log('OLD: ' + collection.collectionId);
          collectionIds.push(collectionId);
        })
      }
    }
  }

  // Add record to the files table
  let filesResult = knex('files')
    .insert([{fileName: args.fileName, description: args.description, dateAdded: date, fileType: args.fileType}]);
  filesResult.then(function(data) {
    console.log(data);
    if (args.collections && args.collections.length) {
      collections();
      console.log('IDs: ' + collectionIds);
    }
  })
  // const filePath = appDataPath + '\\storedFiles\\images\\' + args.fileName;
  // fs.createReadStream(args.filePath).pipe(fs.createWriteStream(filePath));

  // fs.copyFile(args.filePath, appDataPath, (err) => {
  //   if (err) throw err;
  //   console.log('The file has been saved');
  // })
})