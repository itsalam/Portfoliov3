
#define NUM_OCTAVES 6
#define SPEED 1

uniform vec3 resolution;
uniform float time;
uniform float alpha;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform int multiply;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

const float shifts[6] = float[6](.02, .03, .01, .04, .01, .0);

float noise ( in vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float a = random(p+vec2(0,0));
	float b = random(p+vec2(1,0));
	float c = random(p+vec2(0,1));
	float d = random(p+vec2(1,1));
    return mix(mix( a, b,f.x), mix( c, d,f.x),f.y);
}


float fbm(vec2 x, float a, float b, int octaves) {
    float v = 0.0;
    float epoch = 0.5;
    // Rotate to reduce axial bias
    mat2 rot = mat2( 0.80,  0.60, -0.60,  0.80);
    for (int i = 0; i < octaves; ++i) {
        v += epoch * (a + b*noise(x));
        x *= rot;
        x *= (2.0 + shifts[i]);
        epoch *= 0.5;
    }
    return v/1.-epoch;
}

float fbm(vec2 x, int octaves) {
    return fbm(x, 0., 1., octaves);
}

float fbm(vec2 x) {
    return fbm(x, NUM_OCTAVES);
}

float fbm(vec3 p){
    return fbm(p.xy);
}

vec2 fbm_2(vec2 p, vec2 w, int octaves) {
    float x = fbm(p + w.x, octaves);
    float y = fbm(p + w.y, octaves);
    return vec2(x, y);
}

vec2 fbm_2(vec2 p, vec2 w, float a, float b, int octaves) {
    float x = fbm(p + vec2(w.x), a, b, octaves);
    float y = fbm(p + vec2(w.y), a, b, octaves);
    return vec2(x, y);
}


float pattern_pt2(vec2 q, out vec2 o, out vec2 n){
    //Random numbers in the FBM functions dont really do anything but change up each FBM result,
    //what matters is the number of passes through the FBM is in the end result, here we have three passes,
    // which is f(p) = fbm(p+fbm(p+fbm(p)))
    q += 0.05*sin(vec2(0.05)*time);
    q *= 0.7 + 0.2*cos(0.005*time);
    o = 0.5 + 0.5*fbm_2( q, vec2(1., 6.2), -1., 2., 4 );
    o += .02*sin(vec2(.13, .11)*time);
    n = fbm_2( 5.0*o, vec2(9.2, 5.7), 6);
    n *= .85 + 0.10*cos(time * 0.2);
    vec2 p = q + n*4.;
    float f = 0.75 + 0.25*fbm(2.0*p, -1., 2., 6);
    // Multiply the point to darken, 
    f = mix( f, f*f*f*3.5, f*n.y );
    // Add more troughs based on p, which is the most detailed fbm iteration
    f *= 1.0-0.2*pow( 0.6+0.6*cos(2.0*n.x)*cos(2.0*n.y), 12.0 );
    f += 0.6*pow( 0.4+0.4*sin(2.0*p.x)*sin(2.0*p.y), 2.0 );
    return f;
}

float pattern_pt2(in vec2 q)
{
    vec2 o, n;
    return pattern_pt2(q, o, n);
}

// Domain Warpping Pt.2
vec4 noise_func(vec3 p){
    // pixel coordinates
    // vec2 of = vec2(float(mi),float(ni)) / float(AA) - 0.5;
    // vec2 q = (5.0*p.xy-resolution.xy)/resolution.y;
    vec2 q = (p.xy) * alpha * resolution.xy/resolution.y ;

    vec2 o, n;

    float f = pattern_pt2(q, o, n);

    // General tint of Shader 
    vec3 color = color1;
    // Add secondary color to second pass of FBM, about 50% of area should randomly recieve this color moreso than others 
    color = mix( color, color2, dot(n,n) );
    // Add tertiary color to the first pass, at a reduced level, should be in the areas where f is slightly higher than average
    color = mix( color, color3, 0.5*dot(o.y,o.y) );
    // Apply a color directly to where the second FBM pass has high values, similar to the first color pass, but the smooth
    // step function removes the color at a specific threshold
    color = mix( color, color4, 0.7*smoothstep(0.5,1.75,abs(n.y)+abs(n.x)) );

    color *= f*f*f*f;
    for (int i = 0; i < multiply; ++i){
        color *= color;
    }
    
    float height = max(max(color.x,color.y), color.z)/3.;
    height /= 3.;
    height = min(height, .75);
    height /= 5.;
    height += 0.5;
    return vec4(color, height);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = noise_func(vec3(uv, 0.5));;
}