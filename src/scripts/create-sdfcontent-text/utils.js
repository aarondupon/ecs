const parseColor = (color)=>{
    if (isnumber(color))
      return hexToComponent(color)
    else
      return rgbToHex(color);
  }
  
  
  function hexToComponent(hexValue) {
    const rgbColor = {r:0,g:0,b:0}
    const R = ((hexValue >> 16) & 0xFF) / 255.0;  // Extract the RR byte
    const G = ((hexValue >> 8) & 0xFF) / 255.0;   // Extract the GG byte
    const B = ((hexValue) & 0xFF) / 255.0;        // Extract the BB byte
    const A = 1;
    return {hex:hexValue,alpha:A,rgba:[parseInt(R),parseInt(G),parseInt(B),parseInt(A)]};
  }
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
  function rgbToHex(strColor){
    
    if (strColor.substr(0, 1) === '#' || strColor.substr(0, 1) === '0x') {
        const hex = strColor.includes('#') ? strColor.replace('#','0x') : strColor;
        return hexToComponent(hex);
    }
    
    var rgbReg = /^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
    var rgbaReg = /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?([+-]?([0-9]+([.][0-9]*)?|[.][0-9]+))?/i
  
    var res = strColor.match( strColor.indexOf('rgba') !== -1 ? rgbaReg : rgbReg);//strColor.match();
    if(res === null) return {hex:0xffffff,alpha:0}
    const R = res[1];
    const G = res[2];
    const B = res[3];
    const A = res[4];
    
    const hex =  '0x' + ((B | G << 8 | R << 16) | 1 << 24).toString(16).slice(1);
    const alpha = parseFloat(A) || 1;
    return {hex:hex,alpha,rgba:[parseInt(R),parseInt(G),parseInt(B),parseInt(A)]};
  };
  
  
  const cleanupStyle = (style) =>
              Object.keys(style).reduce((obj,key)=>{
                   if(style[key] !== 'none') obj[key] = style[key];
                  return obj;
              },{})
  
  
  function getHtmlText({dangerouslySetInnerHTML},styles){
    if(dangerouslySetInnerHTML){
      let html = dangerouslySetInnerHTML.__html;//.replace('<[^>]*>')
      return html;
    }
  } 
  function parseHtmlStyle(newStyle){
  
    var defaultStyle = {
      // breakWords: false,
      // dropShadow: false,
      // dropShadowAngle: Math.PI / 6,
      // dropShadowBlur: 0,
      // dropShadowColor: '#000000',
      // dropShadowDistance: 5,
      // fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
      // letterSpacing: 0,
      // stroke: 'black',
      // strokeThickness: 0,
      fill: 'rgba(0,0,0,1)',
      fontSize: 26,
      fontWeight: 'normal',
      lineHeight: '2em',
      wordWrap: 'break-word',
      align: 'left',
      wordWrapWidth: newStyle.width || false ,
      // fontURL: '/fonts/Lato-Regular-64.fnt',
      // imageURL: '/fonts/lato.png?&id='+Math.random(),
      fontURL: '/fonts/din/DIN-Regular.fnt',
      imageURL: '/fonts/din/DIN-Regular.png?&id='+Math.random(),
    };
  
  
    
    const htmlStyle = { ...defaultStyle, ...newStyle}
    const pixiTextStyle = Object.keys(htmlStyle).reduce((style,key)=>{
        switch (key) {
          case 'fill': 
            style.fill = parseColor(htmlStyle[key]).rgba;
            break
          case 'color':
            style.fill = parseColor(htmlStyle[key]).rgba;
  
            break;
          default:
            style[key] = htmlStyle[key];
            break;
        }
        return style;
    },{});
  
    return pixiTextStyle;
  }
  function getStyle(styles = {},style = {} ){
    const defaultStyle = parseHtmlStyle({...styles.default, ...style})
    Object.keys(styles).forEach(key=>{
      styles[key] = parseHtmlStyle(styles[key])
    })
    return {...styles,default:defaultStyle};
  }