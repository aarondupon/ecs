

export default function plot2(propname, x, y, color = '#ff0000') {
  if(!document.getElementById('graph-canvas')){
    var canvas = document.createElement('canvas');
    canvas.id = 'graph-canvas';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.zIndex   = 99999999999999999999;
    canvas.style.position = 'absolute';
    canvas.style.border   ='0px solid';
    canvas.style.backgroundColor   ='rgba(0,0,0,.4)';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
  }

  const GRAPH_CANVAS =  canvas;
  
  // if (!this.props.console && !this.props.debug) return;
  if (!GRAPH_CANVAS.graph) GRAPH_CANVAS.graph = [];

  const ctx = GRAPH_CANVAS.getContext('2d');
  const graphScale = 0.03;//
  
  if (x%GRAPH_CANVAS.width >= GRAPH_CANVAS.width-1) {
    ctx.clearRect(0, 0, GRAPH_CANVAS.width, GRAPH_CANVAS.height);
    GRAPH_CANVAS.graph.lasttime = 0;
    return
  }
  
  var x = x %  GRAPH_CANVAS.width;

  var y = y * graphScale + GRAPH_CANVAS.height / 2;
  // if (this.lastX > x) this.lastX = 1;
  ctx.beginPath();
  ctx.moveTo(GRAPH_CANVAS.graph.lasttime || 0, GRAPH_CANVAS.graph[propname] || GRAPH_CANVAS.height / 2);
  // console.log( 'moveTo',GRAPH_CANVAS.graph['lasttime'] || 0 ,', ',  GRAPH_CANVAS.graph[propname] || GRAPH_CANVAS.height / 2)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();

  

  GRAPH_CANVAS.graph[propname] = y;
  GRAPH_CANVAS.graph.lasttime = x;
}
