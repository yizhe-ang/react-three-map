import { useFrame } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import { memo, useRef } from 'react';
import { Camera, Object3D, Vector3 } from 'three';

const worldPos = new Vector3();
const point = new Vector3();
const pointOffset = new Vector3();
const projected = new Vector3();

type Object3DProps = ThreeElements['object3D'];

export const ScreenSizer = memo<Omit<Object3DProps, 'scale'> & {scale?: number}>(({
  scale = 1, ...props
}) => {
  const container = useRef<Object3D>(null);

  useFrame((state) => {
    const obj = container.current;
    if(!obj) return;
    const sf = calculateScaleFactor(obj.getWorldPosition(worldPos), scale, state.camera, state.size);
    obj.scale.setScalar(sf * scale);
  });

  return <object3D ref={container} {...props} />;
});

ScreenSizer.displayName = 'ScreenSizer';

function calculateScaleFactor(point3: Vector3, radiusPx: number, camera: Camera, size: { width: number; height: number }) {
  const point2 = getPoint2(point.copy(point3), camera, size);
  let factor = 0;
  for (let i = 0; i < 2; ++i) {
    const point2Offset = pointOffset.copy(point2).setComponent(i, point2.getComponent(i) + radiusPx);
    const point3Offset = getPoint3(point2Offset, camera, size, point2Offset.z);
    factor = Math.max(factor, point3.distanceTo(point3Offset));
  }
  return factor;
}

function getPoint2(point3: Vector3, camera: Camera, size: { width: number; height: number }) {
  camera.updateMatrixWorld(false);
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  const vector = point3.project(camera);
  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;
  return vector;
}

function getPoint3(point2: Vector3, camera: Camera, size: { width: number; height: number }, zValue = 1) {
  projected.set(point2.x / size.width * 2 - 1, -(point2.y / size.height) * 2 + 1, zValue);
  projected.unproject(camera);
  return projected;
}
