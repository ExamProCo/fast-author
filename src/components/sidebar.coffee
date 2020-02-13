import * as m from 'mithril'
import fs from 'fs'
import Data from 'common/data'
import TextInsert from 'lib/text_insert'
import {ipcRenderer as ipc} from 'electron'

export default class Sidebar
  oninit:(vnode)->
    @value = vnode.attrs.value
  classes:(file)=>
    if file.name is Data.active_file()
      'active'
    else
      ''
  click:(file)=>
    =>
      data = fs.readFileSync(Data.markdown_path(file.name))
      Data.active_file  file.name
      Data.document data.toString()
      ipc.send('request-assets',project: Data.active_file())
  #add an asset where current cursor is located
  reveal:=>
    ipc.send('assets-reveal',path: "#{Data.home()}/#{Data.active_file()}/assets/")
  add:(file)=>
    =>
      TextInsert.at "![](#{file.path})"
  view:->
    m 'nav',
      m '.title',
          m 'span.n', 'Recent Projects'
          m 'em'
      for file in Data.files()
        m 'a', href: '#', class: @classes(file), onclick: @click(file), file.name
      if Data.active_file()
        m '.title',
          m 'span.n', 'Assets'
          m 'span.far.fa-folder', onclick: @reveal
          m 'em'
      for file in Data.assets()
        m 'a.asset', href: '#', onclick: @add(file),
          m 'span.icon.far fa-file-image'
          m 'span', file.name
          m '.img', style: {right: "-#{Math.min(file.width,200)}px"},
            m 'img', src: file.path
            m '.size', "#{file.width}x#{file.height}"
