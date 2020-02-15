import Data from 'common/data'
import * as m from 'mithril'
import fs from 'fs'
import * as fx from 'mkdir-recursive'
import moment from 'moment'
import path from 'path'
import uuidv4 from 'uuid/v4'
import {ipcRenderer as ipc} from 'electron'
import size_of from 'image-size'

class Save
  asset:(file,callback)=>
    manifest_path = [Data.home(),Data.active_file(),'assets-manifest.json'].join('/')
    raw_data      = fs.readFileSync(manifest_path)
    assets_manifest = JSON.parse(raw_data)

    date = new Date().getTime()
    epoch = Math.round(date / 1000)

    ext      = path.extname file.path
    basename = path.basename file.path

    uuid = uuidv4()
    asset_path          = [Data.home(),Data.active_file(),'assets',uuid,basename].join('/')
    asset_versions_path = [Data.home(),Data.active_file(),'assets',uuid,'versions', "#{epoch}#{ext}"].join('/')
    fx.mkdirSync path.dirname(asset_path)
    fx.mkdirSync path.dirname(asset_versions_path)

    dimensions = size_of(file.path)

    assets_manifest.push
      id: uuid,
      name: path.basename(file.path,ext)
      original:
        name: basename
        width: dimensions.width
        height: dimensions.height
        ext: ext
      versions: [{epoch: epoch, width: dimensions.width, height: dimensions.height, ext: ext}]

    # save version
    fs.copyFile file.path, asset_path, (err) =>
      console.log('copyFile',err) if err
      callback(asset_versions_path)
      m.redraw(true)

    #save orginal
    fs.copyFile file.path, asset_versions_path, (err) =>
      console.log('copyFile',err) if err

    data = JSON.stringify(assets_manifest,null, 2)
    fs.writeFileSync(manifest_path, data)

    Data.keep_selection()
    ipc.send('request-assets',project: Data.active_file())
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
