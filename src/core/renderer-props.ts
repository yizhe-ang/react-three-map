import { CanvasProps } from "../api/canvas-props";

type CanvasGL = CanvasProps["gl"];

function isRendererLike(value: unknown) {
  return value !== null
    && typeof value === "object"
    && "render" in value
    && typeof (value as { render?: unknown } | null)?.render === "function";
}

export function getOverlayGLProps(gl: CanvasGL): CanvasGL {
  return gl;
}

export function getInLayerGLProps(gl: CanvasGL, context: WebGLRenderingContext | WebGL2RenderingContext): CanvasGL {
  if (typeof gl === "function" || isRendererLike(gl)) {
    throw new Error(
      "react-three-map: custom gl factories and renderer instances are only supported with overlay={true}. "
      + "Mapbox/MapLibre custom layers render into the map's WebGL context."
    );
  }

  return {
    ...gl,
    context,
    autoClear: false,
    antialias: true,
  } as CanvasGL;
}
