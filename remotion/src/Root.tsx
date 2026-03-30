import React from "react";
import { Composition } from "remotion";
import { MissedMessage } from "./compositions/MissedMessage";
import { SevenDays } from "./compositions/SevenDays";
import { AfterHours } from "./compositions/AfterHours";
import { WIDTH, HEIGHT, FPS } from "./brand";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MissedMessage"
        component={MissedMessage}
        durationInFrames={12 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="SevenDays"
        component={SevenDays}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="AfterHours"
        component={AfterHours}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
