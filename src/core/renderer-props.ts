import { CanvasProps } from "../api/canvas-props";

type CanvasGL = CanvasProps["gl"];
type GLFactory = Extract<NonNullable<CanvasGL>, (...args: any[]) => unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any
type GLDefaults = Parameters<GLFactory>[0];
type RendererResult = ReturnType<GLFactory>;

function setAutoClearFalse(renderer: unknown) {
  if (renderer && typeof renderer === "object" && "autoClear" in renderer) {
    (renderer as { autoClear: boolean }).autoClear = false;
  }
}

function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return Boolean(value) && typeof (value as Promise<T>).then === "function";
}

function isRendererLike(value: unknown) {
  return value !== null
    && typeof value === "object"
    && "render" in value
    && typeof (value as { render?: unknown } | null)?.render === "function";
}

export function getOverlayGLProps(gl: CanvasGL): CanvasGL {
  if (typeof gl === "function") {
    return ((defaults: GLDefaults) => {
      const renderer = gl(defaults);
      if (isPromiseLike(renderer)) {
        return renderer.then((resolved) => {
          setAutoClearFalse(resolved);
          return resolved;
        }) as RendererResult;
      }
      setAutoClearFalse(renderer);
      return renderer;
    }) as CanvasGL;
  }

  if (isRendererLike(gl)) {
    setAutoClearFalse(gl);
    return gl;
  }

  return { ...gl, autoClear: false } as CanvasGL;
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
