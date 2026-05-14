import type { CanvasProps as FiberCanvasProps, RenderProps } from "@react-three/fiber";
import { PropsWithChildren } from "react";
import { Coords } from "./coords";

export interface CanvasProps extends Coords, Omit<FiberCanvasProps, 'children' | 'frameloop'>, PropsWithChildren {
  id?: string;
  beforeId?: string;
  frameloop?: 'always' | 'demand',
  size?: RenderProps<HTMLCanvasElement>['size'],
  /** render on a separated `<canvas>` that sits on top of the map provider */
  overlay?: boolean,
}
