import * as m from 'mithril'
import HotkeyHeading from 'lib/hotkey_heading'
import HotkeyWrap from 'lib/hotkey_wrap'
import Data from 'common/data'
import Save from 'common/save'
import TextInsert from 'lib/text_insert'
import {ipcRenderer as ipc} from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'

export default class Textarea
  constructor:->
  onupdate:(vnode)->
    #if Data.selectionStart() != false ||
       #Data.selectionEnd() != false
      #vnode.dom.focus()
    if Data.selectionStart() != false
      vnode.dom.selectionStart = Data.selectionStart()
      Data.selectionStart false
    if Data.selectionEnd() != false
      vnode.dom.selectionEnd = Data.selectionEnd()
      Data.selectionEnd false
  classes:=>
    classes = []
    classes.push 'line_wrap' if Data.line_wrap()
    classes.join(' ')
  attrs:=>
    attrs =
      class: @classes() 
      ondrop:(ev)=>
        ev.preventDefault()
        for file in ev.dataTransfer.files
          Save.asset file, (asset_versions_path)=>
            asset_path = asset_versions_path.replace(/^.*assets/,'~')
            TextInsert.at "\n![](#{asset_path})"
      ondragover:(ev)=>
        ev.preventDefault()
      onclick: (e)=>
        # TODO - Make selection detection more robust
        # https://stackoverflow.com/questions/46651479/textarea-selection-change
        Data._selectionStart e.target.selectionStart || 0
        Data._selectionEnd e.target.selectionEnd || 0

        Data.active_asset(null)
        # deselect images in markdown preview
        els = document.querySelectorAll('.preview img')
        el.classList.remove('selected') for el in els
      onkeydown: (e)=>
        meta =
        if os.platform() is 'darwin'
          'Meta'
        else
          'Control'
        Data.meta(true)  if e.key is meta
        Data.shift(true) if e.key is 'Shift'
        if Data.meta()
          start_at = e.target.selectionStart
          end_at   = e.target.selectionEnd
          if ['1','2','3','4','5'].indexOf(e.key) != -1
            data = HotkeyHeading.insert Data.document(), parseInt(e.key), start_at
            Data.document       data.value
            Data.selectionStart data.selectionStart
            Data.selectionEnd   data.selectionEnd
          else if e.key is 's'
            Save.save()
          else if e.key is 'b'
            data = HotkeyWrap.insert Data.document(), start_at, end_at, '**', '**'
            Data.document       data.value
            Data.selectionStart data.selectionStart
            Data.selectionEnd   data.selectionEnd
          else if e.key is 'g'
            data = HotkeyWrap.insert Data.document(), start_at, end_at, "<strong class='r'>", "</strong>"
            Data.document       data.value
            Data.selectionStart data.selectionStart
            Data.selectionEnd   data.selectionEnd
          else if e.key is 'd'
            data = HotkeyWrap.insert Data.document(), start_at, end_at, "<strong class='h'>", "</strong>"
            Data.document       data.value
            Data.selectionStart data.selectionStart
            Data.selectionEnd   data.selectionEnd
      onkeyup: (e)=>
        Data.meta(false)  if e.key is 'Meta'
        Data.shift(false) if e.key is 'Shift'
      oninput: (e)=>
        Data.document e.target.value
      value: Data.document()
  view:=>
    m 'textarea.pane.editor#editor', @attrs()
