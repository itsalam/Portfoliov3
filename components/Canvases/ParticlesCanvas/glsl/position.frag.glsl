precision highp float;
uniform sampler2D particles;
uniform sampler2D velocity;
varying vec2 vUv;
uniform float time;

const float PI = 3.14159265359;
const float EPI = 0.05;
const float STEP = 100.0;
const float FLUID_STEP = 1.0;
const float SPEED = 0.01;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise4(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

float snoise3(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 deltaNoise3D(float x, float y, float z, float t) {
  //Find rate of change in X plane
  float n1 = snoise4(vec4(x + EPI, y, z, t));
  float n2 = snoise4(vec4(x - EPI, y, z, t));
  //Average to find approximate derivative
  float a = (n1 - n2) / (2.0 * EPI);

  //Find rate of change in Y plane
  n1 = snoise4(vec4(x, y + EPI, z, t));
  n2 = snoise4(vec4(x, y - EPI, z, t));
  //Average to find approximate derivative
  float b = (n1 - n2) / (2.0 * EPI);

  //Find rate of change in Z plane
  n1 = snoise4(vec4(x, y, z + EPI, t));
  n2 = snoise4(vec4(x, y, z - EPI, t));
  //Average to find approximate derivative
  float c = (n1 - n2) / (2.0 * EPI);
  return vec3(a, b, c);
}

vec3 computeCurl(float x, float y, float z, float t){
  vec3 p0 = normalize(deltaNoise3D(x/ STEP, y/STEP, z/STEP, t));

  vec3 p1 = normalize(deltaNoise3D((x + 10.5)/STEP, (y + 10.5)/STEP, (z + 10.5)/STEP, t));

  return normalize(cross(p0, p1));
}

vec3 computeFlow(float x, float y, float z, float t) {
  vec3 pos0 = vec3((x) * FLUID_STEP,(y) * FLUID_STEP,(z) * FLUID_STEP);
  float x1 = snoise3(vec3(pos0.y, pos0.z, t));
  float y1 = snoise3(vec3(pos0.x, pos0.z, t));
  float z1 = snoise3(vec3(pos0.x, pos0.y, t));
  return vec3(
    cos(z1 * PI) + cos(y1 * PI),
    sin(z1 * PI) + cos(x1 * PI),
    sin(y1 * PI) - sin(x1 * PI)
  );
}

// void main(){
//     vec2 adjustedUv = (vUv - 0.5) * 2.0;
//     float t = time * SPEED;
//     vec3 flow = computeFlow(adjustedUv.x, adjustedUv.y, 0.0, t) * snoise3(vec3(adjustedUv.y, adjustedUv.x, t*10.0));
//     // vec3 curl = computeCurl(adjustedUv.x, adjustedUv.y, 0.0, t)  * snoise3(vec3(adjustedUv.x, adjustedUv.y, t));
//     // Calculate the position relative to the center
//     vec2 pos = adjustedUv - center;
//     vec2 circle = pos ;
//     float d = step(length(circle), scale);
//     d *= d;
//     flow.x += 0.25;
//     vec3 forces = (flow)/150.0;
//     gl_FragColor = vec4(force*d + forces.xy, 0, 1);
// }

void main() {
    float t = time * SPEED;
    vec4 pos = texture2D(particles, vUv).xyzw; // basic simulation: displays the particles in place.
    if (pos.x > 0.95 || pos.y > 0.95 || pos.x < -0.95 || pos.y < -0.95){
        pos.y = rand(pos.xy) * 1.8 -0.95;
        pos.x = -0.9 + rand(pos.xz) * 0.1;
        pos.z = rand(pos.yz) * 1.8 -0.95;
        pos.w = 1.0;
    }
    vec2 adjustedUv = (vUv - 0.5) * 2.0;
    vec3 flow = computeFlow(pos.x, pos.y, pos.z, t) * snoise3(vec3(pos.x, pos.y, t*10.0));
    vec3 curl = computeCurl(pos.x, pos.y, pos.z, t)  * snoise3(vec3(pos.z, pos.z, t));
    
    flow.x += 0.25;
    vec3 forces = (flow + curl*2.0)/850.0;
    pos.xyz += texture2D(velocity, (pos.xy + 1.0)/2.0).xyz * 0.01; // basic simulation: moves the particles.
    gl_FragColor = vec4(pos.xyz + forces, pos.w);
}
         