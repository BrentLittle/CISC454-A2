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

  // Laplacian Summation
  float lapSum = 0.0;
  
  //float startX = texCoords.x - deltaX;
  //float startY = texCoords.y + deltaY;

  
  /*
  for (int i = 0; i < 3; i++) {     // rows 
    for (int j = 0; j < 3; j++) {   // cols
      if( (i == 1) && (j == 1) )
      {
        lapSum += 8 *
      }
      
    }
  }
  */

  // TOP ROW
  mediump vec2 TL = vec2( texCoords.x - deltaX, texCoords.y + deltaY );
  mediump vec2 TM = vec2( texCoords.x,          texCoords.y + deltaY );
  mediump vec2 TR = vec2( texCoords.x + deltaX, texCoords.y + deltaY );
  
  // MIDDLE ROW
  mediump vec2 ML = vec2( texCoords.x - deltaX, texCoords.y );
  mediump vec2 MM = vec2( texCoords.x,          texCoords.y );
  mediump vec2 MR = vec2( texCoords.x + deltaX, texCoords.y );
  
  // BOTTOM ROW
  mediump vec2 BL = vec2( texCoords.x - deltaX, texCoords.y - deltaY );
  mediump vec2 BM = vec2( texCoords.x,          texCoords.y - deltaY );
  mediump vec2 BR = vec2( texCoords.x + deltaX, texCoords.y - deltaY );


  mediump vec3 TLColour = texture( depthSampler, TL ).rgb;
  mediump vec3 TMColour = texture( depthSampler, TM ).rgb;
  mediump vec3 TRColour = texture( depthSampler, TR ).rgb;
  mediump vec3 MLColour = texture( depthSampler, ML ).rgb;
  mediump vec3 MMColour = texture( depthSampler, MM ).rgb;
  mediump vec3 MRColour = texture( depthSampler, MR ).rgb;
  mediump vec3 BLColour = texture( depthSampler, BL ).rgb;
  mediump vec3 BMColour = texture( depthSampler, BM ).rgb;
  mediump vec3 BRColour = texture( depthSampler, BL ).rgb;

  lapSum =  -1 * TLColour.z +
            -1 * TMColour.z +
            -1 * TRColour.z +
            -1 * MLColour.z +
            8 * MMColour.z +
            -1 * MRColour.z +
            -1 * BLColour.z +
            -1 * BMColour.z +
            -1 * BRColour.z ;            

  fragLaplacian = vec3( 1.0, 1.0, 1.0 );
}
