import { createRoot } from "@react-three/fiber";
import type { RootStore } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { CanvasProps } from "../../api/canvas-props";
import { events } from "../events";
import { FromLngLat, MapInstance } from "../generic-map";
import { setCoords, useSetRootCoords } from "../use-coords";
import { useFunction } from "../use-function";
import { initR3M } from "../use-r3m";
import type { R3M } from "../use-r3m";

export function useRoot(
  fromLngLat: FromLngLat,
  map: MapInstance,
  { frameloop, longitude, latitude, altitude, id: _id, beforeId: _beforeId, children, ...props }: CanvasProps
) {

  const [{ root, canvas }] = useState(() => {
    const canvas = map.getCanvas();
    const root = createRoot(canvas);
    return { root, canvas }

  })

  const [useThree, setUseThree] = useState<RootStore>();
  const [r3m, setR3m] = useState<R3M>();

  const onResize = useFunction(() => {
    if (!useThree) return;

    const { setDpr, setSize } = useThree.getState();

    setDpr(window.devicePixelRatio);

    setSize(
      canvas.clientWidth,
      canvas.clientHeight,
      canvas.offsetTop,
      canvas.offsetLeft,
    );

  })

  const onRemove = useFunction(() => {
    root.unmount();
  })

  useSetRootCoords(useThree, {longitude, latitude, altitude});

  const glConfig = useMemo(() => {
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext;
    return {
      context: gl,
      autoClear: false,
      antialias: true,
      ...props?.gl,
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // configure and render the R3F root
  useEffect(() => {
    let active = true;
    const configure = async () => {
      await root.configure({
        ...props,
        dpr: window.devicePixelRatio,
        events,
        frameloop: 'never',
        gl: glConfig,
        onCreated: (state) => {
          state.renderer.forceContextLoss = () => { }; // eslint-disable-line @typescript-eslint/no-empty-function
          props.onCreated?.(state);
        },
        camera: {
          matrixAutoUpdate: false,
          near: 0,
        },
        size: {
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          top: canvas.offsetTop,
          left: canvas.offsetLeft,
          ...props?.size,
        },
      });
      if (!active) return;
      const store = root.render(<>{children}</>);
      const nextR3m = initR3M({ map, fromLngLat, store });
      setCoords(store, {longitude, latitude, altitude});
      if (frameloop === 'demand') {
        store.setState({
          frameloop,
          invalidate: () => {
            map.triggerRepaint();
          },
        })
      }
      setUseThree(store);
      setR3m(nextR3m);
      map.triggerRepaint();
    }
    configure();
    return () => {
      active = false;
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // on `frameloop` change
  useEffect(() => {
    if (!useThree) return;
    if (frameloop !== 'demand') return;
    const setState = useThree.setState;
    const { invalidate } = useThree.getState();
    setState({
      frameloop,
      invalidate: () => {
        map.triggerRepaint();
      }
    });
    return () => {
      setState({ frameloop: 'never', invalidate })
    }
  }, [frameloop, useThree]) // eslint-disable-line react-hooks/exhaustive-deps

  // on mount / unmount
  useEffect(() => {
    map.on('resize', onResize);
    return () => {
      map.off('resize', onResize)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // root.render updates
  useEffect(() => {
    if (!useThree) return;
    root.render(<>
      {children}
    </>);
  }, [children, useThree]) // eslint-disable-line react-hooks/exhaustive-deps

  return { onRemove, useThree, r3m };
}
