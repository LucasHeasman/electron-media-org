'use strict';

// Import parts of electron to use
const {app, BrowserWindow, ipcMain} = require('electron');
const http = require('http');
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
  RETURN_FILE,
  GET_APP_DATA_PATH,
  RETURN_APP_DATA_PATH,
  GET_FILE_RECORDS,
  RETURN_FILE_RECORDS,
  GET_ALL_COLLECTIONS,
  RETURN_ALL_COLLECTIONS,
  GET_ALL_TAGS,
  RETURN_ALL_TAGS,
  GET_FILE_COLLECTIONS,
  RETURN_FILE_COLLECTIONS,
  GET_FILE_TAGS,
  RETURN_FILE_TAGS,
  UPDATE_FILE,
  RETURN_FILE_UPDATED,
  DELETE_FILE,
  RETURN_FILE_DELETED,
  STREAM_VIDEO,
  STOP_STREAM_VIDEO
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
  // console.log(result);
  result.then(function(data) {
    mainWindow.send(RETURN_ALL_FILES, data);
  });
})

// Get all records from the files table where fileType is image
ipcMain.on(GET_FILE_RECORDS, (event, args) => {
  // console.log(args);
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
    // console.log(data);
    let sendData;
    if (data && data.length) {
      sendData = data;
      for (var i=0; i<sendData.length; i++) {
        sendData[i].src  = base64Img.base64Sync(appDataPath + '\\storedFiles\\' + args.fileType + '\\' + sendData[i].fileName);
        sendData[i].path = appDataPath + '\\storedFiles\\' + args.fileType + '\\' + sendData[i].fileName;
        // sendData[i].src = imgSrc;
        // console.log(imgSrc);
      }
    }
    mainWindow.send(RETURN_FILE_RECORDS, sendData);
  });
})

// Get all Collections with a sum of how many files are in them
ipcMain.on(GET_ALL_COLLECTIONS, (event, args) => {

  // Get total files with the correct filetype
  let totalFilesPromise = new Promise(function(resolve, reject) {
    let totalFilesResult = knex('files')
      .countDistinct('files.fileId as totalFiles')
      .where('files.fileType', args.fileType);
      totalFilesResult.then(function(count) {
        resolve(count);
      })
  });

  let collectionsPromise = new Promise(function(resolve, reject) {
    let result = knex('collections')
      .select('collections.collectionId', 'collections.collectionName', 'collections.collectionName as value', 'collections.collectionName as label')
      .count('fileId as totalFiles')
      .leftJoin('files_collections', {'files_collections.collectionId' : 'collections.collectionId' })
      .where('collections.collectionType', args.fileType)
      .groupBy('collections.collectionId');
    result.then(function(collections) {
      resolve(collections);
    });
  })

  Promise.all([totalFilesPromise, collectionsPromise]).then(function(values) {
    // console.log(values);
    mainWindow.send(RETURN_ALL_COLLECTIONS, values);
  });
})

// Get all tags
ipcMain.on(GET_ALL_TAGS, (event, args) => {
  let result = knex('tags')
    .select('tags.tag as value', 'tags.tag as label')
    .leftJoin('files_tags', {'files_tags.tagId' : 'tags.tagId' })
    .where('tags.tagType', args.fileType)
    .groupBy('tags.tagId');
  result.then(function(tags) {
    console.log(tags);
    mainWindow.send(RETURN_ALL_TAGS, tags);
  });
})

// Get all Collections that a file is assigned to
ipcMain.on(GET_FILE_COLLECTIONS, (event, args) => {
  let result = knex('files_collections')
    .select('collections.collectionId', 'collections.collectionName', 'collections.collectionName as value', 'collections.collectionName as label')
    .count('fileId as totalFiles')
    .join('collections', {'collections.collectionId' : 'files_collections.collectionId'})
    .where('collections.collectionType', args.fileType)
    .andWhere('files_collections.fileId', args.fileId)
    .groupBy('collections.collectionId');
  result.then(function(collections) {
    // console.log(collections);
    mainWindow.send(RETURN_FILE_COLLECTIONS, collections);
  });
})

