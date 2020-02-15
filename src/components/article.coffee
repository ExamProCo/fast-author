import * as m from 'mithril'
import Textarea from 'components/textarea'
import { Remarkable } from 'remarkable'
import Preview from 'components/preview'
import Data    from 'common/data'
import Save    from 'common/save'
import HotkeyHeading from 'lib/hotkey_heading'
import HotkeyWrap from 'lib/hotkey_wrap'
import fs from 'fs'
import Path from 'path'
import * as fx from 'mkdir-recursive'
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
    ipc.send('sharp-resize',project: Data.active_file(),asset: Data.active_asset())
  image_border:=>
    asset = Data.get_asset()
    epoch = parseInt(Data.active_asset().match(/versions\/(.+)/)[1])

    version = null
    for a in asset.versions
      if a.epoch is epoch
        version = a
        break
    console.log('ver', version)
    el = document.getElementById('draw')
    ctx = el.getContext("2d")
    console.log 'asset', asset
    ctx.canvas.width  = version.width
    ctx.canvas.height = version.height
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = "#000000"
    # x, y, width, height
    ctx.rect(0, 0, version.width, version.height)
    ctx.stroke()
    tmp_path = "/tmp/save-border.png"
    fs.writeFile tmp_path, el.toDataURL().replace(/^data:image\/png;base64,/, ""), 'base64', (err)->
      console.log('err',err) if err
      source = Data.active_asset().replace('file://','')
      console.log('source',source)
      ipc.send('sharp-border',project: Data.active_file(), overlay: tmp_path, source: source)
  replace:=>

  export:=>
   el   = document.querySelector '.pane.preview.markdown'
   html = el.outerHTML

   date  = new Date().getTime()
   epoch = Math.round(date / 1000)
   filename  = "index.html"
   dir = "#{Data.home()}/#{Data.active_file()}/exports/#{epoch}"

   # create dir if it don't exist.
   if !fs.existsSync(dir)
     fx.mkdirSync dir
   path = [dir,filename].join('/')

   results = html.match(/src=".+?"/g)

   replace_dirs = []
   if results
     for result in results
       url = result.replace('src="','').replace(/"$/,'')
       current_dir = Path.dirname url
       if replace_dirs.indexOf(dir) is -1
         replace_dirs.push current_dir

       filename    = Path.basename(url)
       destination = [dir,filename].join('/')

       console.log 'copying', url, destination
       fs.copyFile url, destination, (err) =>
         if (err)
           console.log('copy err', err)
         else
           console.log 'copied', url, destination

   for redir in replace_dirs
     re = new RegExp(redir + '/', 'g')
     html = html.replace(re,'')

   fs.writeFile path, html, (err)->
    console.log('err',err) if err
    console.log('exported-to:',path)
    ipc.send('assets-reveal',path: "#{dir}/")
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
      m 'span.btn.export', "data-tippy-content": "Export Preview to HTML", onclick: @export,
        m 'span.fas fa-file-export'
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
