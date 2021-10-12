import React, { useEffect, useMemo, useRef } from 'react';
import { useThree, Canvas } from '@react-three/fiber';
import MersenneTwist from 'mersenne-twister';
import { TorusKnot } from '@react-three/drei';
import Color from 'color';

/*
Create your Custom style to be turned into a EthBlock.art BlockStyle NFT

Basic rules:
 - use a minimum of 1 and a maximum of 4 "modifiers", modifiers are values between 0 and 1,
 - use a minimum of 1 and a maximum of 3 colors, the color "background" will be set at the canvas root
 - Use the block as source of entropy, no Math.random() allowed!
 - You can use a "shuffle bag" using data from the block as seed, a MersenneTwister library is provided

 Arguments:
  - block: the blockData, in this example template you are given 3 different blocks to experiment with variations, check App.js to learn more
  - mod[1-3]: template modifier arguments with arbitrary defaults to get your started
  - color: template color argument with arbitrary default to get you started

Getting started:
 - Write react-three-fiber code, consuming the block data and modifier arguments,
   make it cool and use no random() internally, component must be pure, output deterministic
 - Customize the list of arguments as you wish, given the rules listed below
 - Provide a set of initial /default values for the implemented arguments, your preset.
 - Think about easter eggs / rare attributes, display something different every 100 blocks? display something unique with 1% chance?

 - check out react-three-fiber documentation for examples!
*/

// Required style metadata
const styleMetadata = {
  name: '',
  description: '',
  image: '',
  creator_name: '',
  options: {
    mod1: 0.4,
    mod2: 0.1,
    mod3: 0.4,
    color1: '#fff000',
    background: '#000000',
  },
};

export { styleMetadata };

function Inner({
  block,
  attributesRef,

  mod1 = 0.75, // Example: replace any number in the code with mod1, mod2, or color values
  mod2 = 0.25,
  mod3 = 0.4,
  color1 = '#4f83f1',
  background = '#ccc',
}) {
  console.log(`rendering`);

  // Props

  //   const { mod1, mod2, mod3, color1 } = options;

  // Refs
  const shuffleBag = useRef();
  const group = useRef();
  const hoistedValue = useRef();

  // Three
  const { size, camera } = useThree();
  const { width, height } = size;

  // Update custom attributes related to style when the modifiers change
  useEffect(() => {
    console.log('updating attributes...');
    attributesRef.current = () => {
      return {
        // This is called when the final image is generated, when creator opens the Mint NFT modal.
        // should return an object structured following opensea/enjin metadata spec for attributes/properties
        // https://docs.opensea.io/docs/metadata-standards
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema

        attributes: [
          {
            display_type: 'number',
            trait_type: 'your trait here number',
            value: hoistedValue.current, // using the hoisted value from within the draw() method, stored in the ref.
          },

          {
            trait_type: 'your trait here text',
            value: 'replace me',
          },
        ],
      };
    };
  }, [hoistedValue, attributesRef]);

  // Handle correct scaling of scene as canvas is resized, and when generating upscaled version.
  useEffect(() => {
    console.log(`updating camera...`);
    let DEFAULT_SIZE = 500;
    let DIM = Math.min(width, height);
    let M = DIM / DEFAULT_SIZE;
    camera.zoom = M * 200;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  // Shuffle the random number bag when block changes
  const [color, scale, tori] = useMemo(() => {
    console.log(`shuffling...`);
    const { hash } = block;
    const seed = parseInt(hash.slice(0, 16), 16);
    shuffleBag.current = new MersenneTwist(seed);
    const color = Color([ran255(), ran255(), ran255()]).hex();
    const scale = shuffleBag.current.random() / 100;
    const tori = block.transactions.map((tx, i) => {
      const mul = 1.5;
      const flip = i % 2 ? -1 : 1;
      const flip2 = i % 3 ? -1 : 1;
      const flip3 = i % 4 ? -1 : 1;
      return [
        shuffleBag.current.random() * mul * flip,
        shuffleBag.current.random() * mul * flip2,
        shuffleBag.current.random() * mul * flip3,
      ];
    });

    function ran255() {
      return Math.floor(255 * shuffleBag.current.random());
    }

    hoistedValue.current = 42;
    return [color, scale, tori];
  }, [block]);

  // Render the scene
  return (
    <group ref={group} position={[-0, 0, 0]} rotation={[0, mod2, 0]}>
      <ambientLight intensity={1} color={color} />
      {tori.map((sp, index) => {
        return (
          <group key={index} position={sp}>
            <TorusKnot
              args={[scale * 100, mod1 / 10, (mod2 + 0.001) * 500, mod3 * 12]}
            >
              <meshNormalMaterial attach="material" />
            </TorusKnot>
          </group>
        );
      })}
    </group>
  );
}

const Outer = React.memo(({ gl, background, ...props }) => {
  useEffect(() => {
    if (gl.current && gl.current.setClearColor && background) {
      gl.current.setClearColor(background);
    }
  }, [background, gl]);

  return (
    <Canvas
      key="canvas"
      invalidateFrameloop
      colorManagement
      orthographic
      camera={{ zoom: 300, position: [0, 0, 100] }}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={(context) => {
        // canvasRef.current = context.gl.domElement;
        gl.current = context.gl;
        gl.current.setClearColor(background);
      }}
      pixelRatio={window.devicePixelRatio}
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      <Inner {...props} canvasRef={gl} background={background} />
    </Canvas>
  );
});

export default Outer;
