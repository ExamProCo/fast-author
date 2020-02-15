const uuidv4 = require('uuid/v4')
const size_of = require('image-size')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const fx = require('mkdir-recursive')

const project_path = '/Users/andrew/Desktop/EB-Project'
const glob_path = '/Users/andrew/Desktop/EB-Project/assets/original/*'
const manifest_path = '/Users/andrew/Desktop/EB-Project/assets-manifest.json'

let date, epoch, uuid, ext, basename, file, manifest_item, asset_versions_path

const assets_manifest = []

glob(glob_path, {}, (err, files)=>{
  for (let i = 0; i < files.length; i++) {
    file_path = files[i]
    console.log(file_path)
    date = new Date().getTime()
    epoch = Math.round(date / 1000)
    uuid = uuidv4()
    ext      = path.extname(file_path)
    basename = path.basename(file_path)
    dimensions = size_of(file_path)

    asset_path          = [project_path,'assets',uuid,basename].join('/')
    asset_versions_path = [project_path,'assets',uuid,'versions', `${epoch}${ext}`].join('/')
    fx.mkdirSync(path.dirname(asset_path))
    fx.mkdirSync(path.dirname(asset_versions_path))

    // save version
    fs.copyFile(file_path, asset_path, function(err){
      if (err) { console.log('copyFile',err)}
    })
    // save orginal
    fs.copyFile(file_path, asset_versions_path, function(err){
      if (err) { console.log('copyFile',err)}
    })

    manifest_item = {
      id: uuid,
      name: path.basename(file_path,ext),
      original: {
        name: basename,
        width: dimensions.width,
        height: dimensions.height,
        ext: ext,
      },
      versions: [{epoch: epoch, width: dimensions.width, height: dimensions.height, ext: ext}]
    }
    assets_manifest.push(manifest_item)
  }
  console.log(assets_manifest)
  data = JSON.stringify(assets_manifest,null, 2)
  fs.writeFileSync(manifest_path, data)
})

