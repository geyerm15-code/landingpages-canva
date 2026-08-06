export function generateCanvasHTML(frameUrls: string[], containerId: string): string {
  return `<style>
#${containerId}{
  position:relative;
  width:100vw;
  margin-left:calc(-50vw + 50%);
  height:100svh;
  overflow:hidden;
  background:#000;
  touch-action:pan-y;
  scroll-snap-align:start;
  scroll-snap-stop:always;
}
#${containerId}-canvas{
  width:100%;
  height:100%;
  display:block;
}
.elementor-widget-html,.elementor-widget-container{margin:0!important;padding:0!important;line-height:0!important;}
</style>
<div id="${containerId}">
  <canvas id="${containerId}-canvas"></canvas>
</div>
<script>
(function(){
  var frames=${JSON.stringify(frameUrls)};
  var outer=document.getElementById('${containerId}');
  var canvas=document.getElementById('${containerId}-canvas');
  var ctx=canvas.getContext('2d');
  var images=[];
  var currentFrame=0;
  var totalFrames=frames.length;
  
  function resize(){
    var FW=outer.offsetWidth;
    var FH=outer.offsetHeight;
    canvas.width=FW;
    canvas.height=FH;
    draw(currentFrame);
  }
  
  function draw(idx){
    var img=images[idx];
    if(!img||!img.complete||!img.naturalWidth)return;
    var FW=canvas.width;
    var FH=canvas.height;
    var s=Math.max(FW/img.naturalWidth,FH/img.naturalHeight);
    ctx.clearRect(0,0,FW,FH);
    ctx.drawImage(img,(FW-img.naturalWidth*s)/2,(FH-img.naturalHeight*s)/2,img.naturalWidth*s,img.naturalHeight*s);
  }
  
  function setFrame(f){
    if(f<0)f=0;
    if(f>=totalFrames)f=totalFrames-1;
    currentFrame=f;
    draw(f);
  }
  
  window.__fsPlayers=window.__fsPlayers||{};
  window.__fsPlayers['${containerId}']={outer:outer,totalFrames:totalFrames,setFrame:setFrame,getFrame:function(){return currentFrame;}};
  
  outer.addEventListener('touchstart',function(e){
    var c=window.__fsCoord;
    c.activeId='${containerId}';
    c.baseY=e.touches[0].clientY;
    c.baseFrame=currentFrame;
  },{passive:true});
  
  if(!window.__fsCoordInit){
    window.__fsCoordInit=true;
    window.__fsCoord={activeId:null,baseY:0,baseFrame:0};
    var SENSITIVITY=12;
    document.addEventListener('touchmove',function(e){
      var c=window.__fsCoord;
      if(!c.activeId)return;
      var p=window.__fsPlayers[c.activeId];
      if(!p)return;
      var dy=c.baseY-e.touches[0].clientY;
      var delta=Math.round(dy/SENSITIVITY);
      var idx=c.baseFrame+delta;
      if(idx>=p.totalFrames){
        e.preventDefault();
        p.setFrame(p.totalFrames-1);
        return;
      }
      if(idx<0){
        e.preventDefault();
        p.setFrame(0);
        return;
      }
      e.preventDefault();
      p.setFrame(idx);
    },{passive:false});
    document.addEventListener('touchend',function(){
      window.__fsCoord.activeId=null;
    },{passive:true});
  }
  
  var framesLoaded=false;
  function isVisible(){return outer.offsetParent!==null;}
  function loadFrames(){
    if(framesLoaded)return;
    framesLoaded=true;
    for(var i=0;i<totalFrames;i++){(function(i){
      var img=new Image();
      img.onload=function(){if(i===currentFrame)draw(currentFrame);};
      img.src=frames[i];
      images[i]=img;
    })(i);}
  }
  function checkLoad(){if(isVisible())loadFrames();}
  window.addEventListener('resize',function(){resize();checkLoad();});
  resize();
  if(document.readyState==='complete'){checkLoad();}else{window.addEventListener('load',checkLoad);}
})();
</script>`;
}
