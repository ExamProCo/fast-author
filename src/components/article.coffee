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
    path = "/Users/andrew/Desktop/out3.png"
    fs.writeFile path, el.toDataURL().replace(/^data:image\/png;base64,/, ""), 'base64', (err)->
      console.log(err)
      ipc.send('sharp-border',overlay: path, source: asset.path)
  image_dropshadow:=>
  image_drop:=>
  image_paint:=>
    asset = Data.get_asset()
    ipc.send('drawing-window',asset)
  publisher_preview:=>
    Data.publisher_preview !Data.publisher_preview()
  save:=>
    Save.save()
  subheader:=>
    m 'section.sub',
      m '.editor',
        m 'span.lbl', 'Editor'
        m 'span.btn.save', onclick: @save,
          m 'span.far.fa-save'
        m 'span.btn.bold', onclick: @bold,
          m 'span', 'bold'
        m 'span.btn.red', onclick: @red,
          m 'span', 'red'
        m 'span.btn.underline', onclick: @underline,
          m 'span', 'underline'
        m 'span.btn.highlight', onclick: @highlight,
          m 'span', 'highlight'
        m 'em'
      m '.preview',
        m 'span.lbl', 'Preview'
        if Data.active_asset()
          [
            m 'span.btn.crop', onclick: @image_crop,
              m 'span.fas.fa-crop-alt'
            m 'span.btn.crop', onclick: @image_resize,
              m 'span.fas.fa-compress'
            m 'span.btn.border', onclick: @image_border,
              m 'span.fas.fa-border-style'
            m 'span.btn.paint', onclick: @image_paint,
              m 'span.fas.fa-paint-brush'
          ]
      m 'em'
  header:=>
    m 'header',
      m 'section.main',
        m '.title', contenteditable: true,
          m.trust Data.active_file()
        m 'span.btn.save', onclick: @publisher_preview,
          m 'span.far.fa-eye'
        m 'em'
      unless Data.publisher_preview()
        @subheader()
  panes:=>
    m '.panes',
      m Textarea
      m Preview
      m 'em'
  view:->
    m 'article',
      @header()
      if Data.publisher_preview()
        m '.publisher_preview.markdown',
          m.trust(@md.render(Data.document()))
      else
        @panes()
