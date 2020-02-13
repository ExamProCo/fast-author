import * as m from 'mithril'
import Sidebar from 'components/sidebar'
import Article from 'components/article'
import Infobar from 'components/infobar'
import Data from 'common/data'
import tippy from 'tippy.js'

export default class ArticleView
  oncreate:(vnode)->
    console.log('tippy')
    tippy('[data-tippy-content]')
  classes:=>
    if Data.publisher_preview()
      'ppreview'
    else
      ''
  view:->
    m 'main', class: @classes(),
      m 'canvas#draw'
      unless Data.publisher_preview()
        m Sidebar
      if Data.active_file()
        [
          m Article
          unless Data.publisher_preview()
            m Infobar
        ]
