const {shell, app, BrowserWindow, ipcMain: ipc} = require('electron')
const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()
const glob = require('glob')
const size_of = require('image-size')
const sharp = require('sharp')

let win, win_draw

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

function createDrawingWindow(opts){
  console.log('opts', opts)
  win_draw = new BrowserWindow({
    width: Math.max(opts.width,800),
    height: Math.max(opts.height + 43 + 22,300),
    //frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  win_draw.webContents.on('did-finish-load',function(){
    console.log('finished loading')
    win_draw.webContents.send('drawing-loaded',{asset: opts})
  })
  win_draw.loadFile('draw.html')
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

ipc.on('sharp-resize', function(e,opts){
  console.log('sharp-resizing',opts.asset)
  file = opts.asset.replace("file://",'')
  date = new Date().getTime()
  epoch = Math.round(date / 1000)
  ext   = path.extname(opts.asset)
  dir   = path.dirname(file)

  new_asset = dir + '/' + epoch +  ext
  console.log('file',file)
  console.log('new_asset',new_asset)

  sharp(file).resize({width: 726}).toFile(new_asset)

  data = {
    org_asset: file,
    new_asset: new_asset
  }
  win.webContents.send('response-sharp',data)
})

ipc.on('sharp-border', function(e,opts){
  console.log('sharp-border',opts.asset)
  date = new Date().getTime()
  epoch = Math.round(date / 1000)
  ext   = path.extname(opts.source)
  dir   = path.dirname(opts.source)
  new_asset = dir + '/' + epoch +  ext

  sharp(opts.source).composite([{input: opts.overlay}]).toFile(new_asset)
  data = {
    org_asset: opts.source,
    new_asset: new_asset
  }
  win.webContents.send('response-sharp',data)
})

ipc.on('sharp-draw', function(e,opts){
  createDrawingWindow(opts)
  win_draw.close()

  console.log('drawing-border',opts)
  date = new Date().getTime()
  epoch = Math.round(date / 1000)
  ext   = path.extname(opts.source)
  dir   = path.dirname(opts.source)
  new_asset = dir + '/' + epoch +  ext

  sharp(opts.source).composite([{input: opts.overlay}]).toFile(new_asset)
  data = {
    org_asset: opts.source,
    new_asset: new_asset
  }
  win.webContents.send('response-sharp',data)
})

ipc.on('assets-reveal', function(e,opts){
  console.log('path',opts.path)
  shell.openItem(opts.path)
})

ipc.on('toggle-fullscreen', function(e,opts){
  win.setFullScreen(true)
})

ipc.on('drawing-window',function(e,opts){
  createDrawingWindow(opts)
})
