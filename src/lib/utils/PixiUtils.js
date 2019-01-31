import * as PIXI from 'pixi.js'
class PIXIUtlis{

  /**
   * [updateLayersOrder description]
   * @param  {PIXI.DisplayObject} container updateLayersOrder call this function whenever you added a new layer/container
   * @return {[type]}           [description]
   */
  static updateLayersOrder(container) {
        container.children.sort(function(a,b) {
            a.zBuffer = a.zBuffer || 0;
            b.zBuffer = b.zBuffer || 0;
            return b.zBuffer - a.zBuffer
        });
  };
  /**
   * [backgroundFit description]
   * @param  {[type]} background [description]
   * @param  {[type]} container  [description]
   * @return {[type]}            [description]
   */
  static backgroundFit(background,container){
    var imageAspect = background.width / background.height,
        containerW = container.width,
        containerH = container.height,
        containerAspect = containerW/containerH;
    if(containerW > containerH){
    if (containerAspect < imageAspect ) {
      // taller
      //console.log('taller')

      background.width = containerW 
      background.height =  containerW / imageAspect
      // background.x = 0
      // background.y =( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2
    } else {
      // wider

         background.height =  containerH
      background.width = containerH * imageAspect;//background.width * containerH/background.height
      // background.x = -(containerH*imageAspect-containerW)/2
      // background.y =0

    }
    }else{

      if (containerAspect < imageAspect ) {
      // taller

      background.width = containerW
      background.height =  containerW / imageAspect
      // background.x = 0
      // background.y =( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2

    } else {
      // wider
       background.height =  containerH
      background.width = containerH * imageAspect;//background.width * containerH/background.height
      // background.x =  -(containerH*imageAspect-containerW)/2;
      // background.y =0

    }
    }
    // background.x = 0;
    // background.y = 0;
    return [background.x,background.y,background.width,background.height]
  }

  static backgroundFill(background,container){
    var orig =  Object.assign({},{background:background,container:container})
    var imageAspect = background.width / background.height,
        containerW = container.width,
        containerH = container.height,
        containerAspect = containerW/containerH;

    if(containerW > containerH){
        if (containerAspect < imageAspect ) {
          // taller
          //console.log('taller (containerAspect) >')

          // background.height =  containerH
          // background.width = containerH * imageAspect;//background.width * containerH/background.height
          // background.x = -(containerH*imageAspect-(containerW))/2;// * container.scale.x
          // background.smoothed = false;
          // background.y = ( orig.background.height-containerH)/2;// * container.scale.x;

          var viewHeight = containerH//(renderer.height / renderer.resolution);
          background.scale.y = viewHeight/ background._texture.baseTexture.height;
          background.scale.x = background.scale.y;
          background.scale.x = background.scale.y;
          // background.y = -(viewHeight - background.height)/2
          // 
          // background.y =  -200



          //background.y =0

          return [background.x,background.y,background.width,background.height];
        } else {

          // wider
          //console.log('::wider (containerAspect) >',orig.background.width,orig.container.width,background.width,container.width)
          // background.width = containerW
          // background.height =  containerW / imageAspect
          // background.x = (orig.background.width-containerW)/2
          // //(background.width - container.width)/2 ;
          //
          //
          // background.y = ( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2


          var viewWidth = containerW//(renderer.width / renderer.resolution);
          background.scale.x = viewWidth/ background._texture.baseTexture.width;
          background.scale.y = background.scale.x;
          background.scale.y = background.scale.x;
          // background.y = -200;//(viewHeight - background.height)/2

          return background;//[background.x,background.y,background.width,background.height];

        }

    }else{

            if (containerAspect < imageAspect ) {
            // taller
          // console.log('taller (containerAspect)<')
            background.height =  containerH
            background.width = containerH * imageAspect;//background.width * containerH/background.height
            background.x =  -(containerH*imageAspect-containerW)/2;
            background.y =0
          } else {
            // wider
       // console.log('wider (containerAspect)<')
       
            background.width = containerW
            background.height =  containerW / imageAspect
            background.x = (background.width - container.width)/2 ;//background.x = 0
            background.y =( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2
          }
    }

    return background;//[background.x,background.y,background.width,background.height]
  }


  static copyTextureAsImage(texture,callback){

    var canvas = document.getElementById('canvasID');
    //var buffer;
    if (!document.getElementById('canvasID')){

      canvas = document.createElement('canvas');
      canvas.setAttribute("id", "canvasID");
      canvas.style.position = 'absolute';
      // canvas.style.top = '0px';
      // canvas.style.left = '0px';
      canvas.width  = texture.width/2;
      canvas.height = texture.height/2;
      //document.body.appendChild(canvas);



    }

   // console.log('copyTextureAsImage ---->',texture.width, texture.height)
    var buffer_context = canvas.getContext('2d');
   // buffer = new PIXI.CanvasBuffer(texture.width, texture.height)
     // Fill the path
        /*    buffer_context.fillStyle = "#ff0000";
            buffer_context.fillRect(0,0,texture.width,texture.height);*/
    //PIXIUtlis.backgroundFill(background,{x:rect[0]-(rect[2]*(scale-1)),y:rect[1]-(rect[3]*(scale-1)),width:rect[2]*scale,height:rect[3]*scale})
    buffer_context.drawImage( texture.baseTexture.source,0,0,texture.width/2, texture.height/2);





    /* var image = new Image();
     image.src = canvas.toDataURL();
      document.body.appendChild(image);*/

    //var renderer = new PIXI.CanvasRenderer( texture.width, texture.height);
    //var texture = new PIXI.RenderTexture(buffer_context, texture.width, texture.height);
         // var flechaURI = 'data:image/jpeg;base64,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';

         var sprite = new PIXI.Sprite();
      var imageElement = new Image();//document.getElementById("MyPix");
     imageElement.src = canvas.toDataURL("image/png");
     var text;
     imageElement.onload=()=>{
          //var loader = new PIXI.AssetLoader([  canvas.toDataURL("image/png")]);
         var myBaseTexture = new PIXI.BaseTexture(imageElement);
         var texture2 = new PIXI.Texture(myBaseTexture);//,new PIXI.Rectangle(0,0,100,100));

         // then add to the cache (if required)
        PIXI.Texture.addTextureToCache(texture2, "someId");
          //setTimeout(()=>{
        var bg = PIXI.Sprite.fromImage(canvas.toDataURL("image/png"));//'someId')

         // bg.texture.baseTexture.on('loaded',()=>{
          console.log(myBaseTexture.width,'x',myBaseTexture.height)
         // PIXIUtlis.backgroundFill(bg,{x:0,y:0,width:canvas.width,height:canvas.height})
           callback(bg)
           // },1000)
         // this.state.originRect = PIXIUtlis.backgroundFill(background,{x:rect[0]-(rect[2]*(scale-1)),y:rect[1]-(rect[3]*(scale-1)),width:rect[2]*scale,height:rect[3]*scale})

         //   PIXIUtlis.backgroundFill(background,{width:window.innerWidth,height:window.innerHeight})

       // })


     }

     //var texture = PIXI.utils.TextureCache[canvas.toDataURL("image/png",1)];



 //   return text;// new PIXI.Sprite()
    //target.addChild(canvas);
  }
}

export default PIXIUtlis;
