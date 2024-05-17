uniform sampler2D positions;
uniform float uTime;
uniform float uFocus;
uniform float uBlur;
uniform float uParticleLength;
uniform vec2 uFboSize;
varying float vDistance;
varying float vPointSize;
varying float vSpeed;
varying vec3 vPos;

void main() { 
  vPos = position;
  vec4 pos = texture2D(positions, position.xy);
  if(pos.w == 0.0) return;
  vec2 ratio = vec2(max(uFboSize.x, uFboSize.y) / uFboSize.x, max(uFboSize.x, uFboSize.y) / uFboSize.y);
  vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_Position.xy /= ratio;
  vDistance = uFocus + sin(uTime * 0.1)*0.5 + mvPosition.z*2.0;  
  vPointSize = min(abs((mvPosition.z) + -(length(position.xy) * 3.0) + uFocus) * uBlur, 200.0) * (0.4 + 0.6 * sin(position.x * position.y));
  gl_PointSize = vPointSize;
}