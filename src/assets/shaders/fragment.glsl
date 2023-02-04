#define NUM_OCTAVES 3
#define SPEED 1

uniform float time;
uniform vec2 mouse;

uniform vec3[200] points;

uniform sampler2D videoTexture;
uniform float topOffset;

varying vec3 vUv;

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float draw_circle(vec2 coord, float radius) {
    return step(length(coord), radius);
}

void main(void)
{
    float MAX_DISTANCE = .2;
    int DURATION_MS = 5000;
    float INITIAL_STRENGTH = 1.0;
    
    vec2 uv = vec2(vUv) + vec2(.5, .5);
    int int_time = int(time) ;
    float progress = cos(time);
    
    vec2 mouse = mouse;
    float dist = distance(uv, mouse);

    float strength = INITIAL_STRENGTH-smoothstep(0.0, 1.0, min(dist/MAX_DISTANCE, INITIAL_STRENGTH));
    
    vec2 surface = strength* vec2(
        mix(.2, .5, fbm( 20.*uv +.05 *time)),
        mix(.2, .5, fbm( 20.*uv +.05 *time))
    );
    
    uv += refract(vec2(0.0,0.0), surface, 1.0/1.33);
    
    vec4 color = texture2D(videoTexture, uv);
    gl_FragColor = color;
}

