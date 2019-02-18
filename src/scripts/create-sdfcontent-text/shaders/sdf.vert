attribute vec3 color;
attribute vec2 coord;
attribute float size;
attribute vec4 position;




varying vec2 vCoord;
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

    vCoord = coord;
    // float scale = aVertexSize;//1.5;
    // vec2 pos = aVertexPosition;
    vScale = size;
    vSize = size;
    vColor = vec4(color.rgb,1.0);
    // gl_Position = vec4((projectionMatrix * translationMatrix * vec3(pos * (1./u_fontInfoSize), 1.0)).xy, 0.0, 1.0);

    // gl_Position = vec4((projectionMatrix * translationMatrix * vec3(pos * (64.0/u_fontInfoSize), 1.0)).xy, 0.0, 1.0);
    // gl_Position = position*vec4(1,-1,1,1);//projection * view * model * position;
    gl_Position =   model * position;// * vec4(1,-1,1,1);
    // gl_Position = projection * view * model * position;
    gl_PointSize = 5.0;

}
