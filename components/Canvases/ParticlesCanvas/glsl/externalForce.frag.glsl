precision highp float;

uniform vec2 center;
uniform vec2 oldCenter;
uniform float scale;
uniform vec2 px;
uniform float time;
uniform float factor;
varying vec2 vUv;

const float SPEED = 0.01;

void main() {
    vec2 force = center - oldCenter;

    // Handle invalid center or oldCenter
    if (oldCenter.x < -1.0 || center.x < -1.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec2 adjustedUv = (vUv - 0.5) * 2.0;
    float t = time * SPEED;
    vec2 direction = (force == vec2(0.0)) ? vec2(0.0) : normalize(force);
    vec2 toPoint = adjustedUv - oldCenter;
    float alongLine = dot(toPoint, direction);
    vec2 closestPoint = oldCenter + direction * alongLine;
    vec2 forceDirection = adjustedUv - closestPoint;
    vec2 perpDir = vec2(-direction.y, direction.x);
    float distToLine = abs(dot(toPoint, perpDir));

    float forceLength = max(0.001, length(force));
    if (forceLength == 0.0) forceLength = .1;
    float lineStart = -scale;
    float lineEnd = forceLength + scale;
    float lineLimit = (1.0-step(lineEnd, length(toPoint)));
    
    float magnitude = clamp(alongLine / abs(forceLength), 0.0, 5.0) * (1.0/max(0.001, length(forceDirection)) * scale) * lineLimit;

    // Avoid NaNs in the final color
    vec2 normalizedUv = normalize(toPoint);
    gl_FragColor = vec4(normalizedUv * magnitude * factor, 0, 1);
}
