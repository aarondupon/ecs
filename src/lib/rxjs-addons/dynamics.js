/* eslint-disable */
var Color, DecomposedMatrix, DecomposedMatrix2D, InterpolableArray, InterpolableColor, InterpolableNumber, InterpolableObject, InterpolableString, Matrix, Matrix2D, Set, Vector, addTimeout, addUnitsToNumberInterpolables, animationTick, animations, animationsTimeouts, applyDefaults, applyFrame, applyProperties, baseSVG, cacheFn, cancelTimeout, clone, createInterpolable, defaultValueForKey, degProperties, dynamics, getCurrentProperties, interpolate, isDocumentVisible, isSVGElement, lastTime, leftDelayForTimeout, makeArrayFn, observeVisibilityChange, parseProperties, prefixFor, propertyWithPrefix, pxProperties, rAF, roundf, runLoopPaused, runLoopRunning, runLoopTick, setRealTimeout, slow, slowRatio, startAnimation, startRunLoop, svgProperties, timeBeforeVisibilityChange, timeoutLastId, timeouts, toDashed, transformProperties, transformValueForProperty, unitForProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

isDocumentVisible = function() {
  return document.visibilityState === "visible" || (dynamics.tests != null);
};

observeVisibilityChange = (function() {
  var fns;
  fns = [];
  if (typeof document !== "undefined" && document !== null) {
    document.addEventListener("visibilitychange", function() {
      var fn, l, len, results;
      results = [];
      for (l = 0, len = fns.length; l < len; l++) {
        fn = fns[l];
        results.push(fn(isDocumentVisible()));
      }
      return results;
    });
  }
  return function(fn) {
    return fns.push(fn);
  };
})();

clone = function(o) {
  var k, newO, v;
  newO = {};
  for (k in o) {
    v = o[k];
    newO[k] = v;
  }
  return newO;
};

cacheFn = function(func) {
  var data;
  data = {};
  return function() {
    var k, key, l, len, result;
    key = "";
    for (l = 0, len = arguments.length; l < len; l++) {
      k = arguments[l];
      key += k.toString() + ",";
    }
    result = data[key];
    if (!result) {
      data[key] = result = func.apply(this, arguments);
    }
    return result;
  };
};

makeArrayFn = function(fn) {
  return function(el) {
    var args, i, res;
    if (el instanceof Array || el instanceof NodeList || el instanceof HTMLCollection) {
      res = (function() {
        var l, ref, results;
        results = [];
        for (i = l = 0, ref = el.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
          args = Array.prototype.slice.call(arguments, 1);
          args.splice(0, 0, el[i]);
          results.push(fn.apply(this, args));
        }
        return results;
      }).apply(this, arguments);
      return res;
    }
    return fn.apply(this, arguments);
  };
};

applyDefaults = function(options, defaults) {
  var k, results, v;
  results = [];
  for (k in defaults) {
    v = defaults[k];
    results.push(options[k] != null ? options[k] : options[k] = v);
  }
  return results;
};

applyFrame = function(el, properties) {
  var k, results, v;
  if ((el.style != null)) {
    return applyProperties(el, properties);
  } else {
    results = [];
    for (k in properties) {
      v = properties[k];
      results.push(el[k] = v.format());
    }
    return results;
  }
};

applyProperties = function(el, properties) {
  var isSVG, k, matrix, transforms, v;
  properties = parseProperties(properties);
  transforms = [];
  isSVG = isSVGElement(el);
  for (k in properties) {
    v = properties[k];
    if (transformProperties.contains(k)) {
      transforms.push([k, v]);
    } else {
      if (v.format != null) {
        v = v.format();
      }
      if (typeof v === 'number') {
        v = "" + v + (unitForProperty(k, v));
      }
      if ((el.hasAttribute != null) && el.hasAttribute(k)) {
        el.setAttribute(k, v);
      } else if (el.style != null) {
        el.style[propertyWithPrefix(k)] = v;
      }
      if (k in el) {
        el[k] = v;
      }
    }
  }
  if (transforms.length > 0) {
    if (isSVG) {
      matrix = new Matrix2D();
      matrix.applyProperties(transforms);
      return el.setAttribute("transform", matrix.decompose().format());
    } else {
      v = (transforms.map(function(transform) {
        return transformValueForProperty(transform[0], transform[1]);
      })).join(" ");
      return el.style[propertyWithPrefix("transform")] = v;
    }
  }
};

isSVGElement = function(el) {
  var ref, ref1;
  if ((typeof SVGElement !== "undefined" && SVGElement !== null) && (typeof SVGSVGElement !== "undefined" && SVGSVGElement !== null)) {
    return el instanceof SVGElement && !(el instanceof SVGSVGElement);
  } else {
    return (ref = (ref1 = dynamics.tests) != null ? typeof ref1.isSVG === "function" ? ref1.isSVG(el) : void 0 : void 0) != null ? ref : false;
  }
};

roundf = function(v, decimal) {
  var d;
  d = Math.pow(10, decimal);
  return Math.round(v * d) / d;
};

Set = (function() {
  function Set(array) {
    var l, len, v;
    this.obj = {};
    for (l = 0, len = array.length; l < len; l++) {
      v = array[l];
      this.obj[v] = 1;
    }
  }

  Set.prototype.contains = function(v) {
    return this.obj[v] === 1;
  };

  return Set;

})();

toDashed = function(str) {
  return str.replace(/([A-Z])/g, function($1) {
    return "-" + $1.toLowerCase();
  });
};

pxProperties = new Set('marginTop,marginLeft,marginBottom,marginRight,paddingTop,paddingLeft,paddingBottom,paddingRight,top,left,bottom,right,translateX,translateY,translateZ,perspectiveX,perspectiveY,perspectiveZ,width,height,maxWidth,maxHeight,minWidth,minHeight,borderRadius'.split(','));

degProperties = new Set('rotate,rotateX,rotateY,rotateZ,skew,skewX,skewY,skewZ'.split(','));

transformProperties = new Set('translate,translateX,translateY,translateZ,scale,scaleX,scaleY,scaleZ,rotate,rotateX,rotateY,rotateZ,rotateC,rotateCX,rotateCY,skew,skewX,skewY,skewZ,perspective'.split(','));

svgProperties = new Set('accent-height,ascent,azimuth,baseFrequency,baseline-shift,bias,cx,cy,d,diffuseConstant,divisor,dx,dy,elevation,filterRes,fx,fy,gradientTransform,height,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,letter-spacing,limitingConeAngle,markerHeight,markerWidth,numOctaves,order,overline-position,overline-thickness,pathLength,points,pointsAtX,pointsAtY,pointsAtZ,r,radius,rx,ry,seed,specularConstant,specularExponent,stdDeviation,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,surfaceScale,target,targetX,targetY,transform,underline-position,underline-thickness,viewBox,width,x,x1,x2,y,y1,y2,z'.split(','));

unitForProperty = function(k, v) {
  if (typeof v !== 'number') {
    return '';
  }
  if (pxProperties.contains(k)) {
    return 'px';
  } else if (degProperties.contains(k)) {
    return 'deg';
  }
  return '';
};

transformValueForProperty = function(k, v) {
  var match, unit;
  match = ("" + v).match(/^([0-9.-]*)([^0-9]*)$/);
  if (match != null) {
    v = match[1];
    unit = match[2];
  } else {
    v = parseFloat(v);
  }
  v = roundf(parseFloat(v), 10);
  if ((unit == null) || unit === "") {
    unit = unitForProperty(k, v);
  }
  return k + "(" + v + unit + ")";
};

