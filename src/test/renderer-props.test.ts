import { describe, expect, it } from "vitest";
import { getInLayerGLProps, getOverlayGLProps } from "../core/renderer-props";

describe("renderer props", () => {
  const context = {} as WebGLRenderingContext;

  it("does not override autoClear on overlay gl config objects", () => {
    const gl = getOverlayGLProps({ antialias: false, autoClear: true });

    expect(gl).toMatchObject({
      antialias: false,
      autoClear: true,
    });
  });

  it("does not override autoClear after async overlay gl factories resolve", async () => {
    const renderer = { autoClear: true };
    const defaults = { canvas: document.createElement("canvas"), alpha: true };
    const gl = getOverlayGLProps(async (props) => {
      expect(props).toBe(defaults);
      return renderer as never;
    });

    expect(typeof gl).toBe("function");
    const resolved = await (gl as (props: typeof defaults) => Promise<typeof renderer>)(defaults);

    expect(resolved).toBe(renderer);
    expect(renderer.autoClear).toBe(true);
  });

  it("does not override overlay renderer instances", () => {
    const renderer = { render: () => undefined, autoClear: true };
    const gl = getOverlayGLProps(renderer as never);

    expect(gl).toBe(renderer);
    expect(renderer.autoClear).toBe(true);
  });

  it("sets autoClear false on in-layer gl config objects", () => {
    const gl = getInLayerGLProps({ antialias: false, autoClear: true }, context);

    expect(gl).toMatchObject({
      context,
      antialias: true,
      autoClear: false,
    });
  });

  it("rejects in-layer gl factories", () => {
    expect(() => getInLayerGLProps(() => ({}) as never, context)).toThrow("overlay={true}");
  });

  it("rejects in-layer renderer instances", () => {
    expect(() => getInLayerGLProps({ render: () => undefined } as never, context)).toThrow("overlay={true}");
  });
});
