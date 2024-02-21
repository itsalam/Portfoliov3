uniform float time;
uniform float delta;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec4 tmpVel = texture2D(textureVelocity, uv);
  vec2 position = tmpPos.xy;
  vec2 tmpVelDir = normalize(tmpVel.xy);

  position.x += tmpVel.x;
  position.y += tmpVel.y;


  gl_FragColor = vec4(position, 0, 1);
}