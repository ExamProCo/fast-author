const {shell, app, BrowserWindow, ipcMain: ipc} = require('electron')
const path = require('path')
const fs = require('fs')
const fx = require('mkdir-recursive')
const homedir = require('os').homedir()
const glob = require('glob')
const size_of = require('image-size')
const sharp = require('sharp')
const prompt = require('electron-prompt')

let win, win_draw

function get_home_path() {
  let home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  let new_home = [home,'fast-author'].join('/')
  return new_home
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


function request_markdown_files(){
  const home   = get_home_path()
  const folder = path.join(home,'*')

  const data = {
    home: home,
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
}
ipc.on('request-markdown-files', function(){
  request_markdown_files()
})

ipc.on('request-assets', function(e,opts){
  const home   = get_home_path()
  const manifest_path = path.join(home,opts.project,'assets-manifest.json')
  raw_data      = fs.readFileSync(manifest_path)
  assets_manifest = JSON.parse(raw_data)
  win.webContents.send('response-assets',assets_manifest)
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
  win_draw.close()
  win_draw.destroy() // Shouldn't need this but make's it close
  win.webContents.send('response-sharp',data)
})

ipc.on('assets-reveal', function(e,opts){
  shell.openItem(opts.path)
})

ipc.on('toggle-fullscreen', function(e,opts){
  if (win.isFullScreen()){
    win.setFullScreen(false)
  } else {
    win.setFullScreen(true)
  }
})

ipc.on('drawing-window',function(e,opts){
  createDrawingWindow(opts)
})

ipc.on('prompt-new',function(e,opts){
  prompt({
      title: 'New Project',
      label: 'Name',
      value: '',
      inputAttrs: {
          type: 'text'
      },
      type: 'input'
  })
  .then((name) => {
      if(name === null) {
      } else {
        new_name = name.replace(/\s/g,'-')
        const path = [get_home_path(),new_name].join('/')
        fx.mkdirSync(path + '/backups')
        fx.mkdirSync(path + '/assets')
        fs.openSync(path + '/index.md', 'w')
        fs.writeFileSync(path + '/assets-manifest.json', '[]')
        request_markdown_files()
        win.webContents.send('response-new-project',{name: new_name})
      }
  })
  .catch(console.error);
})
