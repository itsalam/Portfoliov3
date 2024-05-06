precision highp float;

uniform vec2 center;
uniform vec2 oldCenter;
uniform float scale;
uniform vec2 px;
uniform float time;
uniform float factor;
varying vec2 vUv;

const float SPEED = 0.01;

void main(){
    if (oldCenter.x <= -1.0) discard;
    vec2 adjustedUv = (vUv - 0.5) * 2.0;
    float t = time * SPEED;
    vec2 force = center-oldCenter;

    vec2 direction = normalize(force);  // Direction from old center to new center
    vec2 toPoint = adjustedUv - oldCenter;           // Vector from old center to current fragment
    float alongLine = dot(toPoint, direction);       // Projection along the line
    vec2 closestPoint = oldCenter + direction * alongLine;  // Closest point on the line to the fragment
    vec2 forceDirection = adjustedUv - closestPoint;  // Vector from closest point to fragment
    // Calculate perpendicular distance to line
    vec2 perpDir = vec2(-direction.y, direction.x);  // Perpendicular to the direction
    float distToLine = abs(dot(toPoint, perpDir));
    float lineStart = -scale;                        // Extend line start backward by scale
    float lineEnd = length(force) + scale;  // Extend line end forward by scale
    // float lineLimit = step(lineStart, alongLine) * step(alongLine, lineEnd) * step(0.0, scale-distance(adjustedUv,closestPoint));
    float lineLimit = step(lineStart, alongLine) * step(alongLine, lineEnd) * step(0.0, scale-length(forceDirection));
    float magnitude = clamp(alongLine/length(force), 0.0, 1.0) * (1.0-distToLine/scale) * lineLimit;

    gl_FragColor = vec4(normalize(adjustedUv-center)*magnitude*factor, 0, 1);
}