parseProperties = function(properties) {
  var axis, l, len, match, parsed, property, ref, value;
  parsed = {};
  for (property in properties) {
    value = properties[property];
    if (transformProperties.contains(property)) {
      match = property.match(/(translate|rotateC|rotate|skew|scale|perspective)(X|Y|Z|)/);
      if (match && match[2].length > 0) {
        parsed[property] = value;
      } else {
        ref = ['X', 'Y', 'Z'];
        for (l = 0, len = ref.length; l < len; l++) {
          axis = ref[l];
          parsed[match[1] + axis] = value;
        }
      }
    } else {
      parsed[property] = value;
    }
  }
  return parsed;
};

defaultValueForKey = function(key) {
  var v;
  v = key === 'opacity' ? 1 : 0;
  return "" + v + (unitForProperty(key, v));
};

getCurrentProperties = function(el, keys) {
  var isSVG, key, l, len, len1, matrix, properties, q, ref, style, v;
  properties = {};
  isSVG = isSVGElement(el);
  if (el.style != null) {
    style = window.getComputedStyle(el, null);
    for (l = 0, len = keys.length; l < len; l++) {
      key = keys[l];
      if (transformProperties.contains(key)) {
        if (properties['transform'] == null) {
          if (isSVG) {
            matrix = new Matrix2D((ref = el.transform.baseVal.consolidate()) != null ? ref.matrix : void 0);
          } else {
            matrix = Matrix.fromTransform(style[propertyWithPrefix('transform')]);
          }
          properties['transform'] = matrix.decompose();
        }
      } else {
        if ((el.hasAttribute != null) && el.hasAttribute(key)) {
          v = el.getAttribute(key);
        } else if (key in el) {
          v = el[key];
        } else {
          v = style[key];
        }
        if (((v == null) || key === 'd') && svgProperties.contains(key)) {
          v = el.getAttribute(key);
        }
        if (v === "" || (v == null)) {
          v = defaultValueForKey(key);
        }
        properties[key] = createInterpolable(v);
      }
    }
  } else {
    for (q = 0, len1 = keys.length; q < len1; q++) {
      key = keys[q];
      properties[key] = createInterpolable(el[key]);
    }
  }
  addUnitsToNumberInterpolables(el, properties);
  return properties;
};

addUnitsToNumberInterpolables = function(el, properties) {
  var interpolable, k;
  for (k in properties) {
    interpolable = properties[k];
    if (interpolable instanceof InterpolableNumber && (el.style != null) && k in el.style) {
      interpolable = new InterpolableString([interpolable, unitForProperty(k, 0)]);
    }
    properties[k] = interpolable;
  }
  return properties;
};

createInterpolable = function(value) {
  var interpolable, klass, klasses, l, len;
  klasses = [InterpolableArray, InterpolableObject, InterpolableNumber, InterpolableString];
  for (l = 0, len = klasses.length; l < len; l++) {
    klass = klasses[l];
    interpolable = klass.create(value);
    if (interpolable != null) {
      return interpolable;
    }
  }
  return null;
};

