import * as m from 'mithril'
import Data from 'common/data'

export default class Infobar
  view:=>
    m '.infobar',
      if Data._selectionStart()
        m 'span', Data._selectionStart()
      m 'span', ':'
      if Data._selectionEnd()
        m 'span', Data._selectionEnd()

      m 'span.b', "Saved "
      if Data.last_saved()
        m 'span.date', Data.last_saved()
