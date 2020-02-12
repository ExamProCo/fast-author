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
export default class Preview
  constructor:->
    @md = new Remarkable({
      html: true
    })
    #@md.use HighlightPlugin
  view:=>
    m '.pane.preview.markdown',
      m.trust(@md.render(Data.document()))
