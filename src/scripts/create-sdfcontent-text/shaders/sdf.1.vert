attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute float aVertexSize;
attribute vec4 aVertexColor;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
uniform float u_fontInfoSize;

varying vec2 vTextureCoord;


// attribute vec4 position;
// uniform mat4 projection;
// uniform mat4 view;
// uniform mat4 model;

varying float vScale;
varying vec4 vColor;
varying float vSize;

void main(void)
{
    vTextureCoord = aTextureCoord;
    float scale = aVertexSize;//1.5;
    vec2 pos = aVertexPosition;
    vScale = aVertexSize;
    vColor = aVertexColor;//vec4(aVertexColor.rgb,0.3);
    vSize = aVertexSize;
    // vColor = vec4(0.0,1.0,1.0,0.0);
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(pos * (1./u_fontInfoSize), 1.0)).xy, 0.0, 1.0);

    // gl_Position = vec4((projectionMatrix * translationMatrix * vec3(pos * (64.0/u_fontInfoSize), 1.0)).xy, 0.0, 1.0);
}
