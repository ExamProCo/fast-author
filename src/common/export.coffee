import fs from 'fs'
import path from 'path'
import Data    from 'common/data'
export default class Export
  @rewrite:(replace_dirs,content)=>
    for redir in replace_dirs
      re = new RegExp(redir + '/', 'g')
      content = content.replace(re,'')
    content
  @copy_assets_and_replace_map:(dir,html_body)=>
    results = html_body.match(/src=".+?"/g)
    replace_dirs = []
    if results
      for result in results
        url = result.replace('src="','').replace(/"$/,'')
        current_dir = path.dirname url
        if replace_dirs.indexOf(dir) is -1
          replace_dirs.push current_dir

        filename    = path.basename(url)
        destination = [dir,filename].join('/')

        fs.copyFile url, destination, (err) =>
          if (err)
            console.log('copy err', err)
          else
            console.log 'copied', url, destination
    return replace_dirs
  @html:(html_body)=>
    html_start = """
<html>
  <head>
    <title>
      #{Data.active_file()}
    </title>
    <link type="text/css" rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
    """

    html_end = """
    </main>
  </body>
</html>
    """
    html_start + html_body + html_end
  @css:=>
    css = """
* { box-sizing: border-box; }
html, body { 
  background: rgb(240,240,240);
  padding: 0;
  margin: 0;
  font-family: arial;
}
main {
  width: 880px;
  border-radius: 4px;
  border: solid 1px rgb(210,210,210);
  background: #fff;
  padding: 24px 77px;
  margin: 0px auto;
  margin-top: 24px;
  box-shadow: 1px 1px 0px #c2c2c2;
}
.markdown h1, h2, h3, h4, h5, h6 {
  margin: 0px;
  margin-bottom: 12px;
}
.markdown h1 { font-size: 32px }
.markdown h2 { font-size: 24px }
.markdown h3 { font-size: 20px }
.markdown h4 { font-size: 16px }
.markdown p  { margin-top: 0px }
.mardown img {
  margin: 0;
  display: block;
  border: solid 1px rgb(255,255,255)
}
.markdown code {
  background: #d6dbe6;
  border-radius: 4px;
  font-family: Menlo, Verdana;
  padding: 1px 4px;
  font-size: 14px;
}
.markdown pre code {
  padding: 16px;
  overflow: auto;
  display: block;
}
.markdown blockquote {
  margin-left: 0;
  border-left: solid 8px #ffb885;
}
.markdown blockquote p {
  margin-left: 24px;
}
.markdown table {
  border-collapse: collapse;
  margin-bottom: 16px;
}
.markdown table th,
.markdown table td {
  border: solid 1px rgb(200,200,200);
  padding: 8px;
}
    """
