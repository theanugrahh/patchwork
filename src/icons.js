import React from "react";
import Svg, { Path } from "react-native-svg";

const stroke = "#6B6B6B";

export const MicIcon = ({ size = 17, color = stroke }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 13a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v3a4 4 0 0 0 4 4Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 10c-.7-.3-1.2-1-.9-1.7.3-.7 1-1.2 1.7-.9.7.3 1.2 1 .9 1.7-.2.6-.8 1-1.4 1Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlayIcon = ({ size = 14, color = stroke }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4l14 8-14 8V4z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StopIcon = ({ size = 14, color = stroke }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6h12v12H6z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);