InterpolableString = (function() {
  function InterpolableString(parts1) {
    this.parts = parts1;
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
  }

  InterpolableString.prototype.interpolate = function(endInterpolable, t) {
    var end, i, l, newParts, ref, start;
    start = this.parts;
    end = endInterpolable.parts;
    newParts = [];
    for (i = l = 0, ref = Math.min(start.length, end.length); 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      if (start[i].interpolate != null) {
        newParts.push(start[i].interpolate(end[i], t));
      } else {
        newParts.push(start[i]);
      }
    }
    return new InterpolableString(newParts);
  };

  InterpolableString.prototype.format = function() {
    var parts;
    parts = this.parts.map(function(val) {
      if (val.format != null) {
        return val.format();
      } else {
        return val;
      }
    });
    return parts.join('');
  };

  InterpolableString.create = function(value) {
    var index, l, len, len1, match, matches, parts, q, re, type, types;
    value = "" + value;
    matches = [];
    types = [
      {
        re: /(#[a-f\d]{3,6})/ig,
        klass: InterpolableColor,
        parse: function(v) {
          return v;
        }
      }, {
        re: /(rgba?\([0-9.]*, ?[0-9.]*, ?[0-9.]*(?:, ?[0-9.]*)?\))/ig,
        klass: InterpolableColor,
        parse: function(v) {
          return v;
        }
      }, {
        re: /([-+]?[\d.]+)/ig,
        klass: InterpolableNumber,
        parse: parseFloat
      }
    ];
    for (l = 0, len = types.length; l < len; l++) {
      type = types[l];
      re = type.re;
      while (match = re.exec(value)) {
        matches.push({
          index: match.index,
          length: match[1].length,
          interpolable: type.klass.create(type.parse(match[1]))
        });
      }
    }
    matches = matches.sort(function(a, b) {
      if (a.index > b.index) {
        return 1;
      } else {
        return -1;
      }
    });
    parts = [];
    index = 0;
    for (q = 0, len1 = matches.length; q < len1; q++) {
      match = matches[q];
      if (match.index < index) {
        continue;
      }
      if (match.index > index) {
        parts.push(value.substring(index, match.index));
      }
      parts.push(match.interpolable);
      index = match.index + match.length;
    }
    if (index < value.length) {
      parts.push(value.substring(index));
    }
    return new InterpolableString(parts);
  };

  return InterpolableString;

})();

InterpolableObject = (function() {
  function InterpolableObject(obj) {
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
    this.obj = obj;
  }

  InterpolableObject.prototype.interpolate = function(endInterpolable, t) {
    var end, k, newObj, start, v;
    start = this.obj;
    end = endInterpolable.obj;
    newObj = {};
    for (k in start) {
      v = start[k];
      if (v.interpolate != null) {
        newObj[k] = v.interpolate(end[k], t);
      } else {
        newObj[k] = v;
      }
    }
    return new InterpolableObject(newObj);
  };

  InterpolableObject.prototype.format = function() {
    return this.obj;
  };

  InterpolableObject.create = function(value) {
    var k, obj, v;
    if (value instanceof Object) {
      obj = {};
      for (k in value) {
        v = value[k];
        obj[k] = createInterpolable(v);
      }
      return new InterpolableObject(obj);
    }
    return null;
  };

  return InterpolableObject;

})();

InterpolableNumber = (function() {
  function InterpolableNumber(value) {
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
    this.value = parseFloat(value);
  }

  InterpolableNumber.prototype.interpolate = function(endInterpolable, t) {
    var end, start;
    start = this.value;
    end = endInterpolable.value;
    return new InterpolableNumber((end - start) * t + start);
  };

  InterpolableNumber.prototype.format = function() {
    return roundf(this.value, 5);
  };

  InterpolableNumber.create = function(value) {
    if (typeof value === 'number') {
      return new InterpolableNumber(value);
    }
    return null;
  };

  return InterpolableNumber;

})();

InterpolableArray = (function() {
  function InterpolableArray(values1) {
    this.values = values1;
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
  }

  InterpolableArray.prototype.interpolate = function(endInterpolable, t) {
    var end, i, l, newValues, ref, start;
    start = this.values;
    end = endInterpolable.values;
    newValues = [];
    for (i = l = 0, ref = Math.min(start.length, end.length); 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      if (start[i].interpolate != null) {
        newValues.push(start[i].interpolate(end[i], t));
      } else {
        newValues.push(start[i]);
      }
    }
    return new InterpolableArray(newValues);
  };

  InterpolableArray.prototype.format = function() {
    return this.values.map(function(val) {
      if (val.format != null) {
        return val.format();
      } else {
        return val;
      }
    });
  };

  InterpolableArray.createFromArray = function(arr) {
    var values;
    values = arr.map(function(val) {
      return createInterpolable(val) || val;
    });
    values = values.filter(function(val) {
      return val != null;
    });
    return new InterpolableArray(values);
  };

  InterpolableArray.create = function(value) {
    if (value instanceof Array) {
      return InterpolableArray.createFromArray(value);
    }
    return null;
  };

  return InterpolableArray;

})();

Color = (function() {
  function Color(rgb1, format) {
    this.rgb = rgb1 != null ? rgb1 : {};
    this.format = format;
    this.toRgba = bind(this.toRgba, this);
    this.toRgb = bind(this.toRgb, this);
    this.toHex = bind(this.toHex, this);
  }

  Color.fromHex = function(hex) {
    var hex3, result;
    hex3 = hex.match(/^#([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i);
    if (hex3 != null) {
      hex = "#" + hex3[1] + hex3[1] + hex3[2] + hex3[2] + hex3[3] + hex3[3];
    }
    result = hex.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (result != null) {
      return new Color({
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
      }, "hex");
    }
    return null;
  };

  Color.fromRgb = function(rgb) {
    var match, ref;
    match = rgb.match(/^rgba?\(([0-9.]*), ?([0-9.]*), ?([0-9.]*)(?:, ?([0-9.]*))?\)$/);
    if (match != null) {
      return new Color({
        r: parseFloat(match[1]),
        g: parseFloat(match[2]),
        b: parseFloat(match[3]),
        a: parseFloat((ref = match[4]) != null ? ref : 1)
      }, match[4] != null ? "rgba" : "rgb");
    }
    return null;
  };

  Color.componentToHex = function(c) {
    var hex;
    hex = c.toString(16);
    if (hex.length === 1) {
      return "0" + hex;
    } else {
      return hex;
    }
  };

  Color.prototype.toHex = function() {
    return "#" + Color.componentToHex(this.rgb.r) + Color.componentToHex(this.rgb.g) + Color.componentToHex(this.rgb.b);
  };

  Color.prototype.toRgb = function() {
    return "rgb(" + this.rgb.r + ", " + this.rgb.g + ", " + this.rgb.b + ")";
  };

  Color.prototype.toRgba = function() {
    return "rgba(" + this.rgb.r + ", " + this.rgb.g + ", " + this.rgb.b + ", " + this.rgb.a + ")";
  };

  return Color;

})();

InterpolableColor = (function() {
  function InterpolableColor(color1) {
    this.color = color1;
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
  }

  InterpolableColor.prototype.interpolate = function(endInterpolable, t) {
    var end, k, l, len, ref, rgb, start, v;
    start = this.color;
    end = endInterpolable.color;
    rgb = {};
    ref = ['r', 'g', 'b'];
    for (l = 0, len = ref.length; l < len; l++) {
      k = ref[l];
      v = Math.round((end.rgb[k] - start.rgb[k]) * t + start.rgb[k]);
      rgb[k] = Math.min(255, Math.max(0, v));
    }
    k = "a";
    v = roundf((end.rgb[k] - start.rgb[k]) * t + start.rgb[k], 5);
    rgb[k] = Math.min(1, Math.max(0, v));
    return new InterpolableColor(new Color(rgb, end.format));
  };

  InterpolableColor.prototype.format = function() {
    if (this.color.format === "hex") {
      return this.color.toHex();
    } else if (this.color.format === "rgb") {
      return this.color.toRgb();
    } else if (this.color.format === "rgba") {
      return this.color.toRgba();
    }
  };

  InterpolableColor.create = function(value) {
    var color;
    if (typeof value !== "string") {
      return;
    }
    color = Color.fromHex(value) || Color.fromRgb(value);
    if (color != null) {
      return new InterpolableColor(color);
    }
    return null;
  };

  return InterpolableColor;

})();

DecomposedMatrix2D = (function() {
  function DecomposedMatrix2D(props1) {
    this.props = props1;
    this.applyRotateCenter = bind(this.applyRotateCenter, this);
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
  }

  DecomposedMatrix2D.prototype.interpolate = function(endMatrix, t) {
    var i, k, l, len, len1, newProps, q, r, ref, ref1, ref2, u;
    newProps = {};
    ref = ['translate', 'scale', 'rotate'];
    for (l = 0, len = ref.length; l < len; l++) {
      k = ref[l];
      newProps[k] = [];
      for (i = q = 0, ref1 = this.props[k].length; 0 <= ref1 ? q < ref1 : q > ref1; i = 0 <= ref1 ? ++q : --q) {
        newProps[k][i] = (endMatrix.props[k][i] - this.props[k][i]) * t + this.props[k][i];
      }
    }
    for (i = r = 1; r <= 2; i = ++r) {
      newProps['rotate'][i] = endMatrix.props['rotate'][i];
    }
    ref2 = ['skew'];
    for (u = 0, len1 = ref2.length; u < len1; u++) {
      k = ref2[u];
      newProps[k] = (endMatrix.props[k] - this.props[k]) * t + this.props[k];
    }
    return new DecomposedMatrix2D(newProps);
  };

  DecomposedMatrix2D.prototype.format = function() {
    return "translate(" + (this.props.translate.join(',')) + ") rotate(" + (this.props.rotate.join(',')) + ") skewX(" + this.props.skew + ") scale(" + (this.props.scale.join(',')) + ")";
  };

  DecomposedMatrix2D.prototype.applyRotateCenter = function(rotateC) {
    var i, l, m, m2d, negativeTranslate, results;
    m = baseSVG.createSVGMatrix();
    m = m.translate(rotateC[0], rotateC[1]);
    m = m.rotate(this.props.rotate[0]);
    m = m.translate(-rotateC[0], -rotateC[1]);
    m2d = new Matrix2D(m);
    negativeTranslate = m2d.decompose().props.translate;
    results = [];
    for (i = l = 0; l <= 1; i = ++l) {
      results.push(this.props.translate[i] -= negativeTranslate[i]);
    }
    return results;
  };

  return DecomposedMatrix2D;

})();

baseSVG = typeof document !== "undefined" && document !== null ? document.createElementNS("http://www.w3.org/2000/svg", "svg") : void 0;

Matrix2D = (function() {
  function Matrix2D(m1) {
    this.m = m1;
    this.applyProperties = bind(this.applyProperties, this);
    this.decompose = bind(this.decompose, this);
    if (!this.m) {
      this.m = baseSVG.createSVGMatrix();
    }
  }

  Matrix2D.prototype.decompose = function() {
    var kx, ky, kz, r0, r1;
    r0 = new Vector([this.m.a, this.m.b]);
    r1 = new Vector([this.m.c, this.m.d]);
    kx = r0.length();
    kz = r0.dot(r1);
    r0 = r0.normalize();
    ky = r1.combine(r0, 1, -kz).length();
    return new DecomposedMatrix2D({
      translate: [this.m.e, this.m.f],
      rotate: [Math.atan2(this.m.b, this.m.a) * 180 / Math.PI, this.rotateCX, this.rotateCY],
      scale: [kx, ky],
      skew: kz / ky * 180 / Math.PI
    });
  };

  Matrix2D.prototype.applyProperties = function(properties) {
    var hash, k, l, len, props, ref, ref1, v;
    hash = {};
    for (l = 0, len = properties.length; l < len; l++) {
      props = properties[l];
      hash[props[0]] = props[1];
    }
    for (k in hash) {
      v = hash[k];
      if (k === "translateX") {
        this.m = this.m.translate(v, 0);
      } else if (k === "translateY") {
        this.m = this.m.translate(0, v);
      } else if (k === "scaleX") {
        this.m = this.m.scaleNonUniform(v, 1);
      } else if (k === "scaleY") {
        this.m = this.m.scaleNonUniform(1, v);
      } else if (k === "rotateZ") {
        this.m = this.m.rotate(v);
      } else if (k === "skewX") {
        this.m = this.m.skewX(v);
      } else if (k === "skewY") {
        this.m = this.m.skewY(v);
      }
    }
    this.rotateCX = (ref = hash.rotateCX) != null ? ref : 0;
    return this.rotateCY = (ref1 = hash.rotateCY) != null ? ref1 : 0;
  };

  return Matrix2D;

})();

Vector = (function() {
  function Vector(els1) {
    this.els = els1;
    this.combine = bind(this.combine, this);
    this.normalize = bind(this.normalize, this);
    this.length = bind(this.length, this);
    this.cross = bind(this.cross, this);
    this.dot = bind(this.dot, this);
    this.e = bind(this.e, this);
  }

  Vector.prototype.e = function(i) {
    if (i < 1 || i > this.els.length) {
      return null;
    } else {
      return this.els[i - 1];
    }
  };

  Vector.prototype.dot = function(vector) {
    var V, n, product;
    V = vector.els || vector;
    product = 0;
    n = this.els.length;
    if (n !== V.length) {
      return null;
    }
    n += 1;
    while (--n) {
      product += this.els[n - 1] * V[n - 1];
    }
    return product;
  };

  Vector.prototype.cross = function(vector) {
    var A, B;
    B = vector.els || vector;
    if (this.els.length !== 3 || B.length !== 3) {
      return null;
    }
    A = this.els;
    return new Vector([(A[1] * B[2]) - (A[2] * B[1]), (A[2] * B[0]) - (A[0] * B[2]), (A[0] * B[1]) - (A[1] * B[0])]);
  };

  Vector.prototype.length = function() {
    var a, e, l, len, ref;
    a = 0;
    ref = this.els;
    for (l = 0, len = ref.length; l < len; l++) {
      e = ref[l];
      a += Math.pow(e, 2);
    }
    return Math.sqrt(a);
  };

  Vector.prototype.normalize = function() {
    var e, i, length, newElements, ref;
    length = this.length();
    newElements = [];
    ref = this.els;
    for (i in ref) {
      e = ref[i];
      newElements[i] = e / length;
    }
    return new Vector(newElements);
  };

  Vector.prototype.combine = function(b, ascl, bscl) {
    var i, l, ref, result;
    result = [];
    for (i = l = 0, ref = this.els.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      result[i] = (ascl * this.els[i]) + (bscl * b.els[i]);
    }
    return new Vector(result);
  };

  return Vector;

})();

DecomposedMatrix = (function() {
  function DecomposedMatrix() {
    this.toMatrix = bind(this.toMatrix, this);
    this.format = bind(this.format, this);
    this.interpolate = bind(this.interpolate, this);
  }

  DecomposedMatrix.prototype.interpolate = function(decomposedB, t, only) {
    var angle, decomposed, decomposedA, i, invscale, invth, k, l, len, q, qa, qb, r, ref, ref1, scale, th, u;
    if (only == null) {
      only = null;
    }
    decomposedA = this;
    decomposed = new DecomposedMatrix;
    ref = ['translate', 'scale', 'skew', 'perspective'];
    for (l = 0, len = ref.length; l < len; l++) {
      k = ref[l];
      decomposed[k] = [];
      for (i = q = 0, ref1 = decomposedA[k].length - 1; 0 <= ref1 ? q <= ref1 : q >= ref1; i = 0 <= ref1 ? ++q : --q) {
        if ((only == null) || only.indexOf(k) > -1 || only.indexOf("" + k + ['x', 'y', 'z'][i]) > -1) {
          decomposed[k][i] = (decomposedB[k][i] - decomposedA[k][i]) * t + decomposedA[k][i];
        } else {
          decomposed[k][i] = decomposedA[k][i];
        }
      }
    }
    if ((only == null) || only.indexOf('rotate') !== -1) {
      qa = decomposedA.quaternion;
      qb = decomposedB.quaternion;
      angle = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
      if (angle < 0.0) {
        for (i = r = 0; r <= 3; i = ++r) {
          qa[i] = -qa[i];
        }
        angle = -angle;
      }
      if (angle + 1.0 > .05) {
        if (1.0 - angle >= .05) {
          th = Math.acos(angle);
          invth = 1.0 / Math.sin(th);
          scale = Math.sin(th * (1.0 - t)) * invth;
          invscale = Math.sin(th * t) * invth;
        } else {
          scale = 1.0 - t;
          invscale = t;
        }
      } else {
        qb[0] = -qa[1];
        qb[1] = qa[0];
        qb[2] = -qa[3];
        qb[3] = qa[2];
        scale = Math.sin(piDouble * (.5 - t));
        invscale = Math.sin(piDouble * t);
      }
      decomposed.quaternion = [];
      for (i = u = 0; u <= 3; i = ++u) {
        decomposed.quaternion[i] = qa[i] * scale + qb[i] * invscale;
      }
    } else {
      decomposed.quaternion = decomposedA.quaternion;
    }
    return decomposed;
  };

  DecomposedMatrix.prototype.format = function() {
    return this.toMatrix().toString();
  };

  DecomposedMatrix.prototype.toMatrix = function() {
    var decomposedMatrix, i, j, l, match, matrix, q, quaternion, r, skew, temp, u, w, x, y, z;
    decomposedMatrix = this;
    matrix = Matrix.I(4);
    for (i = l = 0; l <= 3; i = ++l) {
      matrix.els[i][3] = decomposedMatrix.perspective[i];
    }
    quaternion = decomposedMatrix.quaternion;
    x = quaternion[0];
    y = quaternion[1];
    z = quaternion[2];
    w = quaternion[3];
    skew = decomposedMatrix.skew;
    match = [[1, 0], [2, 0], [2, 1]];
    for (i = q = 2; q >= 0; i = --q) {
      if (skew[i]) {
        temp = Matrix.I(4);
        temp.els[match[i][0]][match[i][1]] = skew[i];
        matrix = matrix.multiply(temp);
      }
    }
    matrix = matrix.multiply(new Matrix([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 0], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 0], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), 0], [0, 0, 0, 1]]));
    for (i = r = 0; r <= 2; i = ++r) {
      for (j = u = 0; u <= 2; j = ++u) {
        matrix.els[i][j] *= decomposedMatrix.scale[i];
      }
      matrix.els[3][i] = decomposedMatrix.translate[i];
    }
    return matrix;
  };

  return DecomposedMatrix;

})();

