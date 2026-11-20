import React from 'react';
import { Composition } from 'remotion';
import { AxiomV3Film } from './AxiomV3Film';

export const Root: React.FC = () => (
  <Composition id="Axiom-V3-Vertical" component={AxiomV3Film} durationInFrames={450} fps={30} width={1080} height={1920} />
);
