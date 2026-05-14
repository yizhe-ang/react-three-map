import type { CanvasProps as FiberCanvasProps, RenderProps } from "@react-three/fiber";
import { PropsWithChildren } from "react";
import type { ColorRepresentation, Euler, Texture } from "three";
import { Coords } from "./coords";

type CanvasBackgroundValue = ColorRepresentation | Texture | null;

export type CanvasBackground = CanvasBackgroundValue | {
  background?: CanvasBackgroundValue;
  environment?: CanvasBackgroundValue;
  files?: string | string[];
  path?: string;
  preset?: string;
  backgroundBlurriness?: number;
  backgroundIntensity?: number;
  backgroundRotation?: Euler;
  environmentIntensity?: number;
  environmentRotation?: Euler;
};

export interface CanvasProps extends Coords, Omit<FiberCanvasProps, 'background' | 'children' | 'frameloop'>, PropsWithChildren {
  id?: string;
  beforeId?: string;
  /** R3F v10 scene background prop. Passed through to `@react-three/fiber`. */
  background?: CanvasBackground;
  frameloop?: 'always' | 'demand',
  size?: RenderProps<HTMLCanvasElement>['size'],
  /** render on a separated `<canvas>` that sits on top of the map provider */
  overlay?: boolean,
}