// Get all tags that are assigned to a file
ipcMain.on(GET_FILE_TAGS, (event, args) => {
  console.log(args);
  let result = knex('files_tags')
    .select('tags.tag as value', 'tags.tag as label')
    .join('tags', {'tags.tagId': 'files_tags.tagId'})
    .where('tags.tagType', args.fileType)
    .andWhere('files_tags.fileId', args.fileId)
    .groupBy('tags.tagId');
  result.then(function(tags) {
    console.log(tags);
    mainWindow.send(RETURN_FILE_TAGS, tags);
  });
})

// Add an image to the app data folder
ipcMain.on(ADD_FILE, (event, args) => {
  // console.log(args);
  const filePath = appDataPath + '\\storedFiles\\' + args.fileType + '\\' + args.fileName;
  const date = new Date(Date.now()).toLocaleString('en-GB').split(',')[0];

  try {
    fs.createReadStream(args.filePath).pipe(fs.createWriteStream(filePath));
  } catch (error) {
    alert('Error copying file ' + error);
  }

  // Add record to the files table
  let filePromise = new Promise(function(resolve, reject) {
    let fileResult = knex('files')
      .insert([{fileName: args.fileName, description: args.description, dateAdded: date, fileType: args.fileType}]);
    fileResult.then(function(id) {
      resolve({fileId: id});
    })
  });

  // Add any new collections to the collections table
  let newCollectionPromise = new Promise(function(resolve, reject) {
    if (args.newCollections && args.newCollections.length) {
      let collectionResult = knex('collections')
        .insert(args.newCollections);
      collectionResult.then(function(id) {
        resolve({newCollections: id});
      });
    } else {
      resolve({newCollections: null});
    }
  });

  // Add any new tags to the tags table
  let newTagPromise = new Promise(function(resolve, reject) {
    if (args.newTags && args.newTags.length) {
      let tagResult = knex('tags')
        .insert(args.newTags);
      tagResult.then(function(id) {
        resolve({newTags: id});
      });
    } else {
      resolve({newTags: null});
    }
  });

  // Once all promises finish
  Promise.all([filePromise, newCollectionPromise, newTagPromise]).then(function(values) {
    console.log(values);

    // Get the IDs of the previously created collections
    let oldCollectionPromise = new Promise(function(resolve, reject) {
      if (args.oldCollections && args.oldCollections.length) {
        let collectionResult = knex('collections')
          .select('collectionId')
          .whereIn('collectionName', args.oldCollections);
        collectionResult.then(function(id) {
          resolve(id);
        });
      } else {
        resolve(null);
      }
    });

    // Get the IDs of the previously created tags
    let oldTagPromise = new Promise(function(resolve, reject) {
      if (args.oldTags && args.oldTags.length) {
        let tagResult = knex('tags')
          .select('tagId')
          .whereIn('tag', args.oldTags);
        tagResult.then(function(id) {
          resolve(id);
        });
      } else {
        resolve(null);
      }
    });

    Promise.all([oldCollectionPromise, oldTagPromise]).then(function(values2) {
      console.log(values2);
      let collectionIds = values2[0];
      let tagIds = values2[1];
      if (collectionIds && collectionIds.length) {
        for (var i=0; i < collectionIds.length; i++) {
          collectionIds[i].fileId = values[0].fileId[0];
        }
      }
      if (tagIds && tagIds.length) {
        for (var i=0; i < tagIds.length; i++) {
          tagIds[i].fileId = values[0].fileId[0];
        }
      }
      // console.log(collectionIds);
      // console.log(tagIds);

      // Add records to link the collections to the file
      let fileCollectionPromise = new Promise(function(resolve, reject) {
        if (collectionIds && collectionIds.length) {
          let fileCollectionResult = knex('files_collections')
            .insert(collectionIds);
          fileCollectionResult.then(function(data) {
            resolve(data);
          });
        } else {
          resolve(null);
        }
      });

       // Add records to link the tags to the file
      let fileTagPromise = new Promise(function(resolve, reject) {
        if (collectionIds && collectionIds.length) {
          let fileCollectionResult = knex('files_tags')
            .insert(tagIds);
          fileCollectionResult.then(function(data) {
            resolve(data);
          });
        } else {
          resolve(null);
        }
      });

      Promise.all([fileCollectionPromise, fileTagPromise]).then(function(values3) {
        mainWindow.send(RETURN_FILE);
      });
    });
  });
})

