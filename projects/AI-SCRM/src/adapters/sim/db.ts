/**
 * IndexedDB 数据库初始化
 * 用于仿真模式下的本地数据存储
 */
import { openDB, type IDBPDatabase } from 'idb';

// V4.0.0: 数据库名加项目标识（IndexedDB 数据隔离）
// 不同项目用不同的数据库名，同项目不同版本数据延续
const OLD_DB_NAME = 'jojo-ai-scrm-sim';
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'ai-scrm';
const DB_NAME = `${PROJECT_ID}-sim`;
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;
let migrationDone = false;

// V4.0.0: upgrade 逻辑提取为独立函数（迁移和正常打开共用）
function upgradeDB(db: any) {
  if (!db.objectStoreNames.contains('customers')) {
    const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
    customerStore.createIndex('name', 'name');
    customerStore.createIndex('phone', 'phone');
    customerStore.createIndex('createdAt', 'createdAt');
  }
  if (!db.objectStoreNames.contains('tagGroups')) {
    db.createObjectStore('tagGroups', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('tags')) {
    db.createObjectStore('tags', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('communicationRecords')) {
    const commStore = db.createObjectStore('communicationRecords', { keyPath: 'id' });
    commStore.createIndex('customerId', 'customerId');
    commStore.createIndex('createdAt', 'createdAt');
  }
  if (!db.objectStoreNames.contains('scripts')) {
    db.createObjectStore('scripts', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('todos')) {
    const todoStore = db.createObjectStore('todos', { keyPath: 'id' });
    todoStore.createIndex('status', 'status');
    todoStore.createIndex('dueDate', 'dueDate');
  }
  if (!db.objectStoreNames.contains('segments')) {
    db.createObjectStore('segments', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('tenants')) {
    const tenantStore = db.createObjectStore('tenants', { keyPath: 'id' });
    tenantStore.createIndex('status', 'status');
    tenantStore.createIndex('industry', 'industry');
  }
  if (!db.objectStoreNames.contains('versionFeatures')) {
    db.createObjectStore('versionFeatures', { keyPath: 'feature' });
  }
  if (!db.objectStoreNames.contains('subscriptionOrders')) {
    const orderStore = db.createObjectStore('subscriptionOrders', { keyPath: 'id' });
    orderStore.createIndex('tenantId', 'tenantId');
    orderStore.createIndex('status', 'status');
  }
  if (!db.objectStoreNames.contains('aiScriptSuggestions')) {
    db.createObjectStore('aiScriptSuggestions', { keyPath: 'id' });
  }
}

// V4.0.0: 一次性旧数据迁移（仅从旧库名迁移到新库名）
async function migrateOldDBIfNeeded(): Promise<void> {
  if (migrationDone) return;
  migrationDone = true;
  if (DB_NAME === OLD_DB_NAME) return;  // 数据库名未变，无需迁移

  // 检测旧库是否存在
  let oldExists = false;
  try {
    if (typeof indexedDB !== 'undefined' && (indexedDB as any).databases) {
      const dbs = await (indexedDB as any).databases();
      oldExists = dbs.some((db: any) => db.name === OLD_DB_NAME);
    } else {
      // 降级：尝试打开旧库，成功则存在
      const testDB = await openDB(OLD_DB_NAME);
      testDB.close();
      oldExists = true;
    }
  } catch { /* 旧库不存在 */ }

  if (!oldExists) return;

  console.log(`[数据迁移] 检测到旧数据库 ${OLD_DB_NAME}，开始迁移到 ${DB_NAME}...`);
  const oldDB = await openDB(OLD_DB_NAME);
  const newDB = await openDB(DB_NAME, DB_VERSION, { upgrade: upgradeDB });

  const storeNames = [
    'customers', 'tagGroups', 'tags', 'communicationRecords',
    'scripts', 'todos', 'segments', 'tenants',
    'versionFeatures', 'subscriptionOrders', 'aiScriptSuggestions',
  ];

  let totalMigrated = 0;
  for (const storeName of storeNames) {
    if (!oldDB.objectStoreNames.contains(storeName)) continue;
    const allData = await oldDB.getAll(storeName);
    if (allData.length === 0) continue;
    const tx = newDB.transaction(storeName, 'readwrite');
    for (const item of allData) { await tx.store.put(item); }
    await tx.done;
    totalMigrated += allData.length;
  }

  oldDB.close();
  await indexedDB.deleteDatabase(OLD_DB_NAME);
  console.log(`[数据迁移] 完成！共迁移 ${totalMigrated} 条数据，旧库已删除`);
}

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  // V4.0.0: 首次访问时执行一次性迁移
  await migrateOldDBIfNeeded();

  dbInstance = await openDB(DB_NAME, DB_VERSION, { upgrade: upgradeDB });

  return dbInstance;
}

export async function seedInitialData() {
  const db = await getDB();

  // 检查是否已初始化
  const existingCustomers = await db.count('customers');
  if (existingCustomers > 0) return;

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // 种子客户数据
  const customers = [
    { id: 'C001', name: '张三', phone: '13800001111', company: '健康云科技', source: '线上推广' as const, tags: ['VIP', '意向客户'], industry: '大健康', notes: '对大健康SaaS产品感兴趣', createdAt: '2026-06-15T10:00:00Z', updatedAt: now },
    { id: 'C002', name: '李四', phone: '13900002222', company: '美丽化妆', source: '线下推广' as const, tags: ['意向客户'], industry: '美妆', notes: '关注美容行业解决方案', createdAt: '2026-06-20T14:30:00Z', updatedAt: now },
    { id: 'C003', name: '王五', phone: '13700003333', company: '同仁堂', source: '转介绍' as const, tags: ['VIP'], industry: '药业', notes: '药业大客户，需要定制化方案', createdAt: '2026-07-01T09:00:00Z', updatedAt: now },
    { id: 'C004', name: '赵六', phone: '13600004444', company: '天天百货', source: '线上推广' as const, tags: ['新客户'], industry: '百货', notes: '刚注册体验版', createdAt: '2026-07-10T16:00:00Z', updatedAt: now },
    { id: 'C005', name: '陈七', phone: '13500005555', company: '百草堂药业', source: '线下推广' as const, tags: ['意向客户', '高意向'], industry: '药业', notes: '已试用2周，意向强烈', createdAt: '2026-07-12T11:00:00Z', updatedAt: now },
    { id: 'C006', name: '周八', phone: '13400006666', company: '丽人美容', source: '其他' as const, tags: [], industry: '美妆', notes: '从竞品迁移', createdAt: '2026-07-15T08:30:00Z', updatedAt: now },
    { id: 'C007', name: '吴九', phone: '13300007777', company: '康泰医疗', source: '线上推广' as const, tags: ['新客户'], industry: '大健康', notes: '', createdAt: '2026-07-18T13:00:00Z', updatedAt: now },
    { id: 'C008', name: '郑十', phone: '13200008888', company: '美肌坊', source: '转介绍' as const, tags: ['VIP', '高意向'], industry: '美妆', notes: '转介绍客户，意向极高', createdAt: '2026-07-19T10:00:00Z', updatedAt: now },
  ];

  for (const c of customers) {
    await db.put('customers', c);
  }

  // 种子标签组
  const tagGroups = [
    { id: 'TG001', name: '客户等级', tags: ['TAG001', 'TAG002', 'TAG003'], createdAt: now },
    { id: 'TG002', name: '意向程度', tags: ['TAG004', 'TAG005', 'TAG006'], createdAt: now },
  ];
  for (const tg of tagGroups) {
    await db.put('tagGroups', tg);
  }

  // 种子标签
  const tags = [
    { id: 'TAG001', name: 'VIP', groupId: 'TG001', color: '#FF4D4F', createdAt: now },
    { id: 'TAG002', name: '意向客户', groupId: 'TG001', color: '#1677FF', createdAt: now },
    { id: 'TAG003', name: '新客户', groupId: 'TG001', color: '#52C41A', createdAt: now },
    { id: 'TAG004', name: '高意向', groupId: 'TG002', color: '#52C41A', createdAt: now },
    { id: 'TAG005', name: '中意向', groupId: 'TG002', color: '#FAAD14', createdAt: now },
    { id: 'TAG006', name: '低意向', groupId: 'TG002', color: '#D9D9D9', createdAt: now },
  ];
  for (const t of tags) {
    await db.put('tags', t);
  }

  // 种子沟通记录
  const records = [
    { id: 'CR001', customerId: 'C001', customerName: '张三', channel: '企微' as const, content: '客户询问了产品的价格和功能对比，对我们的AI话术推荐功能表现出兴趣。', direction: 'inbound' as const, emotion: 'positive' as const, intent: '高意向' as const, agentName: '张经理', createdAt: `${today}T09:30:00Z` },
    { id: 'CR002', customerId: 'C002', customerName: '李四', channel: '电话' as const, content: '通话时长8分钟，客户对美妆行业解决方案感兴趣，但还在比价阶段。', direction: 'outbound' as const, duration: 480, emotion: 'neutral' as const, intent: '比价' as const, agentName: '张经理', createdAt: `${today}T10:15:00Z` },
    { id: 'CR003', customerId: 'C003', customerName: '王五', channel: '企微' as const, content: '客户反馈使用体验良好，希望增加定制化报表功能。', direction: 'inbound' as const, emotion: 'positive' as const, intent: '高意向' as const, agentName: '李顾问', createdAt: `${today}T11:00:00Z` },
    { id: 'CR004', customerId: 'C005', customerName: '陈七', channel: '电话' as const, content: '通话12分钟，详细介绍了专业版功能，客户表示需要内部讨论后再决定。', direction: 'outbound' as const, duration: 720, emotion: 'positive' as const, intent: '高意向' as const, agentName: '张经理', createdAt: `${today}T14:00:00Z` },
    { id: 'CR005', customerId: 'C008', customerName: '郑十', channel: '企微' as const, content: '客户主动咨询企业版功能，对AI智能排程功能特别感兴趣。', direction: 'inbound' as const, emotion: 'positive' as const, intent: '高意向' as const, agentName: '李顾问', createdAt: `${today}T15:30:00Z` },
    { id: 'CR006', customerId: 'C004', customerName: '赵六', channel: '短信' as const, content: '发送体验版注册引导信息。', direction: 'outbound' as const, agentName: '系统', createdAt: `${today}T16:00:00Z` },
  ];
  for (const r of records) {
    await db.put('communicationRecords', r);
  }

  // 种子话术
  const scripts = [
    { id: 'S001', title: '产品优势介绍', content: '我们的产品经过FDA认证，安全可靠，在行业内拥有良好的口碑。相比竞品，我们的价格更实惠，功能更全面。', category: '产品介绍', tags: ['优势', '对比'], usageCount: 45, createdAt: now, updatedAt: now },
    { id: 'S002', title: '价格异议应对话术', content: '我理解您对价格的关注。我们的产品性价比很高，您可以先试用体验版，完全免费。等您感受到价值后再升级。', category: '异议处理', tags: ['价格', '试用'], usageCount: 32, createdAt: now, updatedAt: now },
    { id: 'S003', title: '客户跟进话术', content: '您好，上次我们聊到的解决方案，您这边考虑得怎么样了？如果有什么疑问，我随时可以为您解答。', category: '跟进', tags: ['跟进', '回访'], usageCount: 78, createdAt: now, updatedAt: now },
    { id: 'S004', title: 'AI功能介绍', content: '我们的AI辅助功能可以实时为您推荐话术、监控客户情绪、识别购买意向并推荐商品，大幅提升您的沟通效率。', category: '产品介绍', tags: ['AI', '功能'], usageCount: 23, createdAt: now, updatedAt: now },
    { id: 'S005', title: '成交通知话术', content: '恭喜您！您的订单已提交成功，我们会在24小时内为您开通服务。如有任何问题，请随时联系我们。', category: '订单通知', tags: ['成交', '通知'], usageCount: 56, createdAt: now, updatedAt: now },
  ];
  for (const s of scripts) {
    await db.put('scripts', s);
  }

  // 种子待办
  const todos = [
    { id: 'T001', title: '跟进张三的产品咨询', type: '跟进任务' as const, priority: 'P0' as const, status: 'pending' as const, customerId: 'C001', customerName: '张三', source: 'AI' as const, dueDate: `${today}T18:00:00Z`, createdAt: now },
    { id: 'T002', title: '回访李四购买后满意度', type: '回访' as const, priority: 'P1' as const, status: 'pending' as const, customerId: 'C002', customerName: '李四', source: '手动' as const, dueDate: '2026-07-21T18:00:00Z', createdAt: now },
    { id: 'T003', title: '发送王五合同', type: '其他' as const, priority: 'P2' as const, status: 'pending' as const, customerId: 'C003', customerName: '王五', source: '手动' as const, dueDate: '2026-07-22T18:00:00Z', createdAt: now },
    { id: 'T004', title: '跟进行业展会收集的客户线索', type: '跟进任务' as const, priority: 'P1' as const, status: 'pending' as const, source: '手动' as const, dueDate: '2026-07-23T18:00:00Z', createdAt: now },
    { id: 'T005', title: '周报整理与汇报', type: '其他' as const, priority: 'P2' as const, status: 'pending' as const, source: '手动' as const, dueDate: '2026-07-25T18:00:00Z', createdAt: now },
    { id: 'T006', title: '客户满意度调查发送', type: '回访' as const, priority: 'P1' as const, status: 'pending' as const, source: 'AI' as const, dueDate: '2026-07-24T18:00:00Z', createdAt: now },
    { id: 'T007', title: '跟进陈七的专业版升级', type: '跟进任务' as const, priority: 'P0' as const, status: 'pending' as const, customerId: 'C005', customerName: '陈七', source: 'AI' as const, dueDate: `${today}T17:00:00Z`, createdAt: now },
  ];
  for (const t of todos) {
    await db.put('todos', t);
  }

  // 种子租户数据（运营后台）——对齐知识库「租户管理_1.html」字段：租户编号/名称/联系电话/注册时间/启用状态
  const tenants = [
    { id: '2607200069234905632ID', companyName: '健康云科技', industry: '大健康', version: '专业版' as const, status: 'ACTIVE' as const, contactName: '张总', contactPhone: '17676616451', companySize: '100-200人', healthScore: 85, aiUsagePercent: 42, expireDate: '2027-01-15', registeredAt: '2026-07-20T11:31:38Z', enabled: true },
    { id: '2607200069234904670ID', companyName: '美丽化妆', industry: '美妆', version: '基础版' as const, status: 'ACTIVE' as const, contactName: '李经理', contactPhone: '17678816881', companySize: '20-50人', healthScore: 62, aiUsagePercent: 28, expireDate: '2026-08-01', registeredAt: '2026-07-20T11:20:21Z', enabled: true },
    { id: '2607200069234903342ID', companyName: '同仁堂', industry: '药业', version: '企业版' as const, status: 'ACTIVE' as const, contactName: '王总', contactPhone: '13922413536', companySize: '500+人', healthScore: 92, aiUsagePercent: 68, expireDate: '2026-12-31', registeredAt: '2026-07-20T11:09:09Z', enabled: true },
    { id: '2607200069234889796ID', companyName: '新申请百货', industry: '百货', version: '体验版' as const, status: 'PENDING' as const, contactName: '赵经理', contactPhone: '13311111111', companySize: '50-100人', healthScore: 35, aiUsagePercent: 0, expireDate: '2026-08-20', registeredAt: '2026-07-20T10:14:53Z', enabled: false },
    { id: '2607190069191202051ID', companyName: '百草堂药业', industry: '药业', version: '专业版' as const, status: 'ACTIVE' as const, contactName: '陈经理', contactPhone: '14800000000', companySize: '200-500人', healthScore: 78, aiUsagePercent: 55, expireDate: '2027-03-20', registeredAt: '2026-07-19T15:34:45Z', enabled: true },
    { id: '2607190069191202052ID', companyName: '丽人美容', industry: '美妆', version: '体验版' as const, status: 'TRIAL' as const, contactName: '周经理', contactPhone: '13800000006', companySize: '10-20人', healthScore: 50, aiUsagePercent: 12, expireDate: '2026-08-05', registeredAt: '2026-07-05T00:00:00Z', enabled: true },
  ];
  for (const t of tenants) {
    await db.put('tenants', t);
  }

  // 种子版本矩阵
  const versionFeatures = [
    { feature: '客户管理', versions: { '体验版': '●完整', '基础版': '●完整', '专业版': '●完整', '企业版': '●完整' } },
    { feature: '统一沟通', versions: { '体验版': '●完整', '基础版': '●完整', '专业版': '●完整', '企业版': '●完整' } },
    { feature: 'AI话术推荐', versions: { '体验版': '○不含', '基础版': '○不含', '专业版': '●含1000次', '企业版': '●含无限次' } },
    { feature: 'AI情绪监控', versions: { '体验版': '○不含', '基础版': '○不含', '专业版': '●含', '企业版': '●含' } },
    { feature: 'AI商品推荐', versions: { '体验版': '○不含', '基础版': '○不含', '专业版': '●含', '企业版': '●含' } },
    { feature: '沟通后AI处理', versions: { '体验版': '○不含', '基础版': '○不含', '专业版': '●含', '企业版': '●含' } },
    { feature: '数据看板', versions: { '体验版': '○不含', '基础版': '●基础', '专业版': '●完整', '企业版': '●完整+导出' } },
    { feature: 'API接入', versions: { '体验版': '○不含', '基础版': '○不含', '专业版': '○不含', '企业版': '●含' } },
    { feature: '客户上限', versions: { '体验版': '50', '基础版': '500', '专业版': '5,000', '企业版': '无限' } },
    { feature: '坐席上限', versions: { '体验版': '3', '基础版': '20', '专业版': '100', '企业版': '无限' } },
    { feature: '月价格(¥)', versions: { '体验版': '免费', '基础版': '999', '专业版': '3,999', '企业版': '联系销售' } },
    { feature: '年价格(¥)', versions: { '体验版': '—', '基础版': '9,999', '专业版': '39,999', '企业版': '联系销售' } },
  ];
  for (const vf of versionFeatures) {
    await db.put('versionFeatures', vf);
  }

  // 种子订阅订单
  const orders = [
    { id: 'ORD001', orderNo: 'ORD-20260718-001', tenantId: 'T002', tenantName: '美丽化妆', version: '基础版', amount: 999, paymentMethod: '企业转账', status: 'refunding' as const, refundAmount: 2799, refundReason: '功能不满足需求，已使用15天', createdAt: '2026-07-01', paidAt: '2026-07-01' },
    { id: 'ORD002', orderNo: 'ORD-20260615-001', tenantId: 'T001', tenantName: '健康云科技', version: '专业版', amount: 3999, paymentMethod: '支付宝', status: 'paid' as const, createdAt: '2026-06-15', paidAt: '2026-06-15' },
    { id: 'ORD003', orderNo: 'ORD-20260719-001', tenantId: 'T005', tenantName: '百草堂药业', version: '专业版', amount: 3999, paymentMethod: '微信支付', status: 'paid' as const, createdAt: '2026-07-19', paidAt: '2026-07-19' },
    { id: 'ORD004', orderNo: 'ORD-20251201-001', tenantId: 'T003', tenantName: '同仁堂', version: '企业版', amount: 0, paymentMethod: '对公转账', status: 'paid' as const, createdAt: '2025-12-01', paidAt: '2025-12-01' },
  ];
  for (const o of orders) {
    await db.put('subscriptionOrders', o);
  }

  // 种子AI话术建议
  const aiSuggestions = [
    { id: 'AI001', content: '我们的产品经过FDA认证，安全可靠，在业内拥有良好的口碑。', context: '客户询问产品质量', adopted: false, createdAt: now },
    { id: 'AI002', content: '相比竞品，我们的价格更实惠，而且功能更全面，性价比很高。', context: '客户关注价格', adopted: false, createdAt: now },
    { id: 'AI003', content: '您可以先试用体验版，完全免费，感受一下实际效果再决定。', context: '客户犹豫', adopted: false, createdAt: now },
    { id: 'AI004', content: '我们提供专业的售后服务团队，7x24小时为您解决问题。', context: '客户担心售后', adopted: false, createdAt: now },
  ];
  for (const ai of aiSuggestions) {
    await db.put('aiScriptSuggestions', ai);
  }
}
