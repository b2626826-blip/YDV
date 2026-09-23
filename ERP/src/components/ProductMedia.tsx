import { Bounds, Center, Html, OrbitControls, useProgress } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { Component, Suspense, useRef, useState, type ReactNode } from 'react';
import { Mesh, MeshPhongMaterial, TextureLoader } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { A2387_MODEL_ASSETS } from '../config/productMedia';
import type { Product } from '../types/production';

type MediaSize = 'thumbnail' | 'card' | 'large';

function SoleModel({ modelUrl }: { modelUrl: string }): ReactNode {
  const materials = useLoader(MTLLoader, A2387_MODEL_ASSETS.mtlUrl);
  const maps = useLoader(TextureLoader, [A2387_MODEL_ASSETS.normalMapUrl, A2387_MODEL_ASSETS.aoMapUrl]);
  const object = useLoader(OBJLoader, modelUrl, (loader) => loader.setMaterials(materials));

  materials.preload();
  maps[1]!.channel = 0;
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    const meshMaterials = Array.isArray(child.material) ? child.material : [child.material];
    meshMaterials.forEach((material) => {
      if (material instanceof MeshPhongMaterial) {
        material.normalMap = maps[0]!;
        material.aoMap = maps[1]!;
        material.needsUpdate = true;
      }
    });
  });
  return <primitive object={object} />;
}

function ModelLoading() {
  const { progress } = useProgress();
  return <Html center><span className="whitespace-nowrap rounded-md bg-slate-900/90 px-3 py-2 text-xs text-white">載入 3D 模型… {Math.round(progress)}%</span></Html>;
}

class ModelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  public override state = { failed: false };
  public static getDerivedStateFromError() { return { failed: true }; }
  public override render() {
    if (this.state.failed) return <Html center><span className="whitespace-nowrap rounded-md bg-rose-950/90 px-3 py-2 text-xs text-rose-100">模型無法載入</span></Html>;
    return this.props.children;
  }
}

function ThreeDViewer({ product, compact = false }: { product: Product; compact?: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const initialCameraPosition: [number, number, number] = [0.4, 0.3, 0.5];
  const resetView = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(0, 0, 0);
    controls.object.position.set(...initialCameraPosition);
    controls.update();
  };

  return (
    <div className={`relative h-full overflow-hidden rounded-xl bg-slate-950 ${compact ? 'min-h-40' : 'min-h-[280px]'}`} aria-label={`${product.productCode} 3D 鞋底檢視器`}>
      <Canvas camera={{ fov: 35, position: initialCameraPosition }} dpr={[1, 2]} onCreated={() => setHasLoaded(true)}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[3, 5, 4]} intensity={2.4} />
        <directionalLight position={[-3, 1, -2]} intensity={1.15} color="#67e8f9" />
        <ModelErrorBoundary>
          <Suspense fallback={<ModelLoading />}>
            <Bounds fit clip observe margin={1.25}><Center><SoleModel modelUrl={product.mediaUrl} /></Center></Bounds>
          </Suspense>
        </ModelErrorBoundary>
        <OrbitControls ref={controlsRef} makeDefault enablePan={false} minDistance={0.1} maxDistance={3} />
      </Canvas>
      <span className="pointer-events-none absolute left-3 top-3 rounded bg-teal-400/15 px-2 py-1 text-[10px] font-bold tracking-wider text-teal-200">LIVE 3D · OBJ</span>
      {!compact && <span className="pointer-events-none absolute bottom-3 left-3 text-xs text-slate-300">拖曳旋轉 · 滾輪縮放</span>}
      <button type="button" className={`absolute right-3 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 ${compact ? 'bottom-2' : 'bottom-3'}`} onClick={resetView} disabled={!hasLoaded}>↺ Reset View</button>
    </div>
  );
}

function ImageFallback({ code }: { code: string }) {
  return <div className="flex h-full min-h-0 items-center justify-center bg-gradient-to-br from-slate-100 to-teal-50 text-center text-xs font-bold tracking-[0.18em] text-slate-500"><span>OUTSOLE<br />{code}</span></div>;
}

interface ProductMediaProps {
  product: Product;
  size?: MediaSize;
  interactive?: boolean;
  className?: string;
}

export function ProductMedia({ product, size = 'card', interactive = false, className = '' }: ProductMediaProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const dimensions = { thumbnail: 'h-12 w-12', card: 'h-40 w-full', large: 'h-[380px] w-full' }[size];

  if (product.mediaType === '3d' && interactive) {
    return <div className={`${dimensions} ${className}`}><ThreeDViewer product={product} compact={size === 'card'} /></div>;
  }
  if (product.mediaType === '3d') {
    return <div className={`relative flex ${dimensions} items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 ${className}`}><span className="absolute left-2 top-2 rounded bg-teal-300/15 px-1.5 py-0.5 text-[10px] font-bold text-teal-100">3D</span><span className="rotate-[-18deg] rounded-[45%] border border-teal-200/50 bg-teal-100/20 px-5 py-2 text-xs font-bold tracking-widest text-teal-100 shadow-xl">{product.productCode}</span></div>;
  }
  return <div className={`${dimensions} overflow-hidden rounded-xl ${className}`}>{hasImageError ? <ImageFallback code={product.productCode} /> : <img src={product.mediaUrl} alt={`${product.productName} 鞋底`} className="h-full w-full object-cover" onError={() => setHasImageError(true)} />}</div>;
}
