import { RootStore, useStore, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Coords } from "../api/coords";

export function useCoords() {
  const coords = useThree(s=>(s as any).coords) as Coords; // eslint-disable-line @typescript-eslint/no-explicit-any
  return coords;
}

export function useSetCoords({longitude, latitude, altitude}: Coords) {
  const store = useStore();
  useMemo(()=>{
    const coords : Coords = { longitude, latitude, altitude };
    setCoords(store, coords);
  }, [longitude, latitude, altitude]) // eslint-disable-line react-hooks/exhaustive-deps
}

export function useSetRootCoords(store:RootStore | undefined, {
  longitude, latitude, altitude
}: Coords) {
  useMemo(()=>{
    if (!store) return;
    setCoords(store, {longitude, latitude, altitude});
  }, [longitude, latitude, altitude]) // eslint-disable-line react-hooks/exhaustive-deps
}

export function setCoords(store:RootStore, coords: Coords) {
  store.setState({coords} as any) // eslint-disable-line @typescript-eslint/no-explicit-any
}
