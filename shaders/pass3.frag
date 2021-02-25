// Pass 3 fragment shader
//
// Output fragment colour based using
//    (a) Cel shaded diffuse surface
//    (b) wide silhouette in black

#version 300 es

uniform mediump vec3 lightDir;     // direction toward the light in the VCS
uniform mediump vec2 texCoordInc;  // texture coord difference between adjacent texels
in mediump vec2 texCoords;         // texture coordinates at this fragment

// The following four textures are now available and can be sampled using 'texCoords'
uniform sampler2D colourSampler;
uniform sampler2D normalSampler;
uniform sampler2D depthSampler;
uniform sampler2D laplacianSampler;

out mediump vec4 outputColour;          // the output fragment colour as RGBA with A=1

void main()
{
  // REMOVE THIS ... It's just here because MacOS complains otherwise
  mediump vec2 dummy = texCoords;  

  // [0 marks] 
  // Look up values for the depth and Laplacian.  
  // Use only the R component of the texture as texture( ... ).r
  // YOUR CODE HERE
  mediump float depth     = texture( depthSampler,     vec2( texCoords.x, texCoords.y ) ).r;
  mediump float laplacian = texture( laplacianSampler, vec2( texCoords.x, texCoords.y ) ).r;

  // [1 mark] 
  // Discard the fragment if it is a background pixel not near the silhouette of the object.
  // YOUR CODE HERE
  // THE DISCARDMENT OF FRAGMENT OCCURS AFTER WE FIND THE DISTANCE TO THE CLOSEST SILHOUETTE FRAGMENT IN THE NEIGHBOURHOOD
  
  // [0 marks] 
  // Look up value for the colour and normal.  
  // Use the RGB components of the texture as texture( ... ).rgb or texture( ... ).xyz.
  // YOUR CODE HERE
  mediump vec3 colour = texture( colourSampler, vec2( texCoords.x, texCoords.y ) ).rgb;
  mediump vec3 normal = texture( normalSampler, vec2( texCoords.x, texCoords.y ) ).rgb;

  // [2 marks]
  // Compute Cel shading, in which the diffusely shaded colour is quantized into NumQuanta possible values.
  // Do not allow the diffuse component, N dot L, to be below 0.2.  
  // That will provide some ambient shading.  
  // Your code should use the 'numQuanta' below to have that many divisions of quanta of colour.  
  // Do not use '3' in your code; use 'numQuanta'.  
  // Your code should be very efficient.

  const int numQuanta = 3;
  // YOUR CODE HERE
  mediump float diffComp = dot( normalize(normal), lightDir ); // NdotL
  mediump float segSize = 1.0/numQuanta;
  
  // find what of the numQuanta classifications the diffuse component will fall within
  for (int i = 0; i < numQuanta; i++) { 
    
    if (( diffComp > ( i * segSize )) && ( diffComp <= ( (i+1) * segSize ))){
      
      outputColour = ( (i+1) * segSize ) *  vec4( colour, 1 );
      break;
    
    } 
  }
  // If the diffuse component is less than .2 and segSize is greater than .2 make the output colour segSize of the original colour
  if( (diffComp <= 0.2) && (segSize >= 0.2) ){
    outputColour = segSize * vec4( colour, 1.0 );
  }
  // if the diffuse component AND segSize is les than .2 make the output colour 0.2 of the original colour
  else if ( (diffComp <= 0.2) && (segSize <= 0.2) ){
    outputColour = 0.2 * vec4( colour, 1 );
  }


  // [2 marks] 
  // Look at the fragments in the kernelRadius x kernelRadius neighbourhood of this fragment.  
  // Your code should use the 'kernelRadius' below and check all fragments in the range
  //
  //    [-kernelRadius,+kernelRadius] x [-kernelRadius,+kernelRadius]
  //
  // around this fragment.
  //
  // Find the neighbouring fragments with a Laplacian beyond some threshold.  
  // Of those fragments, find the distance to the closest one.  
  // That distance, divided by the maximum possible distance inside the kernel, is the blending factor.
  //
  // You can use a large kernelRadius here (e.g. 10) to see that blending is being done correctly.  
  // Do not use '3.0' or '-0.1' in your code; use 'kernelRadius' and 'threshold'.

  const mediump float kernelRadius = 3.0;
  const mediump float threshold = -0.1;
  // YOUR CODE HERE
  
  // We need to search a grid that is (2*KernelRadius)+1 x (2*KernelRadius)+1 
  mediump float neighbourhoodSize = ( 2 * kernelRadius ) + 1;
  
  // Changes that must be made to move in the X and Y directions
  mediump float deltaX = texCoordInc.x;
  mediump float deltaY = texCoordInc.y;

  // Coordinates of the top left fragment in the neighbourhood
  mediump float startX = texCoords.x - (kernelRadius*deltaX);
  mediump float startY = texCoords.y + (kernelRadius*deltaX);

  // Keep track of the closest fragment that has a laplacian 
  mediump float closestDist = neighbourhoodSize;
  //mediump float closestLapFragX = 0.0;
  //mediump float closestLapFragY = 0.0;

  mediump float laplacianVal = 0;
  mediump float currDist = 0;
  // Loop to find the fragment that has a laplacian less than the threshold and is closest to the current fragment in the neighbourhood
  // If there is no fragment in the neighbourhood that has a laplacian less than the threshold,
  // closestDist will still be equal to neighbourhoodSize as the distance to an edge pixel IF found will be much less than neighbourhoodSize
  for( float y = startY; y > startY - (neighbourhoodSize * deltaY); y -= deltaY){    // Cycle through the rows
    for( float x = startX; x < startX + (neighbourhoodSize * deltaX); x += deltaX){  // Cycle through each column in that row
      
      laplacianVal = texture( laplacianSampler, vec2( x, y ) ).r;
      
      if(laplacianVal < threshold){ 
        // We have found one of our silhouette fragments NOW Find the distance to it
        currDist = sqrt( ((x-texCoords.x) * (x-texCoords.x)) + ((y-texCoords.y) * (y-texCoords.y)) );

        if(currDist < closestDist){ // if the distance to this silhouette fragment is less than any distance seen before: keep track of this fragment

          closestDist = currDist;
          //closestLapFragX = x;
          //closestLapFragY = y;

        }
      }
    }
  }

  mediump float maxDistance = sqrt( ((kernelRadius*texCoordInc.x)*(kernelRadius*texCoordInc.x)) +
                                    ((kernelRadius*texCoordInc.y)*(kernelRadius*texCoordInc.y)) ); 

  mediump float blendFactor = closestDist / maxDistance;

  // now that we have found the distance to a silhouette pixel we can check to see how far it is.
  // IF the Depth of the pixel is 1 at texCoords AND closestDist is greater than 2 texture increments away we can discard the pixel
  if ( (depth == 1) && ((closestDist > (texCoordInc.x)) || (closestDist > (texCoordInc.y))) ){
    discard;
  }

  // [1 mark] 
  // Output the fragment colour.  
  // If there is an edge fragment in the kernelRadius x kernelRadius neighbourhood of this fragment, 
  // output a grey colour based on the blending factor.  
  // The grey should be completely black for an edge fragment, and should blend to the
  // Phong colour as distance from the edge increases.  
  // If these is no edge in the neighbourhood, output the cel-shaded colour.  
  // YOUR CODE HERE
  mediump vec3 grayColour = blendFactor * vec3(1.0);

  if(closestDist == neighbourhoodSize){
    // No edge fragment was found in the neighbourhood search so we output the original colour that the pixel is to be
    outputColour = outputColour;
  }
  else if(laplacian < threshold){ // The current fragment IS an edge fragment so output black
    outputColour = vec4(0,0,0,1);
  }
  else{ // an edge fragment was found in the neighbourhood search so apply a scaling based on distance
    outputColour = outputColour * vec4(grayColour,1.0);
  }
  //outputColour = vec4( 1.0, 0.0, 1.0, 1.0 );
}
