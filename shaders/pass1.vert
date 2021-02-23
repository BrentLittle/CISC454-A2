// Pass 1 vertex shader
//
// Stores colour, normal, depth

#version 300 es

uniform mat4 M;
uniform mat4 MV;
uniform mat4 MVP;

layout (location = 0) in mediump vec3 vertPosition;
layout (location = 1) in mediump vec3 vertNormal;
layout (location = 2) in mediump vec3 vertTexCoord;

// Your shader should compute the 
//    colour 
//    normal (in the VCS)
//    depth (in the range [0,1] with 0 = near and 1 = far) 
// and store these values in the corresponding variables.

out mediump vec3 colour;
out mediump vec3 normal;
out mediump float depth;

void main()

{
  // calc vertex position in CCS (always required)

  gl_Position = MVP * vec4( vertPosition, 1.0 );

  // Provide a colour 
  // YOUR CODE HERE
  colour = vec3( 0.33, 0.42, 0.18 ); 
  //colour = vec3( 1, 0.0, 0.0 );         

  // calculate normal in VCS
  // YOUR CODE HERE
  // To move the vertNormal into VCS we must apply the MV matrix to the normal.
  normal = vec3( MV * vec4( vertNormal, 0.0 ) );         

  // Calculate the depth in [0,1]
  // YOUR CODE HERE
  
  // We must divide out the last coordinate of our VCS position to get our point in NDCS. 
  // this gives us points between -1 and +1
  float NDCSZposition = (gl_Position.z / gl_Position.w);
  // to convert the depth (z'/w' coord) from the [-1, +1] range to [0,1] we must add 1 then divide by 2
  depth = 0.5 * ( NDCSZposition + 1 );                  
}
