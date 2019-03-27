
const getValue = (value) => (typeof value === 'number'
   ? { group: `${value}px`, value, unit: 'px' }
   : [(/([+-]?\d*\.?\d+)\s?(px|em|ex|%|in|cn|mm|pt|pc+)/gim).exec(value)]
     .map(x => (x ? { group: x[0], value: x[1], unit: x[2] } : { }))[0]);

const getCaclulatedValue = (style, documentStyle, key) => {
    const { /* group, */ value, unit } = getValue(style[key]);
    // eslint-disable-next-line no-irregular-whitespace
    if (documentStyle[key] && (unit === 'em' || unit === '%')) {
        let baseValue = documentStyle[key];
        if (key === 'lineHeight' && style[key]) {
            baseValue = getCaclulatedValue(style, documentStyle, 'fontSize');
            return baseValue * parseFloat(value);
            // style[key] = baseValue * parseFloat(value);
        } 
            return baseValue * parseFloat(value);
            // style[key] = parseFloat(baseValue) * parseFloat(value);
        
    } if (unit === 'px') {
        return parseFloat(value);
        // style[key] = parseFloat(value);
    }
    return style[key];
};
export default class TextStyle {
    constructor(style, documentStyle) {
        this.styleID = 0;

        
        Object.keys(style).forEach(key => {
            if (style[key]) {
                const value = getCaclulatedValue(style, documentStyle, key);
                // eslint-disable-next-line no-param-reassign
                style[key] = value;
            }
        });
        Object.assign(this, style);
    }

    get align() {
        return this._align;
    }

    set align(value) {
        this._align = value;
        this.styleID++;
    }

    get weight() {
        return this._weight;
    }

    get fontWeight() {
        return this._weight < 0.4 ? 'bold' : 'normal';
    }

    set fontWeight(value) {
        this._weight = value === 'bold' ? 0.3 : 0.7;
        this.styleID++;
    }
    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        
        this._fontSize = value;
        this.styleID++;
    }

    get fill() {
        return this._fill;
    }

    set fill(value) {
        this._fill = value;
    }

    // extended stype properties (non native)
    get lineHeightBottom() {
        return this._lineHeightBottom;
    }

    set lineHeightBottom(value) {
        
        this._lineHeightBottom = value;
        this.styleID++;
    }
    getFlatCopy() {
        return {
            align: this.align,
            fontSize: this.fontSize,
            fill: this.fill,
            fontWeight: this.fontWeight,
            width: this.wordWrapWidth,
            wordWrapWidth: this.wordWrapWidth,
            lineHeight: this.lineHeight,
            lineHeightBottom: this.lineHeightBottom,
            letterSpacing: this.letterSpacing,
        };
    }
}
