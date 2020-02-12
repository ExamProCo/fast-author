const {app, BrowserWindow, ipcMain: ipc} = require('electron')
const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()
const glob = require('glob')
const size_of = require('image-size')

let win

function get_home_path() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function createWindow () {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    //frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  win.loadFile('index.html')
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipc.on('request-markdown-files', function(){
  const home   = get_home_path()
  const folder = path.join(home,'fast-author','*')

  const data = {
    home: home + '/fast-author',
    files: []
  }
  glob(folder, {}, (err, files)=>{
    console.log(files)
    for (let i = 0; i < files.length; i++) {

      name = files[i].split(path.sep).pop()
      data.files.push({
        name: name
      })
    }
    win.webContents.send('response-markdown-files',data)
  })
})

ipc.on('request-assets', function(e,opts){
  const home   = get_home_path()
  const folder = path.join(home,'fast-author',opts.project,'assets','modified','*')
  const data = {
    files: []
  }
  let f;
  glob(folder, {}, (err, files)=>{
    for (let i = 0; i < files.length; i++) {
      // reverse order
      f = files[(files.length-1)-i]

      dimensions = size_of(f)
      name = f.split(path.sep).pop()

      data.files.push({
        width: dimensions.width,
        height: dimensions.height,
        path: f,
        name: name
      })
    }
    win.webContents.send('response-assets',data)
  })
})
