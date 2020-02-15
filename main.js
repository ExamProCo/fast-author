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
    width: Math.max(opts.version.width,800),
    height: Math.max(opts.version.height + 43 + 22,300),
    //frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  win_draw.webContents.on('did-finish-load',function(){
    console.log('finished loading')
    win_draw.webContents.send('drawing-loaded',opts)
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

function assets_manifest_path(project) {
  const home   = get_home_path()
  const manifest_path = path.join(home,project,'assets-manifest.json')
  return manifest_path
}

function assets_manifest_json (project){
  const raw_data      = fs.readFileSync(assets_manifest_path(project))
  const assets_manifest = JSON.parse(raw_data)
  return assets_manifest
}

ipc.on('request-assets', function(e,opts){
  win.webContents.send('response-assets',assets_manifest_json(opts.project))
})

ipc.on('sharp-resize', function(e,opts){
  console.log('sharp-resizing',opts.asset)

  const results = opts.asset.match(/assets\/(.+)\/versions/)
  const uuid = results[1]

  const file = opts.asset.replace("file://",'')
  const date = new Date().getTime()
  const epoch = Math.round(date / 1000)
  const ext   = path.extname(opts.asset)
  const dir   = path.dirname(file)

  manifest = assets_manifest_json(opts.project)
  let manifest_index
  for (let i =0; i < manifest.length; i++){
    if( manifest[i].id === uuid) {
      manifest_index = i
      break
    }
  }
  console.log('manifest_item',manifest[manifest_index])

  new_asset = dir + '/' + epoch +  ext
  console.log('file',file)
  console.log('new_asset',new_asset)

  sharp(file).resize({width: 726}).toFile(new_asset).then(() => {
    const dimensions = size_of(new_asset)

    manifest[manifest_index].versions.push({
      epoch: epoch,
      width: dimensions.width,
      height: dimensions.height,
      ext: path.extname(new_asset)
    })

    const assets_manifest_string = JSON.stringify(manifest,null, 2)
    fs.writeFileSync(assets_manifest_path(opts.project), assets_manifest_string)


    const response_data = {
      org_asset: file,
      new_asset: new_asset
    }
    win.webContents.send('response-sharp',response_data)
  }) // sharp
}) // func

ipc.on('sharp-border', function(e,opts){
  const results = opts.source.match(/assets\/(.+)\/versions/)
  const uuid = results[1]

  const date = new Date().getTime()
  const epoch = Math.round(date / 1000)
  const ext   = path.extname(opts.source)
  const dir   = path.dirname(opts.source)

  manifest = assets_manifest_json(opts.project)
  let manifest_index
  for (let i =0; i < manifest.length; i++){
    if( manifest[i].id === uuid) {
      manifest_index = i
      break
    }
  }
  console.log('manifest_item',manifest[manifest_index])

  const new_asset = dir + '/' + epoch +  ext

  sharp(opts.source).composite([{input: opts.overlay}]).toFile(new_asset).then(() => {
    const dimensions = size_of(new_asset)

    manifest[manifest_index].versions.push({
      epoch: epoch,
      width: dimensions.width,
      height: dimensions.height,
      ext: path.extname(new_asset)
    })

    const assets_manifest_string = JSON.stringify(manifest,null, 2)
    fs.writeFileSync(assets_manifest_path(opts.project), assets_manifest_string)

    const data = {
      org_asset: opts.source,
      new_asset: new_asset
    }
    win.webContents.send('response-sharp',data)
  }) // sharp
}) // func

ipc.on('sharp-draw', function(e,opts){
  const results = opts.source.match(/assets\/(.+)\/versions/)
  const uuid = results[1]

  const date = new Date().getTime()
  const epoch = Math.round(date / 1000)
  const ext   = path.extname(opts.source)
  const dir   = path.dirname(opts.source)

  manifest = assets_manifest_json(opts.project)
  let manifest_index
  for (let i =0; i < manifest.length; i++){
    if( manifest[i].id === uuid) {
      manifest_index = i
      break
    }
  }
  console.log('manifest_item',manifest[manifest_index])

  const new_asset = dir + '/' + epoch +  ext

  sharp(opts.source).composite([{input: opts.overlay}]).toFile(new_asset).then(() => {
    const dimensions = size_of(new_asset)

    manifest[manifest_index].versions.push({
      epoch: epoch,
      width: dimensions.width,
      height: dimensions.height,
      ext: path.extname(new_asset)
    })

    const assets_manifest_string = JSON.stringify(manifest,null, 2)
    fs.writeFileSync(assets_manifest_path(opts.project), assets_manifest_string)

    const data = {
      org_asset: opts.source,
      new_asset: new_asset
    }
    win_draw.close()
    win_draw.destroy() // Shouldn't need this but make's it close
    win.webContents.send('response-sharp',data)
  }) // sharp
}) // func

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
