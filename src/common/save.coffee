import Data from 'common/data'
import * as m from 'mithril'
import fs from 'fs'
import moment from 'moment'

class Save
  auto:=>
    setInterval =>
      console.log 'saving'
      return unless Data.active_file()
      console.log 'saving-proceed'
      @save()
    # save every 5 minutes
    , (1000*60)*5
  save:=>
    date = new Date().getTime()
    epoch = Math.round(date / 1000)
    current_path = "#{Data.home()}/#{Data.active_file()}/index.md"
    backup_path  = "#{Data.home()}/#{Data.active_file()}/.backups/#{epoch}.md"
    fs.copyFile current_path, backup_path, (err) =>
      console.log('copyFile',err) if err
      fs.writeFile current_path, Data.document(), (err)->
        console.log('writeFile',err) if err
    Data.last_saved moment(date).format('MMM D YYYY hh:mm:ss a')
    m.redraw(true)
export default new Save()
