import { Bounds, Center, Html, OrbitControls, useProgress } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Mesh, MeshPhongMaterial, TextureLoader } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

type Page = 'library' | 'detail';

const SOLE = {
  number: 'A2387',
  name: 'Demo Outsole',
  material: 'Rubber',
  color: 'Black',
  mould: 'M-023',
  status: 'Available',
};

const MODEL_URL = '/models/3DModel.obj';
const MODEL_ASSETS = [
  [MODEL_URL, 'model/obj'],
  ['/models/3DModel.mtl', 'model/mtl'],
  ['/models/3DModel/baked_mesh_7a358780_tex0.png', 'image/png'],
  ['/models/3DModel/baked_mesh_7a358780_norm0.png', 'image/png'],
  ['/models/3DModel/baked_mesh_7a358780_ao0.png', 'image/png'],
] as const;

function SoleModel(): ReactNode {
  const materials = useLoader(MTLLoader, '/models/3DModel.mtl');
  const textureMaps = useLoader(TextureLoader, [
    '/models/3DModel/baked_mesh_7a358780_norm0.png',
    '/models/3DModel/baked_mesh_7a358780_ao0.png',
  ]);
  const normalMap = textureMaps[0]!;
  const aoMap = textureMaps[1]!;

  materials.preload();
  aoMap.channel = 0;

  const object = useLoader(OBJLoader, MODEL_URL, (loader) => {
    loader.setMaterials(materials);
  });

  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;

    const meshMaterials = Array.isArray(child.material) ? child.material : [child.material];
    meshMaterials.forEach((material) => {
      if (!(material instanceof MeshPhongMaterial)) return;
      material.normalMap = normalMap;
      material.aoMap = aoMap;
      material.needsUpdate = true;
    });
  });

  return <primitive object={object} />;
}

function ModelLoading(): ReactNode {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="model-state">載入真實 3D 模型… {Math.round(progress)}%</div>
    </Html>
  );
}

class ModelErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  public override state = { failed: false };

  public static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  public override componentDidCatch(): void {
    this.props.onError();
  }

  public override render(): ReactNode {
    if (this.state.failed) {
      return (
        <Html center>
          <div className="model-state model-error">模型無法載入，請重新整理後再試。</div>
        </Html>
      );
    }

    return this.props.children;
  }
}

function Viewer(): ReactNode {
  const [viewKey, setViewKey] = useState(0);
  const [assetState, setAssetState] = useState<'checking' | 'ready' | 'failed'>('checking');

  useEffect(() => {
    let active = true;

    void Promise.all(MODEL_ASSETS.map(async ([url, contentType]) => {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok || !response.headers.get('content-type')?.startsWith(contentType)) {
        throw new Error(`無法載入 ${url}`);
      }
    })).then(
      () => { if (active) setAssetState('ready'); },
      () => { if (active) setAssetState('failed'); },
    );

    return () => { active = false; };
  }, []);

  return (
    <section className="viewer-shell" aria-label="A2387 3D 鞋底檢視器">
      <div className="viewer-bar">
        <div><span className="live-dot" />LIVE 3D PREVIEW</div>
        <span>OBJ · TEXTURED MODEL</span>
      </div>
      {assetState === 'checking' && <div className="model-state viewer-overlay">檢查 3D 資產…</div>}
      {assetState === 'failed' && <div className="model-state model-error viewer-overlay">模型無法載入，請重新整理後再試。</div>}
      {assetState === 'ready' && (
        <Canvas camera={{ fov: 35, position: [0.4, 0.3, 0.5] }} dpr={[1, 2]}>
          <color attach="background" args={['#10191d']} />
          <ambientLight intensity={1.35} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} />
          <directionalLight position={[-3, 1, -2]} intensity={1.15} color="#8fcdd0" />
          <ModelErrorBoundary onError={() => setAssetState('failed')}>
            <Suspense fallback={<ModelLoading />}>
              <Bounds key={viewKey} fit clip observe margin={1.25}>
              <Center>
                <SoleModel />
              </Center>
              </Bounds>
            </Suspense>
          </ModelErrorBoundary>
          <OrbitControls makeDefault enablePan={false} minDistance={0.1} maxDistance={3} />
        </Canvas>
      )}
      <div className="viewer-help">拖曳旋轉 · 滾輪縮放</div>
      <button className="reset-button" type="button" onClick={() => setViewKey((value) => value + 1)}>
        ↺ Reset View
      </button>
    </section>
  );
}

