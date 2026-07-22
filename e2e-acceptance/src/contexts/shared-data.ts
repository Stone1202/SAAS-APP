/**
 * 共享数据上下文
 *
 * 跨端验收的核心：一个测试用例内，各端共享数据池。
 * 用 ID 做跨端锚点，不靠文案匹配。
 */

export class SharedDataContext {
  private store: Map<string, any> = new Map();

  /** 写入共享数据 */
  set(key: string, value: any): void {
    this.store.set(key, value);
    console.log(`  📦 [共享数据] ${key} = ${JSON.stringify(value)}`);
  }

  /** 读取共享数据 */
  get<T = any>(key: string): T {
    return this.store.get(key) as T;
  }

  /** 检查是否存在 */
  has(key: string): boolean {
    return this.store.has(key);
  }

  /** 清空（用例结束时调用） */
  clear(): void {
    this.store.clear();
  }

  /** 打印当前所有数据（调试用） */
  dump(): void {
    console.log('  📦 [共享数据快照]');
    for (const [k, v] of this.store) {
      console.log(`     ${k} = ${JSON.stringify(v)}`);
    }
  }
}

/** 全局共享数据实例（一个验收用例内共享） */
export const sharedData = new SharedDataContext();
