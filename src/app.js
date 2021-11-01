import React, { useEffect, useRef, useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import blocks from './blocks';
import CustomStyle, { styleMetadata } from './CustomStyle';
import Sidebar from './components/Sidebar';
import { proxy, useProxy } from 'valtio';
import { DAppProvider, useBlockNumber, useEthers } from '@usedapp/core';

const store = proxy({
  ...styleMetadata,
});

const hasBlock = (num, blocks) => {
  return blocks.findIndex((b) => b.number === num) !== -1;
};

/*
  Wrapped Component required to make p5 demos compatible with EthBlock.art
  As a creative coder, you can ignore this file, check CustomStyle.js
*/
function App() {
  const [blockNumber, setBlockNumber] = useState(0);
  const [liveBlockNumber, setLiveBlockNumber] = useState(0);
  const { library, active } = useEthers();
  const currentBlockNumber = useBlockNumber();
  const snap = useProxy(store);
  const canvasRef = useRef();
  const glRef = useRef();
  const attributesRef = useRef();
  const { ref, width, height } = useDimensions({});
  const [liveBlocks, setLiveBlocks] = useState([blocks[0]]);

  useEffect(() => {
    setLiveBlockNumber(liveBlocks.length - 1);
  }, [active, liveBlocks]);

  useEffect(() => {
    if (
      active &&
      library &&
      !hasBlock(currentBlockNumber, liveBlocks) &&
      currentBlockNumber !== undefined
    ) {
      (async () => {
        let blocksToFetch = [currentBlockNumber];
        if (liveBlocks.length > 1) {
          const lastBlockNumber = liveBlocks[liveBlocks.length - 1].number;
          blocksToFetch = [
            ...new Array(currentBlockNumber - lastBlockNumber),
          ].map((_, idx) => lastBlockNumber + idx + 1);
        }
        const blocks = await Promise.all(
          blocksToFetch.map((bn) => library.getBlockWithTransactions(bn, true))
        );
        setLiveBlocks([...liveBlocks, ...blocks]);
        if (blockNumber === liveBlocks.length - 1) {
          setLiveBlockNumber(liveBlocks.length);
        }
      })();
    }
  }, [currentBlockNumber, library, liveBlocks, active, blockNumber]);

  const _onCanvasResize = (p5) => {
    p5.resizeCanvas(width, height);
  };

  const mods = Object.keys(store.options).map((k) => {
    return {
      key: k,
      value: snap.options[k],
      set: (v) => {
        store.options[k] = v;
      },
    };
  });
  console.log(active ? liveBlocks[liveBlockNumber] : blocks[blockNumber]);
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flexGrow: 1 }}>
        <div
          ref={ref}
          style={{
            margin: '0 auto',
            marginTop: '64px',
            width: '60vw',
            height: '60vw',
          }}
        >
          <h3>EthBlock.art P5.js boilerplate</h3>
          {width && height ? (
            <CustomStyle
              width={width}
              block={active ? liveBlocks[liveBlockNumber] : blocks[blockNumber]}
              height={height}
              canvasRef={canvasRef}
              gl={glRef}
              attributesRef={attributesRef}
              handleResize={_onCanvasResize}
              {...snap.options}
            />
          ) : null}
        </div>
      </div>

      <Sidebar
        blocks={active ? liveBlocks : blocks}
        blockNumber={active ? liveBlockNumber : blockNumber}
        attributes={attributesRef.current && attributesRef.current() || {}}
        mods={mods}
        handleBlockChange={(e) =>
          active ? setLiveBlockNumber(e) : setBlockNumber(e)
        }
      />
    </div>
  );
}


export default App;
