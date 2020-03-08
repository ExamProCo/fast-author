import * as m from 'mithril'
import ArticleView from 'views/article'
import {ipcRenderer as ipc} from 'electron'
import Data from 'common/data'
import Save from 'common/save'
import os from 'os'
import fs from 'fs'

routes =
  '/': ArticleView
m.route.prefix = ''

m.route document.querySelector('.container'), '/', routes

Save.auto()

ipc.send('request-markdown-files')
ipc.on 'response-markdown-files', (e,data)=>
  Data.home data.home
  Data.files data.files
  unless Data.active_file() 
    Data.active_file Data.files()[0].name
    data = fs.readFileSync(Data.markdown_path(Data.files()[0].name))
    Data.document data.toString()
  m.redraw(true)
ipc.on 'response-assets', (e,data)=>
  Data.assets data
  m.redraw(true)
ipc.on 'response-sharp', (e,data)=>
  org_asset_path = data.org_asset.replace(/^.*assets/,'~&')
  new_asset_path = data.new_asset.replace(/^.*assets/,'~&')
  console.log new_asset_path
  console.log org_asset_path

  v = Data.document().replace(org_asset_path,new_asset_path)
  Data.active_asset("file://"+data.new_asset)
  Data.document v
  ipc.send('request-assets',project: Data.active_file())

ipc.on 'response-new-project', (e,data)=>
  Data.document ''
  Data.active_asset null
  Data.last_saved ''
  Data.active_file data.name
  m.redraw(true)


# global hotkeys
document.addEventListener 'keydown', (e)=>
  meta =
  if os.platform() is 'darwin'
    'Meta'
  else
    'Control'
  Data.meta(true)  if e.key is meta
  Data.shift(true) if e.key is 'Shift'
  if Data.meta()
    if e.key is 'f'
      ipc.send('toggle-fullscreen')
    else if e.key is 'p'
      Data.publisher_preview !Data.publisher_preview()
      m.redraw(true)
    else if e.key is 'n'
      ipc.send('prompt-new')
    else if e.key is 's' && Data.shift()
      Data.splitview !Data.splitview()
      m.redraw(true)
    else if e.key is 'w' && Data.shift()
      Data.line_wrap !Data.line_wrap()
      m.redraw(true)
document.addEventListener 'keyup', (e)=>
  Data.meta(false)
  Data.shift(false)
