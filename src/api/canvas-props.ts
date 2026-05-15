import { CanvasProps as FiberCanvasProps, Size } from "@react-three/fiber";
import { PropsWithChildren } from "react";
import { Coords } from "./coords";

export interface CanvasProps extends Coords, Omit<FiberCanvasProps, 'frameloop'>, PropsWithChildren {
  id?: string;
  beforeId?: string;
  frameloop?: 'always' | 'demand',
  size?: Size,
  /** render on a separated `<canvas>` that sits on top of the map provider */
  overlay?: boolean,
}
