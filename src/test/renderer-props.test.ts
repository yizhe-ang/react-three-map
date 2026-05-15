import { describe, expect, it } from "vitest";
import { getInLayerGLProps, getOverlayGLProps } from "../core/renderer-props";

describe("renderer props", () => {
  const context = {} as WebGLRenderingContext;

  it("sets autoClear false on overlay gl config objects", () => {
    const gl = getOverlayGLProps({ antialias: false, autoClear: true });

    expect(gl).toMatchObject({
      antialias: false,
      autoClear: false,
    });
  });

  it("sets autoClear false after async overlay gl factories resolve", async () => {
    const renderer = { autoClear: true };
    const defaults = { canvas: document.createElement("canvas"), alpha: true };
    const gl = getOverlayGLProps(async (props) => {
      expect(props).toBe(defaults);
      return renderer as never;
    });

    expect(typeof gl).toBe("function");
    const resolved = await (gl as (props: typeof defaults) => Promise<typeof renderer>)(defaults);

    expect(resolved).toBe(renderer);
    expect(renderer.autoClear).toBe(false);
  });

  it("rejects in-layer gl factories", () => {
    expect(() => getInLayerGLProps(() => ({}) as never, context)).toThrow("overlay={true}");
  });

  it("rejects in-layer renderer instances", () => {
    expect(() => getInLayerGLProps({ render: () => undefined } as never, context)).toThrow("overlay={true}");
  });
});
