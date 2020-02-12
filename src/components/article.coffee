import * as m from 'mithril'
import Textarea from 'components/textarea'
import Preview from 'components/preview'
import Data    from 'common/data'
import Save    from 'common/save'
import HotkeyHeading from 'lib/hotkey_heading'
import HotkeyWrap from 'lib/hotkey_wrap'


export default class Article
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
  image_border:=>
  image_dropshadow:=>
  image_drop:=>
  save:=>
    Save.save()
  header:=>
    m 'header',
      m 'section.main',
        m '.title', contenteditable: true,
          m.trust Data.active_file()
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
          m 'span.btn.crop', onclick: @image_crop,
            m 'span.fas.fa-crop-alt'
          m 'span.btn.crop', onclick: @image_resize,
            m 'span.fas.fa-compress'
          m 'span.btn.border', onclick: @image_border,
            m 'span.fas.fa-border-style'
        m 'em'
  panes:=>
    m '.panes',
      m Textarea
      m Preview
      m 'em'
  view:->
    m 'article',
      @header()
      @panes()
