export function generateCanvasHTML(frameUrls: string[], containerId: string, isDesktop: boolean): string {
  const PX = isDesktop ? 20 : 12;
  const totalHeight = Math.ceil((frameUrls.length * PX) / 10); // Dividir por 10 para no ser tan gigante
  
  return `<style>
#${containerId}-outer{
  position: relative;
  width: 100%;
  margin: 0;
  height: ${totalHeight}vh;
}
#${containerId}-sticky{
  position: sticky;
  top: 0;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 100vh;
  overflow: hidden;
  background: #000;
}
#${containerId}-canvas{
  width: 100%;
  height: 100%;
  display: block;
}
.elementor-widget-html, .elementor-widget-container {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 0 !important;
}
</style>
<div id="${containerId}-outer">
  <div id="${containerId}-sticky">
    <canvas id="${containerId}-canvas"></canvas>
  </div>
</div>
<script>
(function(){
  var frames = ${JSON.stringify(frameUrls)};
  var PX = ${PX};
  var outer = document.getElementById('${containerId}-outer');
  var sticky = document.getElementById('${containerId}-sticky');
  var canvas = document.getElementById('${containerId}-canvas');
  var ctx = canvas.getContext('2d');
  var images = [];
  var currentFrame = 0;
  var ticking = false;

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(currentFrame);
  }

  function draw(idx){
    var img = images[idx];
    if(!img || !img.complete || !img.naturalWidth) return;
    var s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, (canvas.width - img.naturalWidth * s) / 2, (canvas.height - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  }

  function update(){
    ticking = false;
    var scrolled = -outer.getBoundingClientRect().top;
    if(scrolled < 0) scrolled = 0;
    var idx = Math.min(Math.floor(scrolled / PX), frames.length - 1);
    if(idx !== currentFrame){
      currentFrame = idx;
      draw(currentFrame);
    }
  }

  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }, {passive: true});

  var framesLoaded = false;
  function isVisible(){ return outer.offsetParent !== null; }
  function loadFrames(){
    if(framesLoaded) return;
    framesLoaded = true;
    for(var i = 0; i < frames.length; i++){
      (function(i){
        var img = new Image();
        img.onload = function(){ if(i === currentFrame) draw(currentFrame); };
        img.src = frames[i];
        images[i] = img;
      })(i);
    }
  }
  function checkLoad(){ if(isVisible()) loadFrames(); }
  
  window.addEventListener('resize', function(){ resize(); checkLoad(); });
  resize();
  if(document.readyState === 'complete'){ checkLoad(); } else { window.addEventListener('load', checkLoad); }
})();
</script>`;
}
