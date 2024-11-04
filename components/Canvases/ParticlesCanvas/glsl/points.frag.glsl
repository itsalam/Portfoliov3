precision highp float;

uniform sampler2D positions;
uniform float uOpacity;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uChromaOffset;      // Add this as a uniform
varying float vDistance;
varying float vPointSize;
varying vec3 vPos;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float dist = dot(cxy, cxy);
    if (dist > 1.0) discard;
    float chromaAngle = uTime * 0.1;
    vec2 chromaDir = vec2(cos(chromaAngle), sin(chromaAngle)) * uChromaOffset;
    vec3 color;
    color.r = texture2D(positions, vPos.xy + chromaDir * vec2(1, 0)).r;  // Red channel offset
    color.g = texture2D(positions, vPos.xy).g;  // Green channel central
    color.b = texture2D(positions, vPos.xy - chromaDir * vec2(1, 0)).b;  // Blue channel offset
    float alpha = mix(0.6, 1.0, clamp(vDistance, -3.0 , 3.0));
    alpha *= mix((1.0-dist) * 0.1, 1.0, smoothstep(0.0, 1.0, 4.0-vPointSize)); // Points smaller than 5.0 have a fixed opacity 
    alpha *= clamp(uTime * 0.08, 0.0, 1.0);
    alpha *= 1.0 - smoothstep(0.2, 0.9, vPointSize / 150.0);
    gl_FragColor = vec4(mix(uAccent, uColor, 1.75-smoothstep(0.0, 0.1, vPointSize/150.0)), alpha);
}

