const glob = require('glob')
const path = require('path')
const fs = require('fs')
const request = require('request')


const files = glob.sync(export_path+'/*')

let file_path, ext

const export_path = "/Users/andrew/fast-author/Networking-Project/exports/1583692286"
const access_key    = ''
const access_secret = ''
const material_id   = 1212
const host = 'http://localhost:3000'


const promises = []

for (let i = 0; i < files.length; i++) {
  file_path = files[i]
  ext = path.extname(file_path)
  if (ext === '.png' || ext === '.jpg' || ext === '.gif'){
    console.log('file',file_path)
    promises.push(upload(file_path,material_id,access_key,access_secret))
  } // if
} // for

Promise.all(promises).then(function(results){
  let org, re, markdown

  console.log('promise results', results)

  markdown = fs.readFileSync(export_path+"/index.md")
  markdown = markdown.toString()

  for (let i = 0; i < results.length; i++) {
    org = path.basename(results[i][0])
    re = new RegExp(org, 'g')
    markdown = markdown.replace(re,results[i][1])
  } // for
  update_markdown(markdown)
})

function update_markdown(markdown){
  const url = `${host}/admin/api/materials/${material_id}/import_markdown?access_key=${access_key}&access_secret=${access_secret}`
  const options = {
    url: url,
    body: JSON.stringify({body: markdown}),
    headers: {
    'Content-Type':  'application/json'
    }
  }
  request.post(options, function(error, response, body) {
    if (error) {
      console.log('err',error)
      return
    }
    console.log('response-body',body)
  })
}

function upload(file,material_id,access_key,access_secret){
  return new Promise((resolve, reject) => {
    console.log('file',file)
    const url = `${host}/admin/api/materials/${material_id}/asset_presigned_url?access_key=${access_key}&access_secret=${access_secret}`
    request.post(url,function(error, response, body) {
      if (error) {
        console.log('err',error)
        return
      }
      const data = JSON.parse(body)
      //console.log('  > presigned_url',data.presigned_url)
      console.log('public_url',data.public_url)

      const ext  = path.extname(file)
      const file_data = new Buffer(fs.readFileSync(file).toString('base64'),'base64')
      //fs.createReadStream(file

      let mime_type = null
      if (ext == '.jpg') {
        mime_type = 'image/jpeg'
      }
      else if (ext === '.png') {
        mime_type = 'image/png'
      }
      else if (ext === '.gif') {
        mime_type = 'image/gif'
      } else {
        throw "bad mime type"
      }

      //console.log('mime-type',mime_type)

      // Read about S3 headers
      // https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html#API_PutObject_RequestSyntax
      const options = {
        url: data.presigned_url,
        body: file_data,
        headers: {
          "Content-Type": mime_type,
          "Content-Encoding": 'base64'
        }
      }
      request.put(options,function(error,response,body){
        if (error) {
          console.log('err',error)
          return
        } else {
          resolve([file,data.public_url])
        }
      })
    }) // request.post
  }) // Promise
}

