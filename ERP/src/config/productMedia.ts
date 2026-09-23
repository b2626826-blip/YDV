/// <reference types="vite/client" />
const BASE = import.meta.env.BASE_URL;

export const PRODUCT_MEDIA = {
  a2387: { type: '3d' as const, url: `${BASE}models/3DModel.obj` },
  b1042: { type: 'image' as const, url: `${BASE}images/outsole-trail.svg` },
  c5510: { type: 'image' as const, url: `${BASE}images/outsole-cloud.svg` },
  d8831: { type: 'image' as const, url: `${BASE}images/outsole-court.svg` },
  e7712: { type: 'image' as const, url: `${BASE}images/outsole-flex.svg` },
  f3208: { type: 'image' as const, url: `${BASE}images/outsole-urban.svg` },
};

export const A2387_MODEL_ASSETS = {
  mtlUrl: `${BASE}models/3DModel.mtl`,
  normalMapUrl: `${BASE}models/3DModel/baked_mesh_7a358780_norm0.png`,
  aoMapUrl: `${BASE}models/3DModel/baked_mesh_7a358780_ao0.png`,
};
