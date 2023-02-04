
varying vec3 vUv;
uniform vec2 mouse;
uniform vec3 scaling;

void main(){
    vUv= vec3(position * scaling);
    
    vec4 modelViewPosition=modelViewMatrix*vec4(position,1.);
    gl_Position=projectionMatrix*modelViewPosition;
}
