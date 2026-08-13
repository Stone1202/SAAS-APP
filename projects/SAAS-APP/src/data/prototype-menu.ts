/**
 * Prototype 总览页数据模型 — APP/运营/租户 三端节点清单
 *
 * v3.1.42: 全部 brIds 编号文字化 + PG-SHP-APP-010 修正 + PG-SHP-APP-013A 删除(优惠券二级页去除) + PG-SHP-APP-013 entIds 移除 ENT-PROJECT-006A
 * v3.1.41: 新增 PG-OPS-PC-006(项目列表) + PG-OPS-PC-006-M01(禁用确认弹窗) + 新增 PG-TNT-PC-002 inviteTabs
 * v3.1.40: UC编号重构为功能维度，新增 features 功能域定义
 * v3.1.37: 租户后台项目选择器改造 + 运营平台项目列表新增
 */

export interface PageNode {
  id: string;
  name: string;
  type: 'page';
  terminal: 'APP端' | 'PC端';
  route: string;
  component: string;
  fnId: string;
  fnName: string;
  ucIds: string[];
  brIds: string[];
  entIds: string[];
  note?: string;
  docLinks: DocLink[];
  hifiUrl?: string;
}

export interface ModalNode {
  id: string;
  name: string;
  type: 'modal';
  parentId: string;
  trigger: string;
  ucIds: string[];
  brIds: string[];
}

export interface FeatureNode {
  id: string;
  name: string;
  type: 'feature';
  ucCount: number;
  ucIds: string[];
}

export interface DocLink {
  label: string;
  docType: 'prd' | 'design' | 'useCaseList';
  anchor: string;
  href?: string;
}

function docLink(label: string, docType: 'prd' | 'design' | 'useCaseList', anchor = '') {
  return { label, docType, anchor };
}

function makeHifiUrl(path: string) {
  return `http://localhost:5175/app.html#${path}`;
}

// v3.1.40 新增功能域定义
export const features: FeatureNode[] = [
  { id: 'HOME', name: '平台首页', type: 'feature', ucCount: 3, ucIds: ['UC-SHP-HOME-001', 'UC-SHP-HOME-002', 'UC-SHP-HOME-003'] },
  { id: 'MALL', name: '电商商城', type: 'feature', ucCount: 6, ucIds: ['UC-SHP-MALL-001', 'UC-SHP-MALL-002', 'UC-SHP-MALL-003', 'UC-SHP-MALL-004', 'UC-SHP-MALL-005', 'UC-SHP-MALL-006'] },
  { id: 'SEARCH', name: '搜索体系', type: 'feature', ucCount: 6, ucIds: ['UC-SHP-SEARCH-001', 'UC-SHP-SEARCH-002', 'UC-SHP-SEARCH-003', 'UC-SHP-SEARCH-004', 'UC-SHP-SEARCH-005', 'UC-SHP-SEARCH-006'] },
  { id: 'PRODUCT', name: '商品', type: 'feature', ucCount: 2, ucIds: ['UC-SHP-PRODUCT-001', 'UC-SHP-PRODUCT-002'] },
  { id: 'LIVE', name: '直播', type: 'feature', ucCount: 1, ucIds: ['UC-SHP-LIVE-001'] },
  { id: 'STORE', name: '门店', type: 'feature', ucCount: 4, ucIds: ['UC-SHP-STORE-001', 'UC-SHP-STORE-002', 'UC-SHP-STORE-003', 'UC-SHP-STORE-004'] },
  { id: 'MEMBER', name: '会员', type: 'feature', ucCount: 3, ucIds: ['UC-SHP-MEMBER-001', 'UC-SHP-MEMBER-002', 'UC-SHP-MEMBER-003'] },
  { id: 'MINE', name: '个人中心', type: 'feature', ucCount: 3, ucIds: ['UC-SHP-MINE-001', 'UC-SHP-MINE-002', 'UC-SHP-MINE-003'] },
  { id: 'PLACEHOLDER', name: '占位', type: 'feature', ucCount: 2, ucIds: ['UC-SHP-PLACEHOLDER-001', 'UC-SHP-PLACEHOLDER-002'] },
  // 运营后台功能域（复用UC-OPS前缀）
  { id: 'OPS-SEARCH', name: '搜索管理', type: 'feature', ucCount: 4, ucIds: ['UC-OPS-SEARCH-001', 'UC-OPS-SEARCH-002', 'UC-OPS-SEARCH-003', 'UC-OPS-SEARCH-004'] },
  { id: 'OPS-CONFIG', name: '运营配置', type: 'feature', ucCount: 7, ucIds: ['UC-OPS-CONFIG-001', 'UC-OPS-CONFIG-002', 'UC-OPS-CONFIG-003', 'UC-OPS-CONFIG-004', 'UC-OPS-CONFIG-005', 'UC-OPS-CONFIG-006', 'UC-OPS-CONFIG-007'] },
  { id: 'OPS-RECOMMEND', name: '推荐管理', type: 'feature', ucCount: 12, ucIds: ['UC-OPS-RECOMMEND-001', 'UC-OPS-RECOMMEND-002', 'UC-OPS-RECOMMEND-003', 'UC-OPS-RECOMMEND-004', 'UC-OPS-RECOMMEND-005', 'UC-OPS-RECOMMEND-006', 'UC-OPS-RECOMMEND-007', 'UC-OPS-RECOMMEND-008', 'UC-OPS-RECOMMEND-009', 'UC-OPS-RECOMMEND-010', 'UC-OPS-RECOMMEND-011', 'UC-OPS-RECOMMEND-012'] },
  { id: 'TNT-TENANT', name: '租户管理', type: 'feature', ucCount: 7, ucIds: ['UC-TNT-TENANT-001', 'UC-TNT-TENANT-002', 'UC-TNT-TENANT-003', 'UC-TNT-TENANT-004', 'UC-TNT-TENANT-005', 'UC-TNT-TENANT-006', 'UC-TNT-TENANT-007'] },
];

