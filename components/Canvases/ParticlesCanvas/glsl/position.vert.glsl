precision highp float;
uniform sampler2D particles;
varying vec2 vUv;
varying vec2 vProjectedTexCoord; 
varying mat4 vModelViewMatrix; 
varying mat4 vProjectionMatrix; 

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vUv = uv;

    vModelViewMatrix = modelViewMatrix;
    vProjectionMatrix = projectionMatrix;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}