import * as m from 'mithril'
import fs from 'fs'
import Data from 'common/data'
import Save from 'common/save'
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
      Save.save ()=>
        console.log 'saving-on-switch', file.name, Data.markdown_path(file.name)
        data = fs.readFileSync(Data.markdown_path(file.name))
        Data.active_file file.name
        console.log 'new data', data.toString()
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
      image_path = "~&/#{file.id}/versions/#{file.versions[file.versions.length-1].epoch}#{file.versions[file.versions.length-1].ext}"
      TextInsert.at "\n![](#{image_path})"
  assets:=>
    m '.assets',
      m '.title',
        m 'span.n', 'Assets'
        m 'span.far.fa-folder', "data-tippy-content": "Reveal Project's Assets Folder", onclick: @reveal
        m 'em'
      for file in Data.assets()
        m 'a.asset', href: '#', onclick: @add(file),
          m 'span.n',
            m 'span.icon.far fa-file-image'
            m 'span', file.name
          m '.img', style: {right: "-#{Math.min(file.versions[file.versions.length-1].width,200)}px"},
            m 'img', src: "#{Data.home()}/#{Data.active_file()}/assets/#{file.id}/versions/#{file.versions[file.versions.length-1].epoch}#{file.versions[file.versions.length-1].ext}"
            m '.size', "#{file.versions[file.versions.length-1].width}x#{file.versions[file.versions.length-1].height} V#{file.versions.length}"
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
          m 'a', href: '#', class: @classes(file), onclick: @click(file), 
            m 'span.n', file.name
        if Data.active_file()
          @assets()
    ]
