import * as m from 'mithril'
import Sidebar from 'components/sidebar'
import Article from 'components/article'
import Infobar from 'components/infobar'
import Data from 'common/data'

export default class ArticleView
  view:->
    m 'main',
      m Sidebar
      if Data.active_file()
        [
          m Article
          m Infobar
        ]