Matrix = (function() {
  function Matrix(els1) {
    this.els = els1;
    this.toString = bind(this.toString, this);
    this.decompose = bind(this.decompose, this);
    this.inverse = bind(this.inverse, this);
    this.augment = bind(this.augment, this);
    this.toRightTriangular = bind(this.toRightTriangular, this);
    this.transpose = bind(this.transpose, this);
    this.multiply = bind(this.multiply, this);
    this.dup = bind(this.dup, this);
    this.e = bind(this.e, this);
  }

  Matrix.prototype.e = function(i, j) {
    if (i < 1 || i > this.els.length || j < 1 || j > this.els[0].length) {
      return null;
    }
    return this.els[i - 1][j - 1];
  };

  Matrix.prototype.dup = function() {
    return new Matrix(this.els);
  };

  Matrix.prototype.multiply = function(matrix) {
    var M, c, cols, elements, i, j, ki, kj, nc, ni, nj, returnVector, sum;
    returnVector = matrix.modulus ? true : false;
    M = matrix.els || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).els;
    }
    ni = this.els.length;
    ki = ni;
    kj = M[0].length;
    cols = this.els[0].length;
    elements = [];
    ni += 1;
    while (--ni) {
      i = ki - ni;
      elements[i] = [];
      nj = kj;
      nj += 1;
      while (--nj) {
        j = kj - nj;
        sum = 0;
        nc = cols;
        nc += 1;
        while (--nc) {
          c = cols - nc;
          sum += this.els[i][c] * M[c][j];
        }
        elements[i][j] = sum;
      }
    }
    M = new Matrix(elements);
    if (returnVector) {
      return M.col(1);
    } else {
      return M;
    }
  };

  Matrix.prototype.transpose = function() {
    var cols, elements, i, j, ni, nj, rows;
    rows = this.els.length;
    cols = this.els[0].length;
    elements = [];
    ni = cols;
    ni += 1;
    while (--ni) {
      i = cols - ni;
      elements[i] = [];
      nj = rows;
      nj += 1;
      while (--nj) {
        j = rows - nj;
        elements[i][j] = this.els[j][i];
      }
    }
    return new Matrix(elements);
  };

  Matrix.prototype.toRightTriangular = function() {
    var M, els, i, j, k, kp, l, multiplier, n, np, p, q, ref, ref1, ref2, ref3;
    M = this.dup();
    n = this.els.length;
    k = n;
    kp = this.els[0].length;
    while (--n) {
      i = k - n;
      if (M.els[i][i] === 0) {
        for (j = l = ref = i + 1, ref1 = k; ref <= ref1 ? l < ref1 : l > ref1; j = ref <= ref1 ? ++l : --l) {
          if (M.els[j][i] !== 0) {
            els = [];
            np = kp;
            np += 1;
            while (--np) {
              p = kp - np;
              els.push(M.els[i][p] + M.els[j][p]);
            }
            M.els[i] = els;
            break;
          }
        }
      }
      if (M.els[i][i] !== 0) {
        for (j = q = ref2 = i + 1, ref3 = k; ref2 <= ref3 ? q < ref3 : q > ref3; j = ref2 <= ref3 ? ++q : --q) {
          multiplier = M.els[j][i] / M.els[i][i];
          els = [];
          np = kp;
          np += 1;
          while (--np) {
            p = kp - np;
            els.push(p <= i ? 0 : M.els[j][p] - M.els[i][p] * multiplier);
          }
          M.els[j] = els;
        }
      }
    }
    return M;
  };

  Matrix.prototype.augment = function(matrix) {
    var M, T, cols, i, j, ki, kj, ni, nj;
    M = matrix.els || matrix;
    if (typeof M[0][0] === 'undefined') {
      M = new Matrix(M).els;
    }
    T = this.dup();
    cols = T.els[0].length;
    ni = T.els.length;
    ki = ni;
    kj = M[0].length;
    if (ni !== M.length) {
      return null;
    }
    ni += 1;
    while (--ni) {
      i = ki - ni;
      nj = kj;
      nj += 1;
      while (--nj) {
        j = kj - nj;
        T.els[i][cols + j] = M[i][j];
      }
    }
    return T;
  };

  Matrix.prototype.inverse = function() {
    var M, divisor, els, i, inverse_elements, j, ki, kp, l, new_element, ni, np, p, ref;
    ni = this.els.length;
    ki = ni;
    M = this.augment(Matrix.I(ni)).toRightTriangular();
    kp = M.els[0].length;
    inverse_elements = [];
    ni += 1;
    while (--ni) {
      i = ni - 1;
      els = [];
      np = kp;
      inverse_elements[i] = [];
      divisor = M.els[i][i];
      np += 1;
      while (--np) {
        p = kp - np;
        new_element = M.els[i][p] / divisor;
        els.push(new_element);
        if (p >= ki) {
          inverse_elements[i].push(new_element);
        }
      }
      M.els[i] = els;
      for (j = l = 0, ref = i; 0 <= ref ? l < ref : l > ref; j = 0 <= ref ? ++l : --l) {
        els = [];
        np = kp;
        np += 1;
        while (--np) {
          p = kp - np;
          els.push(M.els[j][p] - M.els[i][p] * M.els[j][i]);
        }
        M.els[j] = els;
      }
    }
    return new Matrix(inverse_elements);
  };

  Matrix.I = function(n) {
    var els, i, j, k, nj;
    els = [];
    k = n;
    n += 1;
    while (--n) {
      i = k - n;
      els[i] = [];
      nj = k;
      nj += 1;
      while (--nj) {
        j = k - nj;
        els[i][j] = i === j ? 1 : 0;
      }
    }
    return new Matrix(els);
  };

  Matrix.prototype.decompose = function() {
    var aa, ab, ac, ad, ae, af, els, i, inversePerspectiveMatrix, j, k, l, matrix, pdum3, perspective, perspectiveMatrix, q, quaternion, r, result, rightHandSide, rotate, row, rowElement, s, scale, skew, t, translate, transposedInversePerspectiveMatrix, type, typeKey, u, v, w, x, y, z;
    matrix = this;
    translate = [];
    scale = [];
    skew = [];
    quaternion = [];
    perspective = [];
    els = [];
    for (i = l = 0; l <= 3; i = ++l) {
      els[i] = [];
      for (j = q = 0; q <= 3; j = ++q) {
        els[i][j] = matrix.els[i][j];
      }
    }
    if (els[3][3] === 0) {
      return false;
    }
    for (i = r = 0; r <= 3; i = ++r) {
      for (j = u = 0; u <= 3; j = ++u) {
        els[i][j] /= els[3][3];
      }
    }
    perspectiveMatrix = matrix.dup();
    for (i = aa = 0; aa <= 2; i = ++aa) {
      perspectiveMatrix.els[i][3] = 0;
    }
    perspectiveMatrix.els[3][3] = 1;
    if (els[0][3] !== 0 || els[1][3] !== 0 || els[2][3] !== 0) {
      rightHandSide = new Vector(els.slice(0, 4)[3]);
      inversePerspectiveMatrix = perspectiveMatrix.inverse();
      transposedInversePerspectiveMatrix = inversePerspectiveMatrix.transpose();
      perspective = transposedInversePerspectiveMatrix.multiply(rightHandSide).els;
      for (i = ab = 0; ab <= 2; i = ++ab) {
        els[i][3] = 0;
      }
      els[3][3] = 1;
    } else {
      perspective = [0, 0, 0, 1];
    }
    for (i = ac = 0; ac <= 2; i = ++ac) {
      translate[i] = els[3][i];
      els[3][i] = 0;
    }
    row = [];
    for (i = ad = 0; ad <= 2; i = ++ad) {
      row[i] = new Vector(els[i].slice(0, 3));
    }
    scale[0] = row[0].length();
    row[0] = row[0].normalize();
    skew[0] = row[0].dot(row[1]);
    row[1] = row[1].combine(row[0], 1.0, -skew[0]);
    scale[1] = row[1].length();
    row[1] = row[1].normalize();
    skew[0] /= scale[1];
    skew[1] = row[0].dot(row[2]);
    row[2] = row[2].combine(row[0], 1.0, -skew[1]);
    skew[2] = row[1].dot(row[2]);
    row[2] = row[2].combine(row[1], 1.0, -skew[2]);
    scale[2] = row[2].length();
    row[2] = row[2].normalize();
    skew[1] /= scale[2];
    skew[2] /= scale[2];
    pdum3 = row[1].cross(row[2]);
    if (row[0].dot(pdum3) < 0) {
      for (i = ae = 0; ae <= 2; i = ++ae) {
        scale[i] *= -1;
        for (j = af = 0; af <= 2; j = ++af) {
          row[i].els[j] *= -1;
        }
      }
    }
    rowElement = function(index, elementIndex) {
      return row[index].els[elementIndex];
    };
    rotate = [];
    rotate[1] = Math.asin(-rowElement(0, 2));
    if (Math.cos(rotate[1]) !== 0) {
      rotate[0] = Math.atan2(rowElement(1, 2), rowElement(2, 2));
      rotate[2] = Math.atan2(rowElement(0, 1), rowElement(0, 0));
    } else {
      rotate[0] = Math.atan2(-rowElement(2, 0), rowElement(1, 1));
      rotate[1] = 0;
    }
    t = rowElement(0, 0) + rowElement(1, 1) + rowElement(2, 2) + 1.0;
    if (t > 1e-4) {
      s = 0.5 / Math.sqrt(t);
      w = 0.25 / s;
      x = (rowElement(2, 1) - rowElement(1, 2)) * s;
      y = (rowElement(0, 2) - rowElement(2, 0)) * s;
      z = (rowElement(1, 0) - rowElement(0, 1)) * s;
    } else if ((rowElement(0, 0) > rowElement(1, 1)) && (rowElement(0, 0) > rowElement(2, 2))) {
      s = Math.sqrt(1.0 + rowElement(0, 0) - rowElement(1, 1) - rowElement(2, 2)) * 2.0;
      x = 0.25 * s;
      y = (rowElement(0, 1) + rowElement(1, 0)) / s;
      z = (rowElement(0, 2) + rowElement(2, 0)) / s;
      w = (rowElement(2, 1) - rowElement(1, 2)) / s;
    } else if (rowElement(1, 1) > rowElement(2, 2)) {
      s = Math.sqrt(1.0 + rowElement(1, 1) - rowElement(0, 0) - rowElement(2, 2)) * 2.0;
      x = (rowElement(0, 1) + rowElement(1, 0)) / s;
      y = 0.25 * s;
      z = (rowElement(1, 2) + rowElement(2, 1)) / s;
      w = (rowElement(0, 2) - rowElement(2, 0)) / s;
    } else {
      s = Math.sqrt(1.0 + rowElement(2, 2) - rowElement(0, 0) - rowElement(1, 1)) * 2.0;
      x = (rowElement(0, 2) + rowElement(2, 0)) / s;
      y = (rowElement(1, 2) + rowElement(2, 1)) / s;
      z = 0.25 * s;
      w = (rowElement(1, 0) - rowElement(0, 1)) / s;
    }
    quaternion = [x, y, z, w];
    result = new DecomposedMatrix;
    result.translate = translate;
    result.scale = scale;
    result.skew = skew;
    result.quaternion = quaternion;
    result.perspective = perspective;
    result.rotate = rotate;
    for (typeKey in result) {
      type = result[typeKey];
      for (k in type) {
        v = type[k];
        if (isNaN(v)) {
          type[k] = 0;
        }
      }
    }
    return result;
  };

  Matrix.prototype.toString = function() {
    var i, j, l, q, str;
    str = 'matrix3d(';
    for (i = l = 0; l <= 3; i = ++l) {
      for (j = q = 0; q <= 3; j = ++q) {
        str += roundf(this.els[i][j], 10);
        if (!(i === 3 && j === 3)) {
          str += ',';
        }
      }
    }
    str += ')';
    return str;
  };

  Matrix.matrixForTransform = cacheFn(function(transform) {
    var matrixEl, ref, ref1, ref2, result, style;
    matrixEl = document.createElement('div');
    matrixEl.style.position = 'absolute';
    matrixEl.style.visibility = 'hidden';
    matrixEl.style[propertyWithPrefix("transform")] = transform;
    document.body.appendChild(matrixEl);
    style = window.getComputedStyle(matrixEl, null);
    result = (ref = (ref1 = style.transform) != null ? ref1 : style[propertyWithPrefix("transform")]) != null ? ref : (ref2 = dynamics.tests) != null ? ref2.matrixForTransform(transform) : void 0;
    document.body.removeChild(matrixEl);
    return result;
  });

  Matrix.fromTransform = function(transform) {
    var digits, elements, i, l, match, matrixElements;
    match = transform != null ? transform.match(/matrix3?d?\(([-0-9,e \.]*)\)/) : void 0;
    if (match) {
      digits = match[1].split(',');
      digits = digits.map(parseFloat);
      if (digits.length === 6) {
        elements = [digits[0], digits[1], 0, 0, digits[2], digits[3], 0, 0, 0, 0, 1, 0, digits[4], digits[5], 0, 1];
      } else {
        elements = digits;
      }
    } else {
      elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
    matrixElements = [];
    for (i = l = 0; l <= 3; i = ++l) {
      matrixElements.push(elements.slice(i * 4, i * 4 + 4));
    }
    return new Matrix(matrixElements);
  };

  return Matrix;

})();

