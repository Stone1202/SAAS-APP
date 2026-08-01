/**
 * API契约层 — 端到端接口契约定义
 * 按业务域组织，配合 contracts/*.ts 使用
 * 
 * TODO: 对接真实后端后，在此定义各模块的API端点契约
 * 示例:
 *   export const PRODUCT_API = {
 *     LIST:    'GET    /api/v1/products',
 *     DETAIL:  'GET    /api/v1/products/:id',
 *     CREATE:  'POST   /api/v1/products',
 *     UPDATE:  'PATCH  /api/v1/products/:id',
 *     DELETE:  'DELETE /api/v1/products/:id',
 *   };
 */
export {};

/**
 * 示例：商品模块 API 端点定义
 */
export const PRODUCT_API_SPECS = {
  LIST:   { method: 'GET',    path: '/api/v1/products' },
  DETAIL: { method: 'GET',    path: '/api/v1/products/:id' },
  CREATE: { method: 'POST',   path: '/api/v1/products' },
  UPDATE: { method: 'PATCH',  path: '/api/v1/products/:id' },
  DELETE: { method: 'DELETE', path: '/api/v1/products/:id' },
  BATCH:  { method: 'POST',   path: '/api/v1/products/batch' },
} as const;
