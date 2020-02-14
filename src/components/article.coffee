import * as m from 'mithril'
import Textarea from 'components/textarea'
import { Remarkable } from 'remarkable'
import Preview from 'components/preview'
import Data    from 'common/data'
import Save    from 'common/save'
import HotkeyHeading from 'lib/hotkey_heading'
import HotkeyWrap from 'lib/hotkey_wrap'
import fs from 'fs'
import {ipcRenderer as ipc} from 'electron'
import os from 'os'


export default class Article
  constructor:->
    @md = new Remarkable({
      html: true
    })
  bold:=>
    target = document.getElementById('editor')
    start_at = target.selectionStart
    end_at   = target.selectionEnd
    data = HotkeyWrap.insert Data.document(), start_at, end_at, "**", "**"
    Data.document       data.value
    Data.selectionStart data.selectionStart
    Data.selectionEnd   data.selectionEnd
  red:=>
    target = document.getElementById('editor')
    start_at = target.selectionStart
    end_at   = target.selectionEnd
    data = HotkeyWrap.insert Data.document(), start_at, end_at, "<strong class='r'>", "</strong>"
    Data.document       data.value
    Data.selectionStart data.selectionStart
    Data.selectionEnd   data.selectionEnd
  underline:=>
  highlight:=>
    target = document.getElementById('editor')
    start_at = target.selectionStart
    end_at   = target.selectionEnd
    data = HotkeyWrap.insert Data.document(), start_at, end_at, "<strong class='h'>", "</strong>"
    Data.document       data.value
    Data.selectionStart data.selectionStart
    Data.selectionEnd   data.selectionEnd
  image_resize:=>
    console.log('send request', Data.active_asset())
    ipc.send('sharp-resize',asset: Data.active_asset())
  image_border:=>
    asset = Data.get_asset()
    el = document.getElementById('draw')
    ctx = el.getContext("2d")
    ctx.canvas.width  = asset.width
    ctx.canvas.height = asset.height
    ctx.beginPath()
    ctx.strokeStyle = "#000000"
    # x, y, width, height
    ctx.rect(0, 0, asset.width, asset.height)
    ctx.stroke()
    path = "/tmp/save-border.png"
    fs.writeFile path, el.toDataURL().replace(/^data:image\/png;base64,/, ""), 'base64', (err)->
      console.log(err)
      ipc.send('sharp-border',overlay: path, source: asset.path)
  image_dropshadow:=>
  image_drop:=>
  image_paint:=>
    asset = Data.get_asset()
    ipc.send('drawing-window',asset)
  fullscreen:=>
    ipc.send('toggle-fullscreen')
  toggle_line_wrap:=>
    Data.line_wrap !Data.line_wrap()
  publisher_preview:=>
    Data.publisher_preview !Data.publisher_preview()
  splitview:=>
    Data.splitview !Data.splitview()
  save:=>
    Save.save()
  meta_char:=>
    if os.platform() is 'darwin'
      '⌘'
    else
      'Ctrl'
  subeditor:=>
    m '.editor',
      m 'span.lbl', 'Editor'
      m 'span.btn.save', "data-tippy-content": "Save (#{@meta_char()}S)", onclick: @save,
        m 'span.far.fa-save'
      m 'span.btn.bold', "data-tippy-content": "Bold (#{@meta_char()}B)", onclick: @bold,
        m 'span', 'A'
      m 'span.btn.red', "data-tippy-content": "Red (#{@meta_char()}G)", onclick: @red,
        m 'span', 'A'
      #m 'span.btn.underline', onclick: @underline,
        #m 'span', 'A'
      m 'span.btn.highlight', "data-tippy-content": "Highlight (#{@meta_char()}D)", onclick: @highlight,
        m 'span', 'A'
      m 'span.btn.line-wrap', "data-tippy-content": "Toggle Line Wrap (#{@meta_char()}⇧W)", onclick: @toggle_line_wrap,
        m 'span.fas.fa-exchange-alt'
      m 'em'
  subpreview:=>
    return unless Data.splitview()
    m '.preview',
      m 'span.lbl', 'Preview'
      if Data.active_asset()
        [
          m 'span.btn.crop', "data-tippy-content": "Crop Image", onclick: @image_crop,
            m 'span.fas.fa-crop-alt'
          m 'span.btn.crop', "data-tippy-content": "Resize Image", onclick: @image_resize,
            m 'span.fas.fa-compress'
          m 'span.btn.border', "data-tippy-content": "Border Image", onclick: @image_border,
            m 'span.fas.fa-border-style'
          m 'span.btn.paint', "data-tippy-content": "Edit Image", onclick: @image_paint,
            m 'span.fas.fa-paint-brush'
        ]
      m 'em'
  subheader:=>
    return if Data.publisher_preview()
    m 'section.sub',
      @subeditor()
      @subpreview()
      m 'em'
  header:=>
    m 'header',
      m 'section.main',
        m '.title', contenteditable: true,
          m.trust Data.active_file()
        m 'span.btn.save', "data-tippy-content": "Publisher Preview (#{@meta_char()}P)", onclick: @publisher_preview,
          m 'span.far.fa-eye'
        m 'span.btn.fullscreen', "data-tippy-content": "Fullscreen (#{@meta_char()}F)", onclick: @fullscreen,
          m 'span.fas.fa-window-maximize'
        m 'span.btn.divide', "data-tippy-content": "Split view (#{@meta_char()}⇧S)", onclick: @splitview,
          m 'span.fas.fa-columns'
        m 'em'
      @subheader()
  classes_article:=>
    classes = []
    classes.push 'split' if Data.splitview()
    classes.join(' ')
  panes:=>
    m '.panes',
      m Textarea
      if Data.splitview()
        m Preview
      m 'em'
  view:->
    m 'article', class: @classes_article(),
      @header()
      if Data.publisher_preview()
        m '.publisher_preview.markdown',
          m.trust(@md.render(Data.document()))
      else
        @panes()
