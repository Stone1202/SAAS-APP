/**
 * 终端检测公共工具
 * 用于路由匹配和条件渲染
 */

export type Terminal = 'PC' | 'MP' | 'APP' | 'LIVE' | 'UNKNOWN';

/**
 * 从 URL pathname 自动检测当前终端
 */
export function detectTerminal(pathname?: string): Terminal {
  const p = pathname || window.location.pathname;
  if (p.startsWith('/mp/')) return 'MP';
  if (p.startsWith('/app/')) return 'APP';
  if (p.startsWith('/live/')) return 'LIVE';
  if (p.startsWith('/login') || p === '/') return 'PC';
  // PC 后台路由: /dashboard, /orders, /products, /scrm 等
  if (/^\/(dashboard|onboarding|merchants|doctors|nutritionists|pharmacists|products|orders|scrm|finance|ops|data|system|ratings|trainings|categories|otc|coldchain|aftersale|certificates|contracts|config-center|settlement|reconciliation|split|live-mgmt|consultation)/.test(p)) {
    return 'PC';
  }
  return 'UNKNOWN';
}

/**
 * 获取当前终端的底部Tab配置Key前缀
 */
export function getTerminalTabPrefix(): string {
  const t = detectTerminal();
  return t === 'MP' ? 'MP' : t === 'APP' ? 'APP' : t === 'LIVE' ? 'LIVE' : 'PC';
}

/**
 * 根据终端类型获取布局模式
 */
export function getLayoutMode(terminal: Terminal): 'desktop' | 'mobile' {
  return terminal === 'PC' ? 'desktop' : 'mobile';
}

/**
 * 检查是否为移动端终端
 */
export function isMobileTerminal(terminal?: Terminal): boolean {
  const t = terminal || detectTerminal();
  return t === 'MP' || t === 'APP' || t === 'LIVE';
}

export default detectTerminal;
