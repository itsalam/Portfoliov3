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
    vec2 force = center - oldCenter;
    if (length(force) < 0.01 || oldCenter.x < -1.0 || center.x < -1.0 ) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec2 adjustedUv = (vUv - 0.5) * 2.0;
    float t = time * SPEED;
    vec2 direction = force == vec2(0.0) ? vec2(0.0) : normalize(force);
    vec2 toPoint = adjustedUv - oldCenter;
    float alongLine = dot(toPoint, direction);
    vec2 closestPoint = oldCenter + direction * alongLine;
    vec2 forceDirection = adjustedUv - closestPoint;
    vec2 perpDir = vec2(-direction.y, direction.x);
    float distToLine = abs(dot(toPoint, perpDir));
    float lineStart = -scale;
    float lineEnd = length(force) + scale;
    float lineLimit = step(lineStart, alongLine) * step(alongLine, lineEnd) * step(0.0, scale - length(forceDirection));
    float forceLength = length(force);
    if (forceLength == 0.0) forceLength = 1.0;  // Avoid division by zero
    float magnitude = clamp(alongLine / forceLength, 0.0, 1.0) * (1.0 - distToLine / scale) * lineLimit;

    gl_FragColor = vec4(normalize(adjustedUv - center) * magnitude * factor, 0, 1);
}