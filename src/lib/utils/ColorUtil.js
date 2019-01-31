export function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
} 
var ColorUtils = {
	getRandomColor:getRandomColor,
  hex2rgba(hex,opacity){
		let r,g,b,result;
		hex = hex.replace('#','');
		if(hex.length === 3) hex = hex+hex;
	    r = parseInt(hex.substring(0,2), 16);
	    g = parseInt(hex.substring(2,4), 16);
	    b = parseInt(hex.substring(4,6), 16);

	    result = 'rgba('+r+','+g+','+b+','+opacity+')';
	    return result;
	}

}
//alias
ColorUtils.random = ColorUtils.getRandomColor
export default ColorUtils