prefixFor = cacheFn(function(property) {
  var k, l, len, len1, prefix, prop, propArray, propertyName, q, ref;
  if (document.body.style[property] !== void 0) {
    return '';
  }
  propArray = property.split('-');
  propertyName = "";
  for (l = 0, len = propArray.length; l < len; l++) {
    prop = propArray[l];
    propertyName += prop.substring(0, 1).toUpperCase() + prop.substring(1);
  }
  ref = ["Webkit", "Moz", "ms"];
  for (q = 0, len1 = ref.length; q < len1; q++) {
    prefix = ref[q];
    k = prefix + propertyName;
    if (document.body.style[k] !== void 0) {
      return prefix;
    }
  }
  return '';
});

propertyWithPrefix = cacheFn(function(property) {
  var prefix;
  prefix = prefixFor(property);
  if (prefix === 'Moz') {
    return "" + prefix + (property.substring(0, 1).toUpperCase() + property.substring(1));
  }
  if (prefix !== '') {
    return "-" + (prefix.toLowerCase()) + "-" + (toDashed(property));
  }
  return toDashed(property);
});

rAF = typeof window !== "undefined" && window !== null ? window.requestAnimationFrame : void 0;

animations = [];

animationsTimeouts = [];

slow = false;

slowRatio = 1;

