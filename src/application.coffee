import * as m from 'mithril'
import ArticleView from 'views/article'
import {ipcRenderer as ipc} from 'electron'
import Data from 'common/data'
import Save from 'common/save'

routes =
  '/': ArticleView
m.route.prefix = ''
m.route document.body, '/', routes

Save.auto()

ipc.send('request-markdown-files')
ipc.on 'response-markdown-files', (e,data)=>
  Data.home data.home
  Data.files data.files
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
