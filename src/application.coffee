import * as m from 'mithril'
import ArticleView from 'views/article'
import {ipcRenderer as ipc} from 'electron'
import Data from 'common/data'
import Save from 'common/save'
import os from 'os'

routes =
  '/': ArticleView
m.route.prefix = ''
m.route document.body, '/', routes

Save.auto()

ipc.send('request-markdown-files')
ipc.on 'response-markdown-files', (e,data)=>
  Data.home data.home
  Data.files data.files
  if Data.active_file() 
    ## reset asset in case where image is inserted but doesn't
    ## have width and height.
    #file = null
    #for d in data.files
      #if d.path is Data.active_file().replace('file://','')
        #file = d
        #break
    #console.log('active file',file)
    #Data.active_file file
  else
    Data.active_file Data.files()[0].path
  m.redraw(true)
ipc.on 'response-assets', (e,data)=>
  Data.assets data.files
  m.redraw(true)
ipc.on 'response-sharp', (e,data)=>
  console.log 'response sharp', data
  v = Data.document().replace(data.org_asset,data.new_asset)
  Data.active_asset("file://"+data.new_asset)
  Data.document v
  ipc.send('request-assets',project: Data.active_file())

ipc.on 'response-new-project', (e,data)=>
  Data.active_file data.path
  console.log data.path
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
document.addEventListener 'keyup', (e)=>
  Data.meta(false)  if e.key is 'Meta'
  Data.shift(false) if e.key is 'Shift'