ipcMain.on(UPDATE_FILE, (event, args) => {
  console.log(args);

  // Add any new collections to the collections table
  let newCollectionPromise = new Promise(function(resolve, reject) {
    if (args.newCollections && args.newCollections.length) {
      let collectionResult = knex('collections')
        .insert(args.newCollections);
      collectionResult.then(function(id) {
        resolve({newCollections: id});
      });
    } else {
      resolve({newCollections: null});
    }
  });

  // Add any new tags to the tags table
  let newTagPromise = new Promise(function(resolve, reject) {
    if (args.newTags && args.newTags.length) {
      let tagResult = knex('tags')
        .insert(args.newTags);
      tagResult.then(function(id) {
        resolve({newTags: id});
      });
    } else {
      resolve({newTags: null});
    }
  });

  // Once all promises finish
  Promise.all([newCollectionPromise, newTagPromise]).then(function(values) {
    console.log("Values");
    console.log(values);

    // Remove the file from all collections
    let removeCollectionsPromise = new Promise(function(resolve, reject) {
      console.log(knex);
      let removeCollectionResult = knex('files_collections')
        .del()
        .where({'fileId': args.fileId})
      removeCollectionResult.then(function(count) {
        // console.log('remove collections');
        // console.log(count);
        resolve(count);
      }).catch(function(err) {
        console.log('error removing collections ' + err);
      });
    });

    // Remove all tags from the file
    let removeTagsPromise = new Promise(function(resolve, reject) {
      console.log(knex);
      let removeTagResult = knex('files_tags')
        .del()
        .where({'fileId': args.fileId})
      removeTagResult.then(function(count) {
        // console.log('remove tags');
        // console.log(count);
        resolve(count);
      }).catch(function(err) {
        console.log('error removing tags ' + err);
      });
    });

    // Once all promises finish
    Promise.all([removeCollectionsPromise, removeTagsPromise]).then(function(values2) {
      console.log("Values2");
      console.log(values2);

      // Get the IDs of the previously created collections
      let oldCollectionPromise = new Promise(function(resolve, reject) {
        if (args.oldCollections && args.oldCollections.length) {
          let collectionIdResult = knex('collections')
            .select('collectionId')
            .whereIn('collectionName', args.oldCollections);
          collectionIdResult.then(function(id) {
            resolve(id);
          });
        } else {
          resolve(null);
        }
      });

      // Get the IDs of the previously created tags
      let oldTagPromise = new Promise(function(resolve, reject) {
        if (args.oldTags && args.oldTags.length) {
          let tagIdResult = knex('tags')
            .select('tagId')
            .whereIn('tag', args.oldTags);
          tagIdResult.then(function(id) {
            resolve(id);
          });
        } else {
          resolve(null);
        }
      });

      Promise.all([oldCollectionPromise, oldTagPromise]).then(function(values3) {
        console.log("Values3");
        console.log(values3);
        let collectionIds = values3[0];
        let tagIds = values3[1];
        if (collectionIds && collectionIds.length) {
          for (var i=0; i < collectionIds.length; i++) {
            collectionIds[i].fileId = args.fileId;
          }
        }
        if (tagIds && tagIds.length) {
          for (var i=0; i < tagIds.length; i++) {
            tagIds[i].fileId = args.fileId;
          }
        }
        // console.log(collectionIds);
        // console.log(tagIds);
  
        // Add records to link the collections to the file
        let fileCollectionPromise = new Promise(function(resolve, reject) {
          if (collectionIds && collectionIds.length) {
            let fileCollectionResult = knex('files_collections')
              .insert(collectionIds);
            fileCollectionResult.then(function(data) {
              resolve(data);
            });
          } else {
            resolve(null);
          }
        });
  
         // Add records to link the tags to the file
        let fileTagPromise = new Promise(function(resolve, reject) {
          if (collectionIds && collectionIds.length) {
            let fileCollectionResult = knex('files_tags')
              .insert(tagIds);
            fileCollectionResult.then(function(data) {
              resolve(data);
            });
          } else {
            resolve(null);
          }
        });

        //Update the description
        let updateDescriptionPromise = new Promise(function(resolve, reject) {
          let updateDescriptionResult = knex('files')
            .where({'fileId': args.fileId})
            .update({'description': args.description});
          updateDescriptionResult.then(function(data) {
            resolve(data);
          });
        });

        Promise.all([fileCollectionPromise, fileTagPromise, updateDescriptionPromise]).then(function(values4) {
          console.log("Values4");
          mainWindow.send(RETURN_FILE_UPDATED);
        }).catch(function(err) {
          console.log('error creating new collection/tag links ' + err);
        });
      }).catch(function(err) {
        console.log('error getting correct collection/tag IDs ' + err);
      });
    }).catch(function(err) {
      console.log('error removing old collections/tags ' + err);
    });
  }).catch(function(err) {
    console.log('error creating new collections/tags ' + err);
  });
})

