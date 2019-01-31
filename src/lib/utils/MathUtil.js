/**
 * Global functions for Math helpers
 * @namespace
 */
const MathUtil = {
  /**
     * Returns a Number that is mapped from the first to the second range.
     * @param {Number} [inputValue]
     * @param {Array} [fromRange] from range: [min,max]
     * @param {Array} [toRange] to range: [min,max]
     * @returns {Number} mappedNumber
     */
  mapRange(value, from, to) {
    return (to[0]) + (((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]));
  },
  /**
     * Returns a Number that is mapped from the first to the second range
     * and clamped between last range
     * @param {Number} [inputValue]
     * @param {Array} [fromRange] from range: [min,max]
     * @param {Array} [toRange] to range: [min,max]
     * @returns {Number} mappedNumber
     */
  mapRangeClamped(value, from, to) {
    return MathUtil.clamp(MathUtil.mapRange(value, from, to), to[0], to[1]);
  },
  /**
   * @param  {Number} value
   * @param  {Number} min
   * @param  {v} max
   * @returns {Number}
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  },
  /**
   * round number with seleced decimals after zero
   * @param  {[type]} value    number
   * @param  {[type]} decimals decimals
   * @return {[type]}          number
   */
  round(value, decimals = 2){
    return +(Math.floor(value + "e+" + decimals)  + "e-" + decimals);
  },
  /**
  * Gets the average of the last `number` elements of the given array.
  */
  averange(elements, number){
      var sum = 0;

      //taking `number` elements from the end to make the average, if there are not enought, 1
      var lastElements = elements.slice(Math.max(elements.length - number, 1));

      for(var i = 0; i < lastElements.length; i++){
          sum = sum + lastElements[i];
      }

      return Math.ceil(sum/number);
  },
  intersects(md,rect) {
    const mx = md.clientX;
    const my = md.clientY;
    const minX = 0;
    const maxX = rect.width;
    const minY = 0;
    const maxY = rect.height;
    return !(mx < minX || mx > maxX || my < minY || my > maxY);
  },
  parsePercetage(str) {
    if (str.slice(-1) === '%') {
      return parseFloat(str.slice(0, -1)) / 100;
    }
  },
  /**
     * Maps a function from the first to the second range
     * return the wrapper function in the given domain that
     * expects a normalised input value
     * @param  {Function} fn       [description]
     * @param  {[type]}   inStart  [description]
     * @param  {[type]}   inEnd    [description]
     * @param  {[type]}   outStart [description]
     * @param  {[type]}   outEnd   [description]
     * @return {[type]}            [description]
     */
  // mapRangeFn(fn, inStart, inEnd, outStart, outEnd) {
  //   if (outStart === void 0) {
  //     outStart = inStart;
  //     outEnd = inEnd;
  //     inStart = 0;
  //     inEnd = 1;
  //   }

  //   let inRange = inEnd - inStart,
  //     outRange = outEnd - outStart;

  //   return function (val) {
  //     const original = fn((val - inStart) / inRange);
  //     return outStart + (outRange * original);
  //   };
  // },
};

module.exports = MathUtil;
