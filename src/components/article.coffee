import * as m from 'mithril'
import Textarea from 'components/textarea'
import { Remarkable } from 'remarkable'
import Preview from 'components/preview'
import Data    from 'common/data'
import Save    from 'common/save'
import HotkeyHeading from 'lib/hotkey_heading'
import HotkeyWrap from 'lib/hotkey_wrap'
import uuidv4 from 'uuid/v4'
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
    ipc.send('sharp-resize',project: Data.active_file(),asset: Data.active_asset())
  image_border:=>
    version = Data.get_asset_version()
    el = document.querySelector('#draw')
    el.innerHTML = ''

    new_canvas = document.createElement('canvas')
    el.appendChild new_canvas

    canvas = document.querySelector('#draw canvas')

    ctx = canvas.getContext("2d")
    ctx.canvas.width  = version.width
    ctx.canvas.height = version.height
    ctx.clearRect 0, 0, ctx.canvas.width, ctx.canvas.height
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = "#000000"
    # x, y, width, height
    ctx.rect(0, 0, version.width, version.height)
    ctx.stroke()
    tmp_path = "/tmp/save-border-#{uuidv4()}.png"
    fs.writeFile tmp_path, canvas.toDataURL().replace(/^data:image\/png;base64,/, ""), 'base64', (err)->
      console.log('err',err) if err
      source = Data.active_asset().replace('file://','')
      ipc.send('sharp-border',project: Data.active_file(), overlay: tmp_path, source: source)
  replace:=>

  export:=>
    el   = document.querySelector '.pane.preview.markdown'
    html_body = el.outerHTML

    date  = new Date().getTime()
    epoch = Math.round(date / 1000)
    filename  = "index.html"
    dir = "#{Data.home()}/#{Data.active_file()}/exports/#{epoch}"

    # create dir if it don't exist.
    if !fs.existsSync(dir)
      fx.mkdirSync dir
    path = [dir,filename].join('/')
    css_path = [dir,'style.css'].join('/')

    results = html_body.match(/src=".+?"/g)

    replace_dirs = []
    if results
      for result in results
        url = result.replace('src="','').replace(/"$/,'')
        current_dir = Path.dirname url
        if replace_dirs.indexOf(dir) is -1
          replace_dirs.push current_dir

        filename    = Path.basename(url)
        destination = [dir,filename].join('/')

        fs.copyFile url, destination, (err) =>
          if (err)
            console.log('copy err', err)
          else
            console.log 'copied', url, destination

    for redir in replace_dirs
      re = new RegExp(redir + '/', 'g')
      html_body = html_body.replace(re,'')

    html_start = """
<html>
  <head>
    <title>
      #{Data.active_file()}
    </title>
    <link type="text/css" rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
    """

    html_end = """
    </main>
  </body>
</html>
   """
    html = html_start + html_body + html_end
    css = """
* { box-sizing: border-box; }
html, body { 
  background: rgb(240,240,240);
  padding: 0;
  margin: 0;
  font-family: arial;
}
main {
  width: 880px;
  border-radius: 4px;
  border: solid 1px rgb(210,210,210);
  background: #fff;
  padding: 24px 77px;
  margin: 0px auto;
  margin-top: 24px;
  box-shadow: 1px 1px 0px #c2c2c2;
}
.markdown h1, h2, h3, h4, h5, h6 {
  margin: 0px;
  margin-bottom: 12px;
}
.markdown h1 { font-size: 32px }
.markdown h2 { font-size: 24px }
.markdown h3 { font-size: 20px }
.markdown h4 { font-size: 16px }
.markdown p  { margin-top: 0px }
.mardown img {
  margin: 0;
  display: block;
  border: solid 1px rgb(255,255,255)
}
.markdown code {
  background: #d6dbe6;
  border-radius: 4px;
  font-family: Menlo, Verdana;
  padding: 1px 4px;
  font-size: 14px;
}
.markdown pre code {
  padding: 16px;
  overflow: auto;
  display: block;
}
.markdown blockquote {
  margin-left: 0;
  border-left: solid 8px #ffb885;
}
.markdown blockquote p {
  margin-left: 24px;
}
.markdown table {
  border-collapse: collapse;
  margin-bottom: 16px;
}
.markdown table th,
.markdown table td {
  border: solid 1px rgb(200,200,200);
  padding: 8px;
}
    """

    fs.writeFile path, html, (err)->
      console.log('err',err) if err
      fs.writeFile css_path, css, (err)->
        "#{Data.home()}/#{Data.active_file()}/style.css"
        console.log('err',err) if err
        ipc.send('assets-reveal',path: "#{dir}/")

  image_dropshadow:=>
  image_drop:=>
  image_paint:=>
    asset = Data.get_asset()
    version = Data.get_asset_version()
    ipc.send 'drawing-window',
      project: Data.active_file()
      path: Data.active_asset()
      version: version
      asset: asset
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
          m.trust @md.render(Data.render())
      else
        @panes()
