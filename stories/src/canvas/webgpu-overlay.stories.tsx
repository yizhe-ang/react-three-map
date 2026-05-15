import { extend, ThreeToJSXElements } from "@react-three/fiber";
import 'maplibre-gl/dist/maplibre-gl.css';
import Map from 'react-map-gl/maplibre';
import { Canvas } from 'react-three-map/maplibre';
import * as THREE from "three/webgpu";
import { color } from "three/tsl";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as never);

export const WebGPUOverlay = () => {
  return <Map
    initialViewState={{
      longitude: -74.006,
      latitude: 40.7128,
      zoom: 15,
      pitch: 45,
    }}
    style={{ width: '100vw', height: '100vh' }}
    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  >
    <Canvas
      latitude={40.7128}
      longitude={-74.006}
      overlay
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(props as never);
        await renderer.init();
        return renderer as never;
      }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <mesh position={[0, 0, 120]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[60, 60, 60]} />
        <meshBasicNodeMaterial colorNode={color("#ff6b6b")} />
      </mesh>
    </Canvas>
  </Map>
}
