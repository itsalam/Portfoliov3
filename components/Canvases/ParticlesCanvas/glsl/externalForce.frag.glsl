precision highp float;

uniform vec2 force;
uniform vec2 center;
uniform float scale;
uniform vec2 px;
uniform float time;
varying vec2 vUv;

const float SPEED = 0.01;

void main(){
    vec2 adjustedUv = (vUv - 0.5) * 2.0;
    float t = time * SPEED;
    // vec3 flow = computeFlow(adjustedUv.x, adjustedUv.y, 0.0, t) * snoise3(vec3(adjustedUv.y, adjustedUv.x, t*10.0));
    // vec3 curl = computeCurl(adjustedUv.x, adjustedUv.y, 0.0, t)  * snoise3(vec3(adjustedUv.x, adjustedUv.y, t));
    // Calculate the position relative to the center
    vec2 pos = adjustedUv - center;
    vec2 circle = pos;
    float d = step(length(circle), scale);
    d *= d;
    // flow.x += 0.25;
    // vec3 forces = (flow)/150.0;
    gl_FragColor = vec4(force*d, 0, 1);
}