function Detail({ onBack }: { onBack: () => void }): ReactNode {
  return (
    <main className="detail-page">
      <button className="back-button" type="button" onClick={onBack}>← 返回資料庫</button>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">SOLE DETAIL / {SOLE.number}</p>
          <h1>{SOLE.name}</h1>
        </div>
        <span className="status"><span />{SOLE.status}</span>
      </div>
      <div className="detail-grid">
        <Viewer />
        <aside className="spec-panel">
          <div className="panel-title">
            <span>01</span>
            <h2>基本資料</h2>
          </div>
          <dl>
            <div><dt>鞋底編號</dt><dd>{SOLE.number}</dd></div>
            <div><dt>名稱</dt><dd>{SOLE.name}</dd></div>
            <div><dt>材料</dt><dd>{SOLE.material}</dd></div>
            <div><dt>顏色</dt><dd><i className="color-chip" />{SOLE.color}</dd></div>
            <div><dt>模具編號</dt><dd>{SOLE.mould}</dd></div>
            <div><dt>3D 狀態</dt><dd className="available">● {SOLE.status}</dd></div>
          </dl>
          <div className="history">
            <div className="panel-title">
              <span>02</span>
              <h2>歷史紀錄</h2>
            </div>
            <ol>
              <li><time>2026.09.18</time><p>3D Scan 與紋理資料已同步。</p></li>
              <li><time>2026.09.12</time><p>模具 M-023 最後確認。</p></li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}

function App(): ReactNode {
  const [page, setPage] = useState<Page>('library');
  const [query, setQuery] = useState('');
  const hasQuery = query.trim().length > 0;
  const isMatch = query.trim().toUpperCase() === SOLE.number;

  if (page === 'detail') return <Detail onBack={() => setPage('library')} />;

  return (
    <main className="library-page">
      <header className="masthead">
        <div className="brand-mark"><span>3D</span><i /></div>
        <div className="brand-copy">
          <strong>3D Sole Library</strong>
          <span>鞋底數位樣品資料庫</span>
        </div>
        <p>POC DEMO · DIGITAL ASSET SYSTEM</p>
      </header>
      <section className="hero">
        <p className="eyebrow">FIND · VIEW · VERIFY</p>
        <h1>每一雙鞋底，<br /><em>都能即時看見。</em></h1>
        <p className="hero-copy">輸入鞋底編號，直接檢視實際 3D 模型與基本資料，減少翻找實體樣品的等待。</p>
        <label className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋鞋底編號，例如 A2387"
            aria-label="搜尋鞋底編號"
          />
        </label>
        <p className="search-hint">
          Demo data：輸入 <button type="button" onClick={() => setQuery('A2387')}>A2387</button> 開始搜尋
        </p>
      </section>
      <section className="results" aria-live="polite">
        {!hasQuery && <div className="empty-search">請輸入鞋底編號以尋找數位樣品。</div>}
        {hasQuery && !isMatch && <div className="empty-search">找不到「{query}」的資料，請試試 A2387。</div>}
        {isMatch && (
          <article className="sole-card">
            <div className="card-visual">
              <div className="sole-silhouette">A2387</div>
              <span>3D</span>
            </div>
            <div className="card-main">
              <p className="eyebrow">SOLE NO. {SOLE.number}</p>
              <h2>{SOLE.name}</h2>
              <p>{SOLE.material} · {SOLE.color} · Mold {SOLE.mould}</p>
            </div>
            <div className="card-action">
              <span className="status"><span />{SOLE.status}</span>
              <button type="button" onClick={() => setPage('detail')}>查看 3D <b>→</b></button>
            </div>
          </article>
        )}
      </section>
      <footer>
        <span>3D SOLE LIBRARY</span>
        <p>Prototype for digital sample management</p>
      </footer>
    </main>
  );
}

export default App;