// ========== APP端页面节点（含详情独立页） ==========
export const appPages: PageNode[] = [
  {
    id: 'PG-SHP-APP-001',
    name: '平台首页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/home',
    component: 'PlatformHome',
    fnId: 'FN-SHP-APP-001',
    fnName: '首页渲染',
    ucIds: ['UC-SHP-HOME-001', 'UC-SHP-HOME-002', 'UC-SHP-HOME-003'],
    brIds: ['BR-SHP-005: Banner轮播自动播放+手动滑动+跳转', 'BR-SHP-006: 金刚区入口配置+图标渐变+跳转', 'BR-SHP-007: 直播推荐叠加模式排序', 'BR-SHP-026: 商城页三Tab(商城列表/精选商品/精选直播)', 'BR-SHP-030: 推荐叠加模式(手动在前+默认规则补足)', 'BR-SHP-034: 商品推荐多维度排序链', 'BR-SHP-042: 平台首页直播推荐脱离规则引擎按默认规则排序', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-APP-001', 'ENT-APP-002', 'ENT-APP-005', 'ENT-PROJECT-001', 'ENT-PROJECT-004', 'ENT-PROJECT-002'],
    docLinks: [
      docLink('PRD §8.1 FN-SHP-APP-001', 'prd', '§8.1'),
      docLink('设计文档 §5.1 平台首页草图', 'design', '§5.1'),
      docLink('用例卡清单 UC-001', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/home'),
  },
  {
    id: 'PG-SHP-APP-002',
    name: '商城页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/mall',
    component: 'MallPage',
    fnId: 'FN-SHP-APP-002',
    fnName: '商城页展示',
    ucIds: ['UC-SHP-MALL-001', 'UC-SHP-MALL-002', 'UC-SHP-MALL-003', 'UC-SHP-MALL-004'],
    brIds: ['BR-SHP-031: 商城页默认Tab为项目列表', 'BR-SHP-032: 首页推荐"更多"跳转商城对应Tab', 'BR-SHP-033: 运营后台推荐管理分页', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-PROJECT-001', 'ENT-PROJECT-002', 'ENT-PROJECT-004'],
    docLinks: [
      docLink('PRD §8.2 FN-SHP-APP-002', 'prd', '§8.2'),
      docLink('设计文档 §5.2 商城页草图', 'design', '§5.2'),
      docLink('用例卡清单 UC-002', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/mall'),
  },
  {
    id: 'PG-SHP-APP-003',
    name: '娱乐页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/entertainment',
    component: 'EntertainmentPage',
    fnId: 'FN-SHP-APP-003',
    fnName: '娱乐页',
    ucIds: ['UC-SHP-PLACEHOLDER-001'],
    brIds: [],
    entIds: [],
    docLinks: [
      docLink('PRD §8.3 FN-SHP-APP-003', 'prd', '§8.3'),
      docLink('用例卡清单 UC-003', 'useCaseList'),
    ],
  },
  {
    id: 'PG-SHP-APP-004',
    name: '消息页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/message',
    component: 'MessagePage',
    fnId: 'FN-SHP-APP-004',
    fnName: '消息页',
    ucIds: ['UC-SHP-PLACEHOLDER-002'],
    brIds: [],
    entIds: [],
    docLinks: [
      docLink('PRD §8.4 FN-SHP-APP-004', 'prd', '§8.4'),
      docLink('用例卡清单 UC-004', 'useCaseList'),
    ],
  },
  {
    id: 'PG-SHP-APP-005',
    name: '个人中心',
    type: 'page',
    terminal: 'APP端',
    route: '/app/mine',
    component: 'PlatformMine',
    fnId: 'FN-SHP-APP-005',
    fnName: '个人中心',
    ucIds: ['UC-SHP-MINE-001', 'UC-SHP-MINE-002', 'UC-SHP-MINE-003'],
    brIds: ['BR-SHP-018: 项目维度Tab导航+会员体系', 'BR-SHP-028: 会员等级仅项目维度存在,平台无独立会员等级'],
    entIds: ['ENT-APP-001', 'ENT-APP-006'],
    docLinks: [
      docLink('PRD §8.5 FN-SHP-APP-005', 'prd', '§8.5'),
      docLink('设计文档 §5.3 个人中心草图', 'design', '§5.3'),
      docLink('用例卡清单 UC-005', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/mine'),
  },
  {
    id: 'PG-SHP-APP-005A',
    name: '收货地址管理页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/mine/addresses',
    component: 'ShippingAddressManage',
    fnId: 'FN-SHP-APP-005',
    fnName: '个人中心',
    ucIds: ['UC-SHP-MINE-003'],
    brIds: ['BR-SHP-023: 收货地址管理(增删改查+最多20条)'],
    entIds: ['ENT-APP-006'],
    docLinks: [
      docLink('PRD §8.5 FN-SHP-APP-005', 'prd', '§8.5'),
      docLink('用例卡清单 UC-005A', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/mine/addresses'),
  },
  {
    id: 'PG-SHP-APP-006',
    name: '平台会员中心',
    type: 'page',
    terminal: 'APP端',
    route: '/app/mine/member',
    component: 'PlatformMember',
    fnId: 'FN-SHP-APP-006',
    fnName: '平台会员中心',
    ucIds: ['UC-SHP-MEMBER-001', 'UC-SHP-MEMBER-002'],
    brIds: ['BR-SHP-028: 会员等级仅项目维度存在,平台无独立会员等级'],
    entIds: ['ENT-APP-001', 'ENT-PROJECT-006'],
    docLinks: [
      docLink('PRD §8.6 FN-SHP-APP-006', 'prd', '§8.6'),
      docLink('设计文档 §5.12 平台会员中心草图', 'design', '§5.12'),
      docLink('用例卡清单 UC-006', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/mine/member'),
  },
  {
    id: 'PG-SHP-APP-007',
    name: '搜索页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/search',
    component: 'SearchPage',
    fnId: 'FN-SHP-APP-007',
    fnName: '搜索页',
    ucIds: ['UC-SHP-SEARCH-001', 'UC-SHP-SEARCH-002', 'UC-SHP-SEARCH-003'],
    brIds: ['BR-SHP-015: 搜索结果Tab切换过滤', 'BR-SHP-017: 热搜词点击跳转逻辑', 'BR-SHP-016: 自定义搜索结果优先展示'],
    entIds: ['ENT-APP-004', 'ENT-APP-003'],
    docLinks: [
      docLink('PRD §8.7 FN-SHP-APP-007', 'prd', '§8.7'),
      docLink('设计文档 §5.3 搜索页草图', 'design', '§5.3'),
      docLink('用例卡清单 UC-007', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/search'),
  },
  {
    id: 'PG-SHP-APP-008',
    name: '搜索结果页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/search/result',
    component: 'SearchResultPage',
    fnId: 'FN-SHP-APP-008',
    fnName: '搜索结果页',
    ucIds: ['UC-SHP-SEARCH-004', 'UC-SHP-SEARCH-005', 'UC-SHP-SEARCH-006'],
    brIds: ['BR-SHP-015: 搜索结果Tab切换过滤', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-APP-003', 'ENT-PROJECT-002', 'ENT-PROJECT-004', 'ENT-PROJECT-001'],
    docLinks: [
      docLink('PRD §8.8 FN-SHP-APP-008', 'prd', '§8.8'),
      docLink('设计文档 §5.4 搜索结果页草图', 'design', '§5.4'),
      docLink('用例卡清单 UC-008', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/search/result'),
  },
  {
    id: 'PG-SHP-APP-009',
    name: '项目首页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/project/:projectId',
    component: 'ProjectHome',
    fnId: 'FN-SHP-APP-009',
    fnName: '项目首页',
    ucIds: ['UC-SHP-STORE-001'],
    brIds: ['BR-SHP-018: 项目维度Tab导航+会员体系', 'BR-SHP-041: 项目维度推荐直播默认规则', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-PROJECT-001', 'ENT-PROJECT-002', 'ENT-PROJECT-004', 'ENT-PROJECT-005', 'ENT-PROJECT-006', 'ENT-PROJECT-007'],
    docLinks: [
      docLink('PRD §8.9 FN-SHP-APP-009', 'prd', '§8.9'),
      docLink('设计文档 §5.5 项目首页草图', 'design', '§5.5'),
      docLink('用例卡清单 UC-009', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/project/proj-daily-01'),
  },
  {
    id: 'PG-SHP-APP-009A',
    name: '项目商城页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/project/:projectId/mall',
    component: 'ProjectMall',
    fnId: 'FN-SHP-APP-009A',
    fnName: '项目商城页',
    ucIds: ['UC-SHP-MALL-005', 'UC-SHP-MALL-006'],
    brIds: ['BR-SHP-029: 项目首页搜索改为当前页内搜索(已废弃)', 'BR-SHP-012: 商品按营销分类组织'],
    entIds: ['ENT-PROJECT-002', 'ENT-PROJECT-009'],
    docLinks: [
      docLink('PRD §8.9A FN-SHP-APP-009A', 'prd', '§8.9A'),
      docLink('设计文档 §5.5 项目商城页草图', 'design', '§5.5'),
      docLink('用例卡清单 UC-009A', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/project/proj-daily-01/mall'),
  },
  {
    id: 'PG-SHP-APP-010',
    name: '项目门店页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/project/:projectId/stores',
    component: 'ProjectStores',
    fnId: 'FN-SHP-APP-010',
    fnName: '项目门店页',
    ucIds: ['UC-SHP-STORE-002', 'UC-SHP-STORE-003'],
    brIds: ['BR-SHP-012: 商品按营销分类组织', 'BR-SHP-018: 项目维度Tab导航+会员体系', 'BR-SHP-041: 项目维度推荐直播默认规则'],
    entIds: ['ENT-PROJECT-002', 'ENT-PROJECT-010', 'ENT-PROJECT-011'],
    note: 'v3.1.42修正：我的门店逻辑（绑定→StoreDetailContent详情；未绑定→引导卡片）',
    docLinks: [
      docLink('PRD §8.10 FN-SHP-APP-010', 'prd', '§8.10'),
      docLink('设计文档 §5.7 项目门店页草图', 'design', '§5.7'),
      docLink('用例卡清单 UC-010', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/project/proj-daily-01/stores'),
  },
  {
    id: 'PG-SHP-APP-011',
    name: '门店详情',
    type: 'page',
    terminal: 'APP端',
    route: '/app/store/:storeId',
    component: 'StoreDetail',
    fnId: 'FN-SHP-APP-011',
    fnName: '门店详情',
    ucIds: ['UC-SHP-STORE-003'],
    brIds: ['BR-SHP-013: 门店基本信息+位置展示', 'BR-SHP-014: 门店推荐直播+商品展示', 'BR-SHP-041: 项目维度推荐直播默认规则', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-PROJECT-003', 'ENT-PROJECT-002', 'ENT-PROJECT-004'],
    docLinks: [
      docLink('PRD §8.11 FN-SHP-APP-011', 'prd', '§8.11'),
      docLink('设计文档 §5.8 门店详情页草图', 'design', '§5.8'),
      docLink('用例卡清单 UC-011', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/store/st-001'),
  },
  {
    id: 'PG-SHP-APP-011A',
    name: '门店商品/直播列表',
    type: 'page',
    terminal: 'APP端',
    route: '/app/store/:storeId/items',
    component: 'StoreItems',
    fnId: 'FN-SHP-APP-011',
    fnName: '门店详情',
    ucIds: ['UC-SHP-STORE-004'],
    brIds: ['BR-SHP-013: 门店基本信息+位置展示', 'BR-SHP-014: 门店推荐直播+商品展示'],
    entIds: ['ENT-PROJECT-003', 'ENT-PROJECT-002', 'ENT-PROJECT-004', 'ENT-PROJECT-009'],
    docLinks: [
      docLink('PRD §8.11A FN-SHP-APP-011A', 'prd', '§8.11A'),
      docLink('用例卡清单 UC-011A', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/store/st-001/items'),
  },
  {
    id: 'PG-SHP-APP-012',
    name: '商品详情页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/product/:productId',
    component: 'ProductDetail',
    fnId: 'FN-SHP-APP-012',
    fnName: '商品详情页',
    ucIds: ['UC-SHP-PRODUCT-001'],
    brIds: ['BR-SHP-019: 商品详情页展示规范', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-PROJECT-002', 'ENT-PROJECT-001', 'ENT-PROJECT-003'],
    docLinks: [
      docLink('PRD §8.14 FN-SHP-APP-014', 'prd', '§8.14'),
      docLink('设计文档 §5.6 商品详情页草图', 'design', '§5.6'),
      docLink('用例卡清单 UC-012', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/product/prod-daily-001'),
  },
  {
    id: 'PG-SHP-APP-012A',
    name: '更多商品分类页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/more-products',
    component: 'StoreMoreProducts',
    fnId: 'FN-SHP-APP-012',
    fnName: '商品详情页',
    ucIds: ['UC-SHP-PRODUCT-002'],
    brIds: ['BR-SHP-019: 商品详情页展示规范'],
    entIds: ['ENT-PROJECT-002', 'ENT-PROJECT-009'],
    docLinks: [
      docLink('PRD §8.14A FN-SHP-APP-014A', 'prd', '§8.14A'),
      docLink('用例卡清单 UC-012A', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/more-products?projectId=proj-daily-01'),
  },
  {
    id: 'PG-SHP-APP-013',
    name: '项目会员中心',
    type: 'page',
    terminal: 'APP端',
    route: '/app/project/:projectId/member',
    component: 'ProjectMember',
    fnId: 'FN-SHP-APP-013',
    fnName: '项目会员页',
    ucIds: ['UC-SHP-MEMBER-003'],
    brIds: ['BR-SHP-018: 项目维度Tab导航+会员体系', 'BR-SHP-021: 会员资产+签到+优惠券规则', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)', 'BR-SHP-028: 会员等级仅项目维度存在,平台无独立会员等级'],
    entIds: ['ENT-PROJECT-001', 'ENT-PROJECT-006', 'ENT-PROJECT-006B'],
    docLinks: [
      docLink('PRD §8.13 FN-SHP-APP-013', 'prd', '§8.13'),
      docLink('设计文档 §5.10 项目会员页草图', 'design', '§5.10'),
      docLink('用例卡清单 UC-013', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/project/proj-daily-01/member'),
  },
  // v3.1.42: PG-SHP-APP-013A 已删除（优惠券二级页去除，优惠券仅在会员页资产卡展示数量）
  {
    id: 'PG-SHP-APP-014',
    name: '直播详情页',
    type: 'page',
    terminal: 'APP端',
    route: '/app/live/:liveId',
    component: 'LiveDetail',
    fnId: 'FN-SHP-APP-014',
    fnName: '直播详情页',
    ucIds: ['UC-SHP-LIVE-001'],
    brIds: ['BR-SHP-035: 直播状态动态显示+anchor_type', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
    entIds: ['ENT-PROJECT-004', 'ENT-PROJECT-001'],
    docLinks: [
      docLink('PRD §8.14 FN-SHP-APP-014', 'prd', '§8.14'),
      docLink('设计文档 §5.7 直播详情页草图', 'design', '§5.7'),
      docLink('用例卡清单 UC-014', 'useCaseList'),
    ],
    hifiUrl: makeHifiUrl('/app/live/live-001'),
  },
];

// ========== 运营后台页面节点 ==========
export const adminPages: PageNode[] = [
  {
    id: 'PG-OPS-PC-001',
    name: '搜索管理',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/search',
    component: 'SearchManage',
    fnId: 'FN-OPS-PC-001',
    fnName: '搜索管理',
    ucIds: ['UC-OPS-SEARCH-001', 'UC-OPS-SEARCH-002', 'UC-OPS-SEARCH-003', 'UC-OPS-SEARCH-004'],
    brIds: ['BR-SHP-015: 搜索结果Tab切换过滤', 'BR-SHP-016: 自定义搜索结果优先展示', 'BR-SHP-017: 热搜词点击跳转逻辑'],
    entIds: ['ENT-APP-004', 'ENT-APP-003'],
    docLinks: [
      docLink('PRD §8.3.1 FN-OPS-PC-001', 'prd', '§8.3.1'),
      docLink('设计文档 §5.9 搜索管理页草图', 'design', '§5.9'),
      docLink('用例卡清单 UC-OPS-001', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/search',
  },
  {
    id: 'PG-OPS-PC-002',
    name: '广告位管理',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/ad',
    component: 'AdManage',
    fnId: 'FN-OPS-PC-002',
    fnName: '广告位管理',
    ucIds: ['UC-OPS-CONFIG-001', 'UC-OPS-CONFIG-002', 'UC-OPS-CONFIG-003'],
    brIds: ['BR-SHP-005: Banner轮播自动播放+手动滑动+跳转', 'BR-SHP-022: Banner/金刚区跳转类型支持'],
    entIds: ['ENT-APP-002'],
    docLinks: [
      docLink('PRD §8.3.2 FN-OPS-PC-002', 'prd', '§8.3.2'),
      docLink('设计文档 §5.10 广告位管理页草图', 'design', '§5.10'),
      docLink('用例卡清单 UC-OPS-002', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/ad',
  },
  {
    id: 'PG-OPS-PC-003',
    name: '金刚区管理',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/kingkong',
    component: 'KingKongManage',
    fnId: 'FN-OPS-PC-003',
    fnName: '金刚区管理',
    ucIds: ['UC-OPS-CONFIG-004'],
    brIds: ['BR-SHP-006: 金刚区入口配置+图标渐变+跳转', 'BR-SHP-022: Banner/金刚区跳转类型支持'],
    entIds: ['ENT-APP-003'],
    docLinks: [
      docLink('PRD §8.3.3 FN-OPS-PC-003', 'prd', '§8.3.3'),
      docLink('设计文档 §5.11 金刚区管理页草图', 'design', '§5.11'),
      docLink('用例卡清单 UC-OPS-003', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/kingkong',
  },
  {
    id: 'PG-OPS-PC-004',
    name: '首页推荐-直播推荐Tab',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/home-recommend',
    component: 'HomeRecommendManage',
    fnId: 'FN-OPS-PC-004',
    fnName: '首页推荐-直播推荐',
    ucIds: ['UC-OPS-RECOMMEND-001', 'UC-OPS-RECOMMEND-002', 'UC-OPS-RECOMMEND-003'],
    brIds: ['BR-SHP-007: 直播推荐叠加模式排序', 'BR-SHP-008: 商品推荐维度排序', 'BR-SHP-030: 推荐叠加模式(手动在前+默认规则补足)', 'BR-SHP-033: 运营后台推荐管理分页', 'BR-SHP-034: 商品推荐多维度排序链', 'BR-SHP-035: 直播状态动态显示+anchor_type'],
    entIds: ['ENT-APP-005', 'ENT-PROJECT-004'],
    docLinks: [
      docLink('PRD §8.3.4 FN-OPS-PC-004', 'prd', '§8.3.4'),
      docLink('设计文档 §5.14 首页推荐页草图', 'design', '§5.14'),
      docLink('用例卡清单 UC-OPS-004', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/home-recommend',
  },
  {
    id: 'PG-OPS-PC-005',
    name: '首页推荐-商品推荐Tab',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/home-recommend',
    component: 'HomeRecommendManage',
    fnId: 'FN-OPS-PC-005',
    fnName: '首页推荐-商品推荐',
    ucIds: ['UC-OPS-RECOMMEND-004', 'UC-OPS-RECOMMEND-005', 'UC-OPS-RECOMMEND-006'],
    brIds: ['BR-SHP-007: 直播推荐叠加模式排序', 'BR-SHP-009: 直播推荐维度排序', 'BR-SHP-030: 推荐叠加模式(手动在前+默认规则补足)', 'BR-SHP-033: 运营后台推荐管理分页', 'BR-SHP-034: 商品推荐多维度排序链'],
    entIds: ['ENT-APP-005', 'ENT-PROJECT-002'],
    docLinks: [
      docLink('PRD §8.3.5 FN-OPS-PC-005', 'prd', '§8.3.5'),
      docLink('设计文档 §5.14 首页推荐页草图-商品', 'design', '§5.14'),
      docLink('用例卡清单 UC-OPS-005', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/home-recommend',
  },
  {
    id: 'PG-OPS-PC-006',
    name: '项目列表',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/projects',
    component: 'ProjectListManage',
    fnId: 'FN-SHP-ADMIN-007',
    fnName: '项目列表管理',
    ucIds: ['UC-OPS-CONFIG-005', 'UC-OPS-CONFIG-006', 'UC-OPS-CONFIG-007'],
    brIds: ['BR-SHP-020: 项目卡片点击跳转项目首页', 'BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)', 'BR-SHP-036: 项目列表支持搜索筛选分页', 'BR-SHP-037: 启用/禁用操作需要确认', 'BR-SHP-038: 项目列表展示所属租户', 'BR-SHP-039: 禁用项目前端自动隐藏', 'BR-SHP-040: 项目status管理统一在运营后台'],
    entIds: ['ENT-PROJECT-001'],
    docLinks: [
      docLink('PRD §8.3.6 FN-SHP-ADMIN-007', 'prd', '§8.3.6'),
      docLink('用例卡清单 UC-OPS-006', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/projects',
  },
  {
    id: 'PG-OPS-PC-007',
    name: '商城管理',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/mall-manage',
    component: 'MallManage',
    fnId: 'FN-OPS-PC-008',
    fnName: '商城管理',
    ucIds: ['UC-OPS-RECOMMEND-007', 'UC-OPS-RECOMMEND-008', 'UC-OPS-RECOMMEND-009'],
    brIds: ['BR-SHP-007: 直播推荐叠加模式排序', 'BR-SHP-026: 商城页三Tab(商城列表/精选商品/精选直播)', 'BR-SHP-030: 推荐叠加模式(手动在前+默认规则补足)'],
    entIds: ['ENT-APP-005'],
    docLinks: [
      docLink('PRD §8.3.7 FN-OPS-PC-008', 'prd', '§8.3.7'),
      docLink('用例卡清单 UC-OPS-007', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/mall-manage',
  },
  {
    id: 'PG-OPS-PC-008',
    name: '规则引擎管理',
    type: 'page',
    terminal: 'PC端',
    route: '/admin/recommend-rule',
    component: 'RecommendRuleManage',
    fnId: 'FN-OPS-PC-009',
    fnName: '规则引擎管理',
    ucIds: ['UC-OPS-RECOMMEND-010', 'UC-OPS-RECOMMEND-011', 'UC-OPS-RECOMMEND-012'],
    brIds: ['BR-SHP-008: 商品推荐维度排序', 'BR-SHP-034: 商品推荐多维度排序链'],
    entIds: ['ENT-APP-005'],
    docLinks: [
      docLink('PRD §8.3.8 FN-OPS-PC-009', 'prd', '§8.3.8'),
      docLink('用例卡清单 UC-OPS-008', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/admin.html#/admin/recommend-rule',
  },
];

// ========== 运营后台弹窗节点 ==========
export const adminModals: ModalNode[] = [
  {
    id: 'PG-OPS-PC-004-M01',
    name: '添加推荐直播弹窗',
    type: 'modal',
    parentId: 'PG-OPS-PC-004',
    trigger: '点击"添加推荐直播"按钮',
    ucIds: ['UC-OPS-RECOMMEND-001'],
    brIds: ['BR-SHP-030: 推荐叠加模式(手动在前+默认规则补足)'],
  },
  {
    id: 'PG-OPS-PC-005-M01',
    name: '添加推荐商品弹窗',
    type: 'modal',
    parentId: 'PG-OPS-PC-005',
    trigger: '点击"添加推荐商品"按钮',
    ucIds: ['UC-OPS-RECOMMEND-004'],
    brIds: ['BR-SHP-030: 推荐叠加模式(手动在前+默认规则补足)'],
  },
  {
    id: 'PG-OPS-PC-006-M01',
    name: '禁用确认弹窗',
    type: 'modal',
    parentId: 'PG-OPS-PC-006',
    trigger: '点击"禁用"按钮',
    ucIds: ['UC-OPS-CONFIG-006'],
    brIds: ['BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)'],
  },
];

// ========== 租户后台页面节点 ==========
export const tenantPages: PageNode[] = [
  {
    id: 'PG-TNT-PC-001',
    name: '项目管理',
    type: 'page',
    terminal: 'PC端',
    route: '/tenant/projects/:projectId/profile',
    component: 'ProjectProfileManage',
    fnId: 'FN-TNT-PC-001',
    fnName: '当前项目管理',
    ucIds: ['UC-TNT-TENANT-001', 'UC-TNT-TENANT-004', 'UC-TNT-TENANT-005', 'UC-TNT-TENANT-006'],
    brIds: ['BR-SHP-043: 项目禁用分层拦截(5层soft-disabling)', 'BR-TNT-001: 租户后台权限验证+项目隔离', 'BR-TNT-002: 租户后台数据变更需记录updated_by和updated_at'],
    entIds: ['ENT-PROJECT-001'],
    docLinks: [
      docLink('PRD §8.4.1 FN-TNT-PC-001', 'prd', '§8.4.1'),
      docLink('设计文档 §5.15 租户后台草图', 'design', '§5.15'),
      docLink('用例卡清单 UC-TNT-001', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/tenant.html#/tenant/projects/proj-daily-01/profile',
  },
  {
    id: 'PG-TNT-PC-002',
    name: '门店管理',
    type: 'page',
    terminal: 'PC端',
    route: '/tenant/projects/:projectId/stores',
    component: 'StoreManage',
    fnId: 'FN-TNT-PC-002',
    fnName: '门店管理',
    ucIds: ['UC-TNT-TENANT-002', 'UC-TNT-TENANT-007'],
    brIds: ['BR-SHP-012: 商品按营销分类组织', 'BR-SHP-013: 门店基本信息+位置展示', 'BR-TNT-002: 租户后台数据变更需记录updated_by和updated_at'],
    entIds: ['ENT-PROJECT-003', 'ENT-PROJECT-010', 'ENT-PROJECT-011'],
    docLinks: [
      docLink('PRD §8.4.2 FN-TNT-PC-002', 'prd', '§8.4.2'),
      docLink('设计文档 §5.15 租户后台-门店管理草图', 'design', '§5.15'),
      docLink('用例卡清单 UC-TNT-002', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/tenant.html#/tenant/projects/proj-daily-01/stores',
  },
  {
    id: 'PG-TNT-PC-004',
    name: '营销分类管理',
    type: 'page',
    terminal: 'PC端',
    route: '/tenant/projects/:projectId/marketing-categories',
    component: 'MarketingCategoryManage',
    fnId: 'FN-TNT-PC-004',
    fnName: '营销分类管理',
    ucIds: ['UC-TNT-TENANT-003'],
    brIds: ['BR-TNT-002: 租户后台数据变更需记录updated_by和updated_at'],
    entIds: ['ENT-PROJECT-009'],
    docLinks: [
      docLink('PRD §8.4.4 FN-TNT-PC-004', 'prd', '§8.4.4'),
      docLink('设计文档 §5.15 租户后台-营销分类草图', 'design', '§5.15'),
      docLink('用例卡清单 UC-TNT-003', 'useCaseList'),
    ],
    hifiUrl: 'http://localhost:5175/tenant.html#/tenant/projects/proj-daily-01/marketing-categories',
  },
];

// 全量页面节点（供 Prototype 总览页遍历）
export const allPageNodes: PageNode[] = [
  ...appPages,
  ...adminPages,
  ...tenantPages,
];

// ========== v3.1.42 兼容层：PrototypePage.vue 使用的旧接口 ==========
export type TerminalType = 'APP端' | 'PC端运营后台' | 'PC端租户后台';

export interface PrototypeMenuNode {
  id: string;
  name: string;
  type: 'page' | 'modal' | 'group';
  terminal?: string;
  status?: string;
  hifiUrl?: string;
  route?: string;
  component?: string;
  fnId?: string;
  fnName?: string;
  note?: string;
  ucIds?: string[];
  brIds?: string[];
  entIds?: string[];
  docLinks?: DocLink[];
  flowcharts?: string[];
  stateMachines?: string[];
  children?: PrototypeMenuNode[];
}

function terminalForNode(pgId: string): TerminalType {
  if (pgId.startsWith('PG-SHP-APP')) return 'APP端';
  if (pgId.startsWith('PG-OPS-PC')) return 'PC端运营后台';
  return 'PC端租户后台';
}

function toMenuNode(page: PageNode): PrototypeMenuNode {
  return {
    id: page.id,
    name: page.name,
    type: 'page',
    terminal: page.terminal,
    hifiUrl: page.hifiUrl,
    route: page.route,
    component: page.component,
    fnId: page.fnId,
    fnName: page.fnName,
    note: page.note,
    ucIds: page.ucIds,
    brIds: page.brIds,
    entIds: page.entIds,
    docLinks: page.docLinks.map(d => ({ ...d, href: d.href || '' })),
  };
}

function toMenuModal(modal: ModalNode, parentTerminal: string): PrototypeMenuNode {
  return {
    id: modal.id,
    name: modal.name,
    type: 'modal',
    terminal: parentTerminal,
    ucIds: modal.ucIds,
    brIds: modal.brIds,
  };
}

// 构建树形结构 + 扁平索引
const _appChildren: PrototypeMenuNode[] = [
  ...appPages.map(toMenuNode),
  ...adminModals
    .filter(m => m.parentId.startsWith('PG-OPS-PC'))
    .map(m => toMenuModal(m, 'PC端运营后台')),
];

const _adminChildren: PrototypeMenuNode[] = [
  ...adminPages.map(toMenuNode),
  ...adminModals
    .filter(m => m.parentId.startsWith('PG-OPS-PC'))
    .map(m => toMenuModal(m, 'PC端运营后台')),
];

const _tenantChildren: PrototypeMenuNode[] = tenantPages.map(toMenuNode);

export const PROTOTYPE_MENU_TREE: PrototypeMenuNode[] = [
  {
    id: 'root-app',
    name: 'APP端',
    type: 'group',
    terminal: 'APP端',
    children: _appChildren,
  },
  {
    id: 'root-ops',
    name: 'PC端运营后台',
    type: 'group',
    terminal: 'PC端运营后台',
    children: _adminChildren,
  },
  {
    id: 'root-tnt',
    name: 'PC端租户后台',
    type: 'group',
    terminal: 'PC端租户后台',
    children: _tenantChildren,
  },
];

// 扁平索引
const _nodeById = new Map<string, PrototypeMenuNode>();
function _indexNodes(nodes: PrototypeMenuNode[]) {
  for (const node of nodes) {
    _nodeById.set(node.id, node);
    if (node.children) _indexNodes(node.children);
  }
}
_indexNodes(PROTOTYPE_MENU_TREE);

export function findPrototypeNodeById(id: string): PrototypeMenuNode | undefined {
  return _nodeById.get(id);
}
