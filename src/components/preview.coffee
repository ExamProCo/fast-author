import * as m from 'mithril'
import { Remarkable } from 'remarkable'
import Data    from 'common/data'

# TODO - Maybe include this?
#  https://github.com/jonschlinkert/pretty-remarkable

#HighlightPlugin = (md,options)->
  #md.ruler.push 'highlight', ()->
    #console.log 'highlight_args', arguments
  #,{}
  #console.log md

# TODO - maybe add marching ants for selected images 
# https://css-tricks.com/svg-marching-ants/

export default class Preview
  constructor:->
    @md = new Remarkable({
      html: true
    })
    #@md.use HighlightPlugin
  select_image:(ev)=>
    # first remove existing selected
    els = document.querySelectorAll('.preview img')
    el.classList.remove('selected') for el in els
    Data.active_asset ev.target.src
    ev.target.classList.add('selected')
    m.redraw(true)
  onupdate:(vnode)=>
    els = document.querySelectorAll('.preview img')
    for el in els
      el.addEventListener("click", @select_image)
  view:=>
    m '.pane.preview.markdown',
      m.trust(@md.render(Data.document()))
