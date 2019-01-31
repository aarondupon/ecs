 const Vec2Util = {
    horizontalAngle:function(a,b){           
      const sAngle = Math.atan2((b[1]-b[1]),(b[0] - b[0]));
      const pAngle = Math.atan2((a[1]-b[1]),(a[1] - b[0]));        
      const angle =  (pAngle - sAngle) * 180/Math.PI; 
      return angle;
    },
    angle:function(a,b){
      return 360 - (720 + this.horizontalAngle(a,b)) % 360;
    }
  }

export default Vec2Util;