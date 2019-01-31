class TextureUtils{

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
      background.x = 0
      background.y =( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2
    } else {
      // wider

         background.height =  containerH
      background.width = containerH * imageAspect;//background.width * containerH/background.height
      background.x = -(containerH*imageAspect-containerW)/2
      background.y =0

    }
    }else{

      if (containerAspect < imageAspect ) {
      // taller

      background.width = containerW
      background.height =  containerW / imageAspect
      background.x = 0
      background.y =( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2

    } else {
      // wider
       background.height =  containerH
      background.width = containerH * imageAspect;//background.width * containerH/background.height
      background.x =  -(containerH*imageAspect-containerW)/2;
      background.y =0

    }
    }

    return [background.x,background.y,background.width,background.height]
  }

  static backgroundFill(background,container,scale={x:1,y:1}){
    var orig =  Object.assign({},{background:background,container:container})
    if(!background.scale) background.scale =  {x:1,y:1}
    if(!background.scale.x) background.scale.x =  1
    if(!background.scale.y) background.scale.y =  1

  
    var imageAspect = background.width / background.height,
        containerW = container.width,
        containerH = container.height,
        containerAspect = containerW/containerH;

    if(containerW > containerH){
      
        if (containerAspect < imageAspect ) {
          console.log('backgroundFill 2 taller');
          // taller
          //console.log('taller (containerAspect) >')

          // background.height =  containerH
          // background.width = containerH * imageAspect;//background.width * containerH/background.height
          // background.x = -(containerH*imageAspect-(containerW))/2;// * container.scale.x
          // background.smoothed = false;
          // background.y = ( orig.background.height-containerH)/2;// * container.scale.x;

          var viewHeight = containerH//(renderer.height / renderer.resolution);
          var myScale = viewHeight/background.height;
          background.scale.y = myScale//viewHeight/background.height///background.height/viewHeight * scale.y;
          background.scale.x = background.scale.y * scale.x;
          background.width =  containerW * scale.x
          background.height = containerW / imageAspect * scale.y;
          background.x = - (containerW*scale.x - containerW)/2;
          background.y = -((containerW/imageAspect*scale.y)-containerH)/2;

          // console.log(' background.scale.y ',scale.x, viewHeight ,'=', background.height*background.scale.y,`(${ background.height}*${background.scale.y})` )
          if(background.width > background.height){
            var viewHeight = containerH//(renderer.height / renderer.resolution);
            var myScale = viewHeight/background.height;
            background.scale.y = myScale//viewHeight/background.height///background.height/viewHeight * scale.y;
            background.scale.x = background.scale.y * scale.x;
            background.height = (containerW / imageAspect) * myScale * scale.y;
            background.width =  containerW * myScale * scale.x
            
            background.x =  (background.width - containerW)/2;
            background.y = -(background.height-containerH)/2;
  
            // console.log(' background.scale.y ',scale.x, viewHeight ,'=', background.height*background.scale.y,`(${ background.height}*${background.scale.y})` )
          }
          // background.y = -(viewHeight - background.height)/2
          // 
          // background.y =  -200

          //background.y =0

          return background;//[background.x,background.y,background.width,background.height];
        } else {
          console.log('backgroundFill 3 wider');
          
          if (containerAspect < imageAspect ) {
            console.log('backgroundFill 3 taller');
          // taller
        // console.log('taller (containerAspect)<')
          background.height =  (containerH*scale.y )
          background.width = (containerH * imageAspect * scale.x );//background.width * containerH/background.height
          background.x =  -((containerH)*imageAspect-(containerW * scale.x ))/2;
          background.y =0
        } else {
            console.log('backgroundFill 5 wider');
          // wider
     // console.log('wider (containerAspect)<')
          background.height = (containerH*scale.y ) 
          background.width = (containerH * imageAspect *scale.x)

          background.x = (containerW - background.width)/2
          background.y = ( (containerH - background.height))/2;//*scale.y;// -(containerW/imageAspect-containerH)/2
        }
        
          // wider
          //console.log('::wider (containerAspect) >',orig.background.width,orig.container.width,background.width,container.width)
          // background.width = containerW
          // background.height =  containerW / imageAspect
          // background.x = (orig.background.width-containerW)/2
          // //(background.width - container.width)/2 ;
          //
          //
          // background.y = ( containerH - background.height)/2;// -(containerW/imageAspect-containerH)/2


          // var viewWidth = containerW//(renderer.width / renderer.resolution);
          // background.scale.x = viewWidth/ background.width;
          // background.scale.y = background.scale.x;
          // background.scale.y = background.scale.x;
          
          // background.width =  containerW
          // background.height = containerW / imageAspect;//background.width * containerH/background.height
          // background.x = - (containerW*scale.x - containerW)/2;
          // background.y = -((containerH*imageAspect*scale.y)-containerH)/2;
          console.log('backgroundFill',background)
          return background;//[background.x,background.y,background.width,background.height];

        }

    }else{

            if (containerAspect < imageAspect ) {
              console.log('backgroundFill 3 taller');
            // taller
          // console.log('taller (containerAspect)<')
            background.height =  (containerH*scale.y )
            background.width = (containerH * imageAspect * scale.x );//background.width * containerH/background.height
            background.x =  -((containerH)*imageAspect-(containerW * scale.x ))/2;
            background.y =0
          } else {
              console.log('backgroundFill 5 wider');
            // wider
       // console.log('wider (containerAspect)<')
            background.width = (containerW*scale.x )
            background.height =  (containerW / imageAspect *scale.y)
            background.x = ((background.width*scale.x ) - container.width)/2 ;//background.x = 0
            background.y =( (containerH ) - (background.height*scale.y))/2;// -(containerW/imageAspect-containerH)/2
          }
    }

    return background;//[background.x,background.y,background.width,background.height]
  }
}

export default TextureUtils
