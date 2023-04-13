// play with these parameters to custimize the effect
// ==================================================

uniform vec3 resolution;
uniform float u_time;

uniform sampler2D tDiffuse;
//speed
uniform float speed;
uniform float speed_x;
uniform float speed_y;


// refraction
uniform float emboss;
uniform float intensity;
uniform int steps;
uniform float frequency;
uniform int angle; // better when a prime

// reflection
uniform float delta;
uniform float gain;

// ===================================================


float col(vec2 coord,float time)
{
  float delta_theta = 2.0 * PI / float(angle);
  float col = 0.0;
  float theta = 0.0;
  for (int i = 0; i < steps; i++)
  {
    vec2 adjc = coord;
    theta = delta_theta*float(i);
    float adjTime= time/1000.;
    adjc.x += cos(theta)*adjTime*speed + adjTime * speed_x;
    adjc.y -= sin(theta)*adjTime*speed - adjTime * speed_y;
    col = col + cos( (adjc.x*cos(theta) - adjc.y*sin(theta))*frequency)*intensity;
  }
  return cos(col);
}

void mainUv(inout vec2 uv){
    float time = u_time*1.3;

    vec2 p = (uv.xy) , c1 = p, c2 = p;
    float cc1 = col(c1,time);

    c2.x += p.x/delta;
    float dx = emboss*(cc1-col(c2,time))/delta;

    c2.x = p.x;
    c2.y += p.y/delta;
    float dy = emboss*(cc1-col(c2,time))/delta;

    c1.x += dx*2.;
    c1.y = -(c1.y+dy*2.);

    float alpha = 1.+dot(dx,dy)*gain;
        
    uv = mix(uv, c1, .25);
}