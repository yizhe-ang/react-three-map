import { useStore, useThree } from "@react-three/fiber";
import type { RootStore } from "@react-three/fiber";
import { useState } from "react";
import { Matrix4, Matrix4Tuple } from "three";
import { FromLngLat, MapInstance } from "./generic-map";

export interface R3M<T extends MapInstance = MapInstance> {
  /** Map provider */
  map: T,
  /** view projection matrix coming from the map provider */
  viewProjMx: Matrix4Tuple,
  fromLngLat: FromLngLat,
}

export function useR3M<T extends MapInstance> () {
  const r3m = useThree(s=>(s as any).r3m) as R3M<T>; // eslint-disable-line @typescript-eslint/no-explicit-any
  return r3m;
}

/** init `useR3M` hook */
export function useInitR3M<T extends MapInstance>(props: {
  map: T; fromLngLat: FromLngLat;
}) {
  const store = useStore();
  // to run only once
  useState(()=>{
    initR3M({...props, store})
  })
}

export function initR3M<T extends MapInstance>({store, ...props}: {
  map: T;
  fromLngLat: FromLngLat;
  store: RootStore;
}) {
  const viewProjMx = new Matrix4().identity().toArray();
  const r3m : R3M<T> = { ...props, viewProjMx };
  store.setState({r3m} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  return r3m;
}
