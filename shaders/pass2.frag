// Pass 2 fragment shader
//
// Outputs the Laplacian, computed from depth buffer

#version 300 es
// texCoordInc = the x and y differences, in texture coordinates, between one texel and the next.  
// For a window that is 400x300, for example, texCoordInc would be (1/400,1/300).
uniform mediump vec2 texCoordInc;

// texCoords = the texture coordinates at this fragment
in mediump vec2 texCoords;

// depthSampler = texture sampler for the depths.
uniform mediump sampler2D depthSampler;

// fragLaplacian = an RGB value that is output from this shader.  
// All three components should be identical.  
// This RGB value will be stored in the Laplacian texture.
layout (location = 0) out mediump vec3 fragLaplacian;

void main()
{
  mediump vec2 dummy = texCoords;
  
  // YOUR CODE HERE.  

  // You will have to compute the Laplacian by evaluating a 3x3 filter kernel at the current texture coordinates.
  // The Laplacian weights of the 3x3 kernel are:
  //      -1  -1  -1       TL  TM  TR
  //      -1   8  -1   =   ML  MM  MR
  //      -1  -1  -1       BL  BM  BR
  // Store a signed value for the Laplacian; do not take its absolute value.
  
  // texture increment values
  float deltaX = texCoordInc.x;
  float deltaY = texCoordInc.y;

  // Laplacian Sum for our fragment
  float lapSum = 0.0; 
  
  // TOP ROW
  mediump float TLDepth = (texture( depthSampler, vec2( texCoords.x - deltaX, texCoords.y + deltaY ) ).rgb).z;
  mediump float TMDepth = (texture( depthSampler, vec2( texCoords.x,          texCoords.y + deltaY ) ).rgb).z;
  mediump float TRDepth = (texture( depthSampler, vec2( texCoords.x + deltaX, texCoords.y + deltaY ) ).rgb).z;
  
  // MIDDLE ROW
  mediump float MLDepth = (texture( depthSampler, vec2( texCoords.x - deltaX,          texCoords.y ) ).rgb).z;
  mediump float MMDepth = (texture( depthSampler, vec2( texCoords.x,                   texCoords.y ) ).rgb).z;
  mediump float MRDepth = (texture( depthSampler, vec2( texCoords.x + deltaX,          texCoords.y ) ).rgb).z;
  
  // BOTTOM ROW
  mediump float BLDepth = (texture( depthSampler, vec2( texCoords.x - deltaX, texCoords.y - deltaY ) ).rgb).z;
  mediump float BMDepth = (texture( depthSampler, vec2( texCoords.x,          texCoords.y - deltaY ) ).rgb).z;
  mediump float BRDepth = (texture( depthSampler, vec2( texCoords.x + deltaX, texCoords.y - deltaY ) ).rgb).z;

  lapSum =  (-1 * TLDepth) + (-1 * TMDepth) + (-1 * TRDepth) +
            (-1 * MLDepth) +  (8 * MMDepth) + (-1 * MRDepth) +
            (-1 * BLDepth) + (-1 * BMDepth) + (-1 * BRDepth) ;

  fragLaplacian = vec3( lapSum );
}