if (typeof window !== "undefined" && window !== null) {
  window.addEventListener('keyup', function(e) {
    if (e.keyCode === 68 && e.shiftKey && e.ctrlKey) {
      return dynamics.toggleSlow();
    }
  });
}

if (rAF == null) {
  lastTime = 0;
  rAF = function(callback) {
    var currTime, id, timeToCall;
    currTime = Date.now();
    timeToCall = Math.max(0, 16 - (currTime - lastTime));
    id = window.setTimeout(function() {
      return callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

runLoopRunning = false;

runLoopPaused = false;

startRunLoop = function() {
  if (!runLoopRunning) {
    runLoopRunning = true;
    return rAF(runLoopTick);
  }
};

runLoopTick = function(t) {
  var animation, l, len, toRemoveAnimations;
  if (runLoopPaused) {
    rAF(runLoopTick);
    return;
  }
  toRemoveAnimations = [];
  for (l = 0, len = animations.length; l < len; l++) {
    animation = animations[l];
    if (!animationTick(t, animation)) {
      toRemoveAnimations.push(animation);
    }
  }
  animations = animations.filter(function(animation) {
    return toRemoveAnimations.indexOf(animation) === -1;
  });
  if (animations.length === 0) {
    return runLoopRunning = false;
  } else {
    return rAF(runLoopTick);
  }
};

animationTick = function(t, animation) {
  var base, base1, key, properties, property, ref, tt, y;
  if (animation.tStart == null) {
    animation.tStart = t;
  }
  tt = (t - animation.tStart) / animation.options.duration;
  y = animation.curve(tt);
  properties = {};
  if (tt >= 1) {
    if (animation.curve.returnsToSelf) {
      properties = animation.properties.start;
    } else {
      properties = animation.properties.end;
    }
  } else {
    ref = animation.properties.start;
    for (key in ref) {
      property = ref[key];
      properties[key] = interpolate(property, animation.properties.end[key], y);
    }
  }
  applyFrame(animation.el, properties);
  if (typeof (base = animation.options).change === "function") {
    base.change(animation.el, Math.min(1, tt));
  }
  if (tt >= 1) {
    if (typeof (base1 = animation.options).complete === "function") {
      base1.complete(animation.el);
    }
  }
  return tt < 1;
};

interpolate = function(start, end, y) {
  if ((start != null) && (start.interpolate != null)) {
    return start.interpolate(end, y);
  }
  return null;
};

startAnimation = function(el, properties, options, timeoutId) {
  var endProperties, isSVG, k, matrix, startProperties, transforms, v;
  if (timeoutId != null) {
    animationsTimeouts = animationsTimeouts.filter(function(timeout) {
      return timeout.id !== timeoutId;
    });
  }
  dynamics.stop(el, {
    timeout: false
  });
  if (!options.animated) {
    dynamics.css(el, properties);
    if (typeof options.complete === "function") {
      options.complete(this);
    }
    return;
  }
  startProperties = getCurrentProperties(el, Object.keys(properties));
  properties = parseProperties(properties);
  endProperties = {};
  transforms = [];
  for (k in properties) {
    v = properties[k];
    if ((el.style != null) && transformProperties.contains(k)) {
      transforms.push([k, v]);
    } else {
      endProperties[k] = createInterpolable(v);
    }
  }
  if (transforms.length > 0) {
    isSVG = isSVGElement(el);
    if (isSVG) {
      matrix = new Matrix2D();
      matrix.applyProperties(transforms);
    } else {
      v = (transforms.map(function(transform) {
        return transformValueForProperty(transform[0], transform[1]);
      })).join(" ");
      matrix = Matrix.fromTransform(Matrix.matrixForTransform(v));
    }
    endProperties['transform'] = matrix.decompose();
    if (isSVG) {
      startProperties.transform.applyRotateCenter([endProperties.transform.props.rotate[1], endProperties.transform.props.rotate[2]]);
    }
  }
  addUnitsToNumberInterpolables(el, endProperties);
  animations.push({
    el: el,
    properties: {
      start: startProperties,
      end: endProperties
    },
    options: options,
    curve: options.type.call(options.type, options)
  });
  return startRunLoop();
};

timeouts = [];

timeoutLastId = 0;

setRealTimeout = function(timeout) {
  if (!isDocumentVisible()) {
    return;
  }
  return rAF(function() {
    if (timeouts.indexOf(timeout) === -1) {
      return;
    }
    return timeout.realTimeoutId = setTimeout(function() {
      timeout.fn();
      return cancelTimeout(timeout.id);
    }, timeout.delay);
  });
};

addTimeout = function(fn, delay) {
  var timeout;
  timeoutLastId += 1;
  timeout = {
    id: timeoutLastId,
    tStart: Date.now(),
    fn: fn,
    delay: delay,
    originalDelay: delay
  };
  setRealTimeout(timeout);
  timeouts.push(timeout);
  return timeoutLastId;
};

cancelTimeout = function(id) {
  return timeouts = timeouts.filter(function(timeout) {
    if (timeout.id === id && timeout.realTimeoutId) {
      clearTimeout(timeout.realTimeoutId);
    }
    return timeout.id !== id;
  });
};

leftDelayForTimeout = function(time, timeout) {
  var consumedDelay;
  if (time != null) {
    consumedDelay = time - timeout.tStart;
    return timeout.originalDelay - consumedDelay;
  } else {
    return timeout.originalDelay;
  }
};

if (typeof window !== "undefined" && window !== null) {
  window.addEventListener('unload', function() {});
}

timeBeforeVisibilityChange = null;

observeVisibilityChange(function(visible) {
  var animation, difference, l, len, len1, len2, q, r, results, timeout;
  runLoopPaused = !visible;
  if (!visible) {
    timeBeforeVisibilityChange = Date.now();
    results = [];
    for (l = 0, len = timeouts.length; l < len; l++) {
      timeout = timeouts[l];
      results.push(clearTimeout(timeout.realTimeoutId));
    }
    return results;
  } else {
    if (runLoopRunning) {
      difference = Date.now() - timeBeforeVisibilityChange;
      for (q = 0, len1 = animations.length; q < len1; q++) {
        animation = animations[q];
        if (animation.tStart != null) {
          animation.tStart += difference;
        }
      }
    }
    for (r = 0, len2 = timeouts.length; r < len2; r++) {
      timeout = timeouts[r];
      timeout.delay = leftDelayForTimeout(timeBeforeVisibilityChange, timeout);
      setRealTimeout(timeout);
    }
    return timeBeforeVisibilityChange = null;
  }
});

dynamics = {};

dynamics.linear = function() {
  return function(t) {
    return t;
  };
};

dynamics.spring = function(options) {
  var A1, A2, decal, frequency, friction, s;
  if (options == null) {
    options = {};
  }
  applyDefaults(options, dynamics.spring.defaults);
  frequency = Math.max(1, options.frequency / 20);
  friction = Math.pow(20, options.friction / 100);
  s = options.anticipationSize / 1000;
  decal = Math.max(0, s);
  A1 = function(t) {
    var M, a, b, x0, x1;
    M = 0.8;
    x0 = s / (1 - s);
    x1 = 0;
    b = (x0 - (M * x1)) / (x0 - x1);
    a = (M - b) / x0;
    return (a * t * options.anticipationStrength / 100) + b;
  };
  A2 = function(t) {
    return Math.pow(friction / 10, -t) * (1 - t);
  };
  return function(t) {
    var A, At, a, angle, b, frictionT, y0, yS;
    frictionT = (t / (1 - s)) - (s / (1 - s));
    if (t < s) {
      yS = (s / (1 - s)) - (s / (1 - s));
      y0 = (0 / (1 - s)) - (s / (1 - s));
      b = Math.acos(1 / A1(yS));
      a = (Math.acos(1 / A1(y0)) - b) / (frequency * (-s));
      A = A1;
    } else {
      A = A2;
      b = 0;
      a = 1;
    }
    At = A(frictionT);
    angle = frequency * (t - s) * a + b;
    return 1 - (At * Math.cos(angle));
  };
};

dynamics.bounce = function(options) {
  var A, fn, frequency, friction;
  if (options == null) {
    options = {};
  }
  applyDefaults(options, dynamics.bounce.defaults);
  frequency = Math.max(1, options.frequency / 20);
  friction = Math.pow(20, options.friction / 100);
  A = function(t) {
    return Math.pow(friction / 10, -t) * (1 - t);
  };
  fn = function(t) {
    var At, a, angle, b;
    b = -3.14 / 2;
    a = 1;
    At = A(t);
    angle = frequency * t * a + b;
    return At * Math.cos(angle);
  };
  fn.returnsToSelf = true;
  return fn;
};

dynamics.gravity = function(options) {
  var L, bounciness, curves, elasticity, fn, getPointInCurve, gravity;
  if (options == null) {
    options = {};
  }
  applyDefaults(options, dynamics.gravity.defaults);
  bounciness = Math.min(options.bounciness / 1250, 0.8);
  elasticity = options.elasticity / 1000;
  gravity = 100;
  curves = [];
  L = (function() {
    var b, curve;
    b = Math.sqrt(2 / gravity);
    curve = {
      a: -b,
      b: b,
      H: 1
    };
    if (options.returnsToSelf) {
      curve.a = 0;
      curve.b = curve.b * 2;
    }
    while (curve.H > 0.001) {
      L = curve.b - curve.a;
      curve = {
        a: curve.b,
        b: curve.b + L * bounciness,
        H: curve.H * bounciness * bounciness
      };
    }
    return curve.b;
  })();
  getPointInCurve = function(a, b, H, t) {
    var c, t2;
    L = b - a;
    t2 = (2 / L) * t - 1 - (a * 2 / L);
    c = t2 * t2 * H - H + 1;
    if (options.returnsToSelf) {
      c = 1 - c;
    }
    return c;
  };
  (function() {
    var L2, b, curve, results;
    b = Math.sqrt(2 / (gravity * L * L));
    curve = {
      a: -b,
      b: b,
      H: 1
    };
    if (options.returnsToSelf) {
      curve.a = 0;
      curve.b = curve.b * 2;
    }
    curves.push(curve);
    L2 = L;
    results = [];
    while (curve.b < 1 && curve.H > 0.001) {
      L2 = curve.b - curve.a;
      curve = {
        a: curve.b,
        b: curve.b + L2 * bounciness,
        H: curve.H * elasticity
      };
      results.push(curves.push(curve));
    }
    return results;
  })();
  fn = function(t) {
    var curve, i, v;
    i = 0;
    curve = curves[i];
    while (!(t >= curve.a && t <= curve.b)) {
      i += 1;
      curve = curves[i];
      if (!curve) {
        break;
      }
    }
    if (!curve) {
      v = options.returnsToSelf ? 0 : 1;
    } else {
      v = getPointInCurve(curve.a, curve.b, curve.H, t);
    }
    return v;
  };
  fn.returnsToSelf = options.returnsToSelf;
  return fn;
};

dynamics.forceWithGravity = function(options) {
  if (options == null) {
    options = {};
  }
  applyDefaults(options, dynamics.forceWithGravity.defaults);
  options.returnsToSelf = true;
  return dynamics.gravity(options);
};

dynamics.bezier = (function() {
  var Bezier, Bezier_, yForX;
  Bezier_ = function(t, p0, p1, p2, p3) {
    return (Math.pow(1 - t, 3) * p0) + (3 * Math.pow(1 - t, 2) * t * p1) + (3 * (1 - t) * Math.pow(t, 2) * p2) + Math.pow(t, 3) * p3;
  };
  Bezier = function(t, p0, p1, p2, p3) {
    return {
      x: Bezier_(t, p0.x, p1.x, p2.x, p3.x),
      y: Bezier_(t, p0.y, p1.y, p2.y, p3.y)
    };
  };
  yForX = function(xTarget, Bs, returnsToSelf) {
    var B, aB, i, l, len, lower, percent, upper, x, xTolerance;
    B = null;
    for (l = 0, len = Bs.length; l < len; l++) {
      aB = Bs[l];
      if (xTarget >= aB(0).x && xTarget <= aB(1).x) {
        B = aB;
      }
      if (B !== null) {
        break;
      }
    }
    if (!B) {
      if (returnsToSelf) {
        return 0;
      } else {
        return 1;
      }
    }
    xTolerance = 0.0001;
    lower = 0;
    upper = 1;
    percent = (upper + lower) / 2;
    x = B(percent).x;
    i = 0;
    while (Math.abs(xTarget - x) > xTolerance && i < 100) {
      if (xTarget > x) {
        lower = percent;
      } else {
        upper = percent;
      }
      percent = (upper + lower) / 2;
      x = B(percent).x;
      i += 1;
    }
    return B(percent).y;
  };
  return function(options) {
    var Bs, fn, points;
    if (options == null) {
      options = {};
    }
    points = options.points;
    Bs = (function() {
      var fn1, i, k;
      Bs = [];
      fn1 = function(pointA, pointB) {
        var B2;
        B2 = function(t) {
          return Bezier(t, pointA, pointA.cp[pointA.cp.length - 1], pointB.cp[0], pointB);
        };
        return Bs.push(B2);
      };
      for (i in points) {
        k = parseInt(i);
        if (k >= points.length - 1) {
          break;
        }
        fn1(points[k], points[k + 1]);
      }
      return Bs;
    })();
    fn = function(t) {
      if (t === 0) {
        return 0;
      } else if (t === 1) {
        return 1;
      } else {
        return yForX(t, Bs, this.returnsToSelf);
      }
    };
    fn.returnsToSelf = points[points.length - 1].y === 0;
    return fn;
  };
})();

dynamics.easeInOut = function(options) {
  var friction, ref;
  if (options == null) {
    options = {};
  }
  friction = (ref = options.friction) != null ? ref : dynamics.easeInOut.defaults.friction;
  return dynamics.bezier({
    points: [
      {
        x: 0,
        y: 0,
        cp: [
          {
            x: 0.92 - (friction / 1000),
            y: 0
          }
        ]
      }, {
        x: 1,
        y: 1,
        cp: [
          {
            x: 0.08 + (friction / 1000),
            y: 1
          }
        ]
      }
    ]
  });
};

dynamics.easeIn = function(options) {
  var friction, ref;
  if (options == null) {
    options = {};
  }
  friction = (ref = options.friction) != null ? ref : dynamics.easeIn.defaults.friction;
  return dynamics.bezier({
    points: [
      {
        x: 0,
        y: 0,
        cp: [
          {
            x: 0.92 - (friction / 1000),
            y: 0
          }
        ]
      }, {
        x: 1,
        y: 1,
        cp: [
          {
            x: 1,
            y: 1
          }
        ]
      }
    ]
  });
};

dynamics.easeOut = function(options) {
  var friction, ref;
  if (options == null) {
    options = {};
  }
  friction = (ref = options.friction) != null ? ref : dynamics.easeOut.defaults.friction;
  return dynamics.bezier({
    points: [
      {
        x: 0,
        y: 0,
        cp: [
          {
            x: 0,
            y: 0
          }
        ]
      }, {
        x: 1,
        y: 1,
        cp: [
          {
            x: 0.08 + (friction / 1000),
            y: 1
          }
        ]
      }
    ]
  });
};

dynamics.spring.defaults = {
  frequency: 300,
  friction: 200,
  anticipationSize: 0,
  anticipationStrength: 0
};

dynamics.bounce.defaults = {
  frequency: 300,
  friction: 200
};

dynamics.forceWithGravity.defaults = dynamics.gravity.defaults = {
  bounciness: 400,
  elasticity: 200
};

dynamics.easeInOut.defaults = dynamics.easeIn.defaults = dynamics.easeOut.defaults = {
  friction: 500
};

dynamics.css = makeArrayFn(function(el, properties) {
  return applyProperties(el, properties, true);
});

dynamics.animate = makeArrayFn(function(el, properties, options) {
  var id;
  if (options == null) {
    options = {};
  }
  options = clone(options);
  applyDefaults(options, {
    type: dynamics.easeInOut,
    duration: 1000,
    delay: 0,
    animated: true
  });
  options.duration = Math.max(0, options.duration * slowRatio);
  options.delay = Math.max(0, options.delay);
  if (options.delay === 0) {
    return startAnimation(el, properties, options);
  } else {
    id = dynamics.setTimeout(function() {
      return startAnimation(el, properties, options, id);
    }, options.delay);
    return animationsTimeouts.push({
      id: id,
      el: el
    });
  }
});

dynamics.stop = makeArrayFn(function(el, options) {
  if (options == null) {
    options = {};
  }
  if (options.timeout == null) {
    options.timeout = true;
  }
  if (options.timeout) {
    animationsTimeouts = animationsTimeouts.filter(function(timeout) {
      if (timeout.el === el && ((options.filter == null) || options.filter(timeout))) {
        dynamics.clearTimeout(timeout.id);
        return false;
      }
      return true;
    });
  }
  return animations = animations.filter(function(animation) {
    return animation.el !== el;
  });
});

dynamics.setTimeout = function(fn, delay) {
  return addTimeout(fn, delay * slowRatio);
};

dynamics.clearTimeout = function(id) {
  return cancelTimeout(id);
};

dynamics.toggleSlow = function() {
  slow = !slow;
  if (slow) {
    slowRatio = 3;
  } else {
    slowRatio = 1;
  }
  return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log("dynamics.js: slow animations " + (slow ? "enabled" : "disabled")) : void 0 : void 0;
};

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = dynamics;
} else if (typeof define === "function") {
  define('dynamics', function() {
    return dynamics;
  });
} else {
  window.dynamics = dynamics;
}

 const DYNAMIC_TYPES = {
  SPRING:dynamics.spring,
  BOUNCE:dynamics.bounce,
  FORCE_WITH_GRAVITY:dynamics.forceWithGravity,
  GRAVITY:dynamics.gravity,
  EASE_IN_OUT:dynamics.easeInOut,
  EASE_IN:dynamics.easeIn,
  EASE_OUT:dynamics.easeOut,
  LINEAR:dynamics.linear,
  BEZIER:dynamics.bezier
}
dynamics.DYNAMIC_TYPES = DYNAMIC_TYPES
export default dynamics



// ---
// generated by coffee-script 1.9.2