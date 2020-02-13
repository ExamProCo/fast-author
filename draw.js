const { ipcRenderer: ipc } = require('electron')
const fs = require('fs')

let asset = null
let mode = null
let mode_alt = null

ipc.on('drawing-loaded', function(e,opts){
  asset = opts.asset
  const path = opts.asset.path.replace(/^/,'file://')
  document.getElementById('source').src = path

  const el = document.getElementById('draw')
  ctx = el.getContext("2d")
  ctx.canvas.width  = opts.asset.width
  ctx.canvas.height = opts.asset.height
})



const rect_data = {
  state: 0,
  x: null,
  y: null,
  width: null,
  height: null
}

const rect = function(ev){
  ev.target.classList.add('selected')
  mode = 'rect'
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
    ctx.rect(coords.x-12, coords.y-12, 24, 24)
    ctx.fillStyle = "#FF0000"
    ctx.fill()
    ctx.font = "14px Arial";
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
        ctx.strokeStyle = "#FF0000"
        ctx.rect(
          rect_data.x,
          rect_data.y,
          rect_data.width,
          rect_data.height
        )
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
  let path = "/tmp/save-drawing-overlay.png"
  const el = document.getElementById('draw')
  fs.writeFile(path, el.toDataURL().replace(/^data:image\/png;base64,/, ""), 'base64', function(err){
    console.log(err)
    ipc.send('sharp-draw',{overlay: path, source: asset.path})
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

document.querySelector('.btn.rec').addEventListener('click',rect)
document.querySelector('.btn.mk1').addEventListener('click',marker(1))
document.querySelector('.btn.mk2').addEventListener('click',marker(2))
document.querySelector('.btn.mk3').addEventListener('click',marker(3))
document.querySelector('.btn.mk4').addEventListener('click',marker(4))
document.querySelector('.btn.mk5').addEventListener('click',marker(5))
document.querySelector('.btn.mk6').addEventListener('click',marker(6))
document.querySelector('.btn.save').addEventListener('click',save)
