precision highp float;

attribute vec3 position;
attribute vec2 uv;
uniform vec2 center;
uniform float scale;
uniform vec2 px;
uniform float time;
varying vec2 vUv;

// void main(){
//     vec2 pos = position.xy * scale * 2.0 * px + center;
//     vUv = uv;
//     gl_Position = vec4(pos, 0.0, 1.0);
// }

void main(){
    vec2 pos = position.xy * 2.0;
    vUv = uv;
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}