ipcMain.on(DELETE_FILE, (event, args) => {
  console.log(args);

  // Remove the file from all collections
  let removeCollectionsPromise = new Promise(function(resolve, reject) {
    console.log(knex);
    let removeCollectionResult = knex('files_collections')
      .del()
      .where({'fileId': args.fileId})
    removeCollectionResult.then(function(count) {
      // console.log('remove collections');
      // console.log(count);
      resolve(count);
    }).catch(function(err) {
      console.log('error removing collections ' + err);
    });
  });

  // Remove all tags from the file
  let removeTagsPromise = new Promise(function(resolve, reject) {
    console.log(knex);
    let removeTagResult = knex('files_tags')
      .del()
      .where({'fileId': args.fileId})
    removeTagResult.then(function(count) {
      // console.log('remove tags');
      // console.log(count);
      resolve(count);
    }).catch(function(err) {
      console.log('error removing tags ' + err);
    });
  });

  // Remove all tags from the file
  let removeFilePromise = new Promise(function(resolve, reject) {
    console.log(knex);
    let removeFileResult = knex('files')
      .del()
      .where({'fileId': args.fileId})
    removeFileResult.then(function(count) {
      // console.log('remove tags');
      // console.log(count);
      resolve(count);
    }).catch(function(err) {
      console.log('error removing file ' + err);
    });
  });

  Promise.all([removeCollectionsPromise, removeTagsPromise, removeFilePromise]).then(function() {
    mainWindow.send(RETURN_FILE_DELETED);
  }).catch(function(err) {
    console.log('error creating new collection/tag links ' + err);
  });
})
var server = null;
ipcMain.on(STREAM_VIDEO, (event, args) => {
  console.log(args);
  if (args.fileName) {
    server = http.createServer(function (req, res) {
      const filePath = appDataPath + '\\storedFiles\\video\\' + args.fileName;
      fs.stat(filePath, function(err, stats) {
        if (err) {
          if (err.code === 'ENOENT') {
            // 404 Error if file not found
            alert('404 File not found');
            res.sendStatus(404);
          }
          res.end(err);
        }
        let range = req.headers.range;
        if (!range) {
          // 416 wrong range
          alert('416 wrong range');
          return res.sendStatus(416);
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4"
        });

        var stream = fs.createReadStream(filePath, { start: start, end: end, autoClose: true })
          .on("open", function() {
            stream.pipe(res);
          })
          .on("error", function(err) {
            res.end(err);
        });
      })
    }).listen(8888);
  }
})

ipcMain.on(STOP_STREAM_VIDEO, (event) => {
  if (server) {
    server.close(function () {
      console.log('Server closed');
    });
  }
})