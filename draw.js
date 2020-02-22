const { ipcRenderer: ipc } = require('electron')
const fs = require('fs')
const uuidv4 = require('uuid/v4')

let asset = null
let project = null
let version = null
let active_path = null
let mode = null
let mode_alt = null

ipc.on('drawing-loaded', function(e,opts){
  console.log('drawing-load:opts', opts)
  asset = opts.asset
  version = opts.version
  active_path = opts.path.replace('file://','')
  project = opts.project
  document.getElementById('source').src = active_path

  const el = document.getElementById('draw')
  ctx = el.getContext("2d")
  ctx.canvas.width  = version.width
  ctx.canvas.height = version.height
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
})



const rect_data = {
  state: 0,
  x: null,
  y: null,
  width: null,
  height: null
}

const rect = function(model_alt){
  return function(ev){
    ev.target.classList.add('selected')
    mode = 'rect'
    mode_alt = model_alt
  }
}

const marker = function(val){
  return function(ev){
    ev.target.classList.add('selected')
    mode = 'marker'
    mode_alt = val
  }
}

const click_canvas = function(ev){
  if (mode === 'marker') {
    let coords = ev.target.relMouseCoords(ev)
    ctx.beginPath()
    ctx.rect(coords.x-12 + 0.5, coords.y-12 + 0.5, 24, 24)
    ctx.fillStyle = "#FF0000"
    ctx.fill()
    ctx.font = "14px Arial";
    ctx.lineWidth = 1
    ctx.fillStyle = "#FFFFFF"
    ctx.strokeStyle = "#FFFFFF"
    ctx.strokeText(mode_alt, coords.x-4, coords.y+4);
  } else if (mode === 'rect') {
    let coords = ev.target.relMouseCoords(ev)
    switch (rect_data.state) {
      case 0:
        rect_data.x = coords.x
        rect_data.y = coords.y
        rect_data.state = 1
        break;
      case 1:
        rect_data.width = coords.x - rect_data.x
        rect_data.height = coords.y - rect_data.y
        ctx = ev.target.getContext("2d")
        ctx.beginPath()
        ctx.lineWidth = 3
        if (mode_alt === 'black'){
          ctx.strokeStyle = "#000000"
          ctx.fillStyle = "#000000"
        } else if (mode_alt === 'red') {
          ctx.strokeStyle = "#FF0000"
        }
        ctx.rect(
          rect_data.x + 0.5,
          rect_data.y + 0.5,
          rect_data.width,
          rect_data.height
        )
        if (mode_alt === 'black'){
          ctx.fill()
        }
        ctx.stroke()
        rect_data.state = 0
        document.querySelector('.btn.rec').classList.remove('selected')
        mode = null
        break;
    }
  }
}

function save(){
  console.log('saving')
  let path = `/tmp/drawing-overlay-${uuidv4()}.png`
  const el = document.getElementById('draw')
  fs.writeFile(path, el.toDataURL().replace(/^data:image\/png;base64,/, ""), 'base64', function(err){
    console.log(err)
    ipc.send('sharp-draw',{project: project, overlay: path, source: active_path})
  })
}

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords

document.querySelector('canvas').addEventListener('click',click_canvas)

document.querySelector('.btn.rec.red').addEventListener('click',rect('red'))
document.querySelector('.btn.rec.black').addEventListener('click',rect('black'))
document.querySelector('.btn.mk1').addEventListener('click',marker(1))
document.querySelector('.btn.mk2').addEventListener('click',marker(2))
document.querySelector('.btn.mk3').addEventListener('click',marker(3))
document.querySelector('.btn.mk4').addEventListener('click',marker(4))
document.querySelector('.btn.mk5').addEventListener('click',marker(5))
document.querySelector('.btn.mk6').addEventListener('click',marker(6))
document.querySelector('.btn.save').addEventListener('click',save)
