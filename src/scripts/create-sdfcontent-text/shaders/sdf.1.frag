precision mediump float;

varying vec2 vTextureCoord;
varying float vScale;
varying float vSize;

varying vec4 vColor;
uniform vec3 u_color;
uniform sampler2D uSampler;
uniform float u_alpha;
uniform float u_fontSize;
uniform float u_weight;


mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}
float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main(void)
{
    float smoothing = 1. / vSize * 6.;
    float debug = 0.0;

    // vec2 textureCoord = (vTextureCoord * 2.) ¨ scale(vec2(1.0));
    float dist = texture2D(uSampler, vTextureCoord).r;
    // float invers = -1.0;
    vec4 sample = texture2D(uSampler, vTextureCoord);

    // float scale = vScale/(3.*2);
    // float dist = texture2D(uSampler,1.0/scale*(gl_PointCoord+vTextureCoord/(1./scale))).a;
   
    if (debug > 0.0) {
        float alpha = smoothstep(u_weight - smoothing, u_weight + smoothing, dist);
        //  float alpha = smoothstep(u_weight - smoothing, u_weight + smoothing, dist);

        vec4 color = vec4(dist, dist, dist, alpha);
         color =   vColor*vec4(dist);
        // color = border(color,alpha);
        gl_FragColor = vec4(color.rgb,dist);
    } else {

        float distanceFactor = 5.;
        float sigDist = distanceFactor*(median(sample.r, sample.g, sample.b) - 0.5);
        float opacity = clamp(sigDist + .5 , 0.0, 1.0);
        vec4 bgColor = vec4(0., 0., 0., 0.0);
        vec4 fgColor = vColor;
       
        gl_FragColor = mix(bgColor, fgColor,  opacity);
    }
     gl_FragColor = vec4(vec3(0.,1.,0.), .3);
}
