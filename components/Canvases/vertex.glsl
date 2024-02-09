uniform float u_time;

varying vec3 v_Position;


void main() {
  // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  v_Position = position;
  v_Position.y += sin(v_Position.x + u_time * 1.0) * 0.2;
  v_Position.z += sin(v_Position.y + u_time * 1.0) * 0.2;
  
  // // Uncomment the code and hit the refresh button below for a more complex effect 🪄

  // vec4 viewPosition = viewMatrix * modelPosition;
  // vec4 projectedPosition = projectionMatrix * viewPosition;

  // return projectedPosition.xyz * 0.2;?

  return position;

}


    // void main() {
    //   v_Position = position;
    //   return position * 2.;