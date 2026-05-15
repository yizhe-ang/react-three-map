import { RootStore, createRoot } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { CanvasProps } from "../../api/canvas-props";
import { events } from "../events";
import { FromLngLat, MapInstance } from "../generic-map";
import { getInLayerGLProps } from "../renderer-props";
import { setCoords, useSetRootCoords } from "../use-coords";
import { useFunction } from "../use-function";
import { R3M, initR3M } from "../use-r3m";

export function useRoot(
  fromLngLat: FromLngLat,
  map: MapInstance,
  { frameloop, longitude, latitude, altitude, ...props }: CanvasProps
) {

  const [{ root, canvas }] = useState(() => {
    const canvas = map.getCanvas();
    return { root: createRoot(canvas), canvas }

  })
  const [rootState, setRootState] = useState<{
    store: RootStore,
    r3m: R3M,
  }>();

  useEffect(() => {
    let cancelled = false;
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext;

    async function configureRoot() {
      await root.configure({
        dpr: window.devicePixelRatio,
        events,
        ...props,
        frameloop: 'never',
        gl: getInLayerGLProps(props.gl, gl),
        onCreated: (state) => {
          state.gl.forceContextLoss = () => { }; // eslint-disable-line @typescript-eslint/no-empty-function
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

      if (cancelled) return;

      const store = root.render(<></>);
      const r3m = initR3M({ map, fromLngLat, store });
      setCoords(store, {longitude, latitude, altitude});

      if (frameloop === 'demand') {
        store.setState({
          frameloop,
          invalidate: () => {
            map.triggerRepaint();
          },
        })
      }

      setRootState({ store, r3m });
    }

    configureRoot();

    return () => {
      cancelled = true;
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const useThree = rootState?.store;
  const r3m = rootState?.r3m;

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

  // root.render
  useEffect(() => {
    if (!useThree) return;
    root.render(<>
      {props.children}
    </>);
  }, [props.children, useThree]) // eslint-disable-line react-hooks/exhaustive-deps

  return { onRemove, useThree, r3m };
}
