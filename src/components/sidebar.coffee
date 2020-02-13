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
  reveal_home:=>
    ipc.send('assets-reveal',path: "#{Data.home()}/")
  reindex:=>
    ipc.send('request-markdown-files')
    if Data.active_file()
      ipc.send('request-assets',project: Data.active_file())
  new_project:=>
    ipc.send('prompt-new')
  add:(file)=>
    =>
      TextInsert.at "![](#{file.path})"
  view:->
    [
      m '.nav_heading',
        m '.btn.refresh', "data-tippy-content": "Refresh Sidebar", onclick: @reindex,
          m 'span.fas.fa-sync'
        m '.btn.new', "data-tippy-content": "New Project", onclick: @new_project,
          m 'span.fas.fa-plus'
        m 'em'
      m 'nav',
        m '.title',
            m 'span.n', 'Recent Projects'
            m 'span.far.fa-folder', "data-tippy-content": "Reveal Projects Folder", onclick: @reveal_home
            m 'em'
        for file in Data.files()
          m 'a', href: '#', class: @classes(file), onclick: @click(file), file.name
        if Data.active_file()
          m '.title',
            m 'span.n', 'Assets'
            m 'span.far.fa-folder', "data-tippy-content": "Reveal Project's Assets Folder", onclick: @reveal
            m 'em'
        for file in Data.assets()
          m 'a.asset', href: '#', onclick: @add(file),
            m 'span.icon.far fa-file-image'
            m 'span', file.name
            m '.img', style: {right: "-#{Math.min(file.width,200)}px"},
              m 'img', src: file.path
              m '.size', "#{file.width}x#{file.height}"
    ]
