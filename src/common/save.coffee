import Data from 'common/data'
import * as m from 'mithril'
import fs from 'fs'
import * as fx from 'mkdir-recursive'
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
  save:(callback)=>
    date = new Date().getTime()
    epoch = Math.round(date / 1000)
    current_path = "#{Data.home()}/#{Data.active_file()}/index.md"

    backup_dir   = "#{Data.home()}/#{Data.active_file()}/backups/"
    backup_path  = "#{backup_dir}/#{epoch}.md"

    # create dir if it don't exist.
    if !fs.existsSync(backup_dir)
      fx.mkdirSync backup_dir

    fs.copyFile current_path, backup_path, (err) =>
      console.log('copyFile',err) if err
      fs.writeFile current_path, Data.document(), (err)->
        console.log('writeFile',err) if err
        Data.last_saved moment(date).format('MMM D YYYY hh:mm:ss a')
        m.redraw(true)
        callback() if callback
export default new Save()
