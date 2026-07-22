/**
 * adb 工具函数
 *
 * 负责：设备检测、端口转发、APP启停
 */

import { execSync } from 'child_process';
import { config } from '../config.js';

/** 执行 adb 命令 */
function adb(args: string): string {
  try {
    return execSync(`adb ${args}`, { encoding: 'utf-8', timeout: 10000 }).trim();
  } catch (e: any) {
    throw new Error(`adb命令失败: adb ${args}\n${e.stderr || e.message}`);
  }
}

/** 检查是否有已连接的设备/模拟器 */
export function listDevices(): string[] {
  const output = adb('devices');
  const lines = output.split('\n').slice(1); // 跳过第一行 "List of devices attached"
  return lines
    .map(l => l.trim().split('\t')[0])
    .filter(l => l.length > 0);
}

/** 确保至少有一台设备连接，返回设备ID */
export function ensureDevice(): string {
  const devices = listDevices();
  if (devices.length === 0) {
    throw new Error(
      '❌ 未检测到Android设备/模拟器\n' +
      '   请先启动Android模拟器，或用USB连接真机并开启USB调试模式\n' +
      '   模拟器推荐: Android Studio → AVD Manager → 创建模拟器'
    );
  }
  console.log(`✅ 检测到设备: ${devices.join(', ')}`);
  return devices[0];
}

/**
 * 建立 adb 端口转发
 * 将手机内部 WebView 调试端口转发到电脑本地
 */
export function setupForward(): void {
  const { forwardPort, socketName } = config.adb;
  // 先清除可能存在的旧转发
  try { adb(`forward --remove tcp:${forwardPort}`); } catch {}
  // 建立新转发
  adb(`forward tcp:${forwardPort} localabstract:${socketName}`);
  console.log(`✅ 端口转发已建立: localhost:${forwardPort} → 设备:${socketName}`);
}

/** 启动 APP */
export function launchApp(): void {
  adb(`shell monkey -p ${config.app.package} -c android.intent.category.LAUNCHER 1`);
  console.log(`✅ 已启动APP: ${config.app.appName} (${config.app.package})`);
}

/** 关闭 APP（用例间重置状态） */
export function stopApp(): void {
  adb(`shell am force-stop ${config.app.package}`);
  console.log(`✅ 已关闭APP: ${config.app.appName}`);
}

/** 检查 APP 是否已安装 */
export function isAppInstalled(): boolean {
  try {
    const result = adb(`shell pm list packages ${config.app.package}`);
    return result.length > 0;
  } catch {
    return false;
  }
}

/** 安装 APK */
export function installApp(apkPath: string): void {
  console.log(`📦 正在安装APK: ${apkPath}`);
  adb(`install -r "${apkPath}"`);
  console.log(`✅ APK安装完成`);
}
