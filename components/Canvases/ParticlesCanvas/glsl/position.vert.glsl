precision highp float;
uniform sampler2D particles;
varying vec2 vUv;
varying vec2 vProjectedTexCoord; 

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}