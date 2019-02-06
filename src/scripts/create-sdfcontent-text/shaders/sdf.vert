attribute vec2 aVertexPosition;
attribute vec3 color;
attribute vec2 aTextureCoord;
attribute float aVertexSize;
attribute vec4 aVertexColor;
attribute vec4 position;




varying vec2 vTextureCoord;

varying float vScale;
varying vec4 vColor;
varying float vSize;



uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
uniform float u_fontInfoSize;

void main(void)
{
    // float f =  aVertexSize;
    // vTextureCoord = aTextureCoord;
    // float scale = aVertexSize;//1.5;
    // vec2 pos = aVertexPosition;
    // vScale = aVertexSize;
    // vColor = aVertexColor;//vec4(aVertexColor.rgb,0.3);
    // vSize = aVertexSize;
    vec4 c = vec4(color.rgb,.5);
    vColor =  vec4(0.8471, 0.3059, 0.4392, 1.0)*vec4(0) + c;
    // gl_Position = vec4((projectionMatrix * translationMatrix * vec3(pos * (1./u_fontInfoSize), 1.0)).xy, 0.0, 1.0);

    // gl_Position = vec4((projectionMatrix * translationMatrix * vec3(pos * (64.0/u_fontInfoSize), 1.0)).xy, 0.0, 1.0);
    gl_Position = position;//projection * view * model * position;
    gl_PointSize = 5.0;

}
