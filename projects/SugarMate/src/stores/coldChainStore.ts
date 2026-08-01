/**
 * coldChainStore V1.0.0 — 冷链数据管理
 *
 * 管理冷链配送全链路实时数据：
 * - 温湿度实时监控
 * - 冷链轨迹时间线
 * - 异常告警事件
 * - 设备/容器信息
 *
 * 场景2A 关联：SM-03 SHIPPED → SM-05 冷链配送
 */
import { create } from 'zustand';

// ===== 类型定义 =====

export interface TemperaturePoint {
  time: string;       // HH:mm
  temp: number;       // °C
  humidity: number;   // %
}

export interface ColdChainAlert {
  id: string;
  time: string;
  type: 'TEMP_HIGH' | 'TEMP_LOW' | 'HUMIDITY_HIGH' | 'HUMIDITY_LOW' | 'BATTERY_LOW' | 'SIGNAL_LOST';
  level: 'info' | 'warning' | 'error';
  description: string;
  resolved: boolean;
}

export interface ColdChainDevice {
  container_id: string;
  container_type: string;
  vehicle_plate?: string;
  battery_level: number;  // 0-100
  signal_strength: string;
  last_online: number;
}

export interface ColdChainLogistics {
  order_id: string;
  tracking_no: string;
  carrier: string;
  status: 'PREPARING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  eta: string;            // 预计送达
  origin: string;
  destination: string;
  current_location: string;
  events: ColdChainLogisticsEvent[];
}

export interface ColdChainLogisticsEvent {
  time: string;
  location: string;
  status: string;
  temperature?: number;
}

export interface ColdChainState {
  /** 温度历史数据 */
  temperatureHistory: TemperaturePoint[];
  /** 实时温度 */
  currentTemp: number;
  /** 实时湿度 */
  currentHumidity: number;
  /** 异常告警列表 */
  alerts: ColdChainAlert[];
  /** 设备信息 */
  device: ColdChainDevice | null;
  /** 物流信息 */
  logistics: ColdChainLogistics | null;
  /** 当前监控的订单ID */
  activeOrderId: string | null;
  /** 是否正在实时轮询 */
  polling: boolean;

  // Actions
  /** 开始监控某订单的冷链数据 */
  startMonitoring: (orderId: string) => void;
  /** 停止监控 */
  stopMonitoring: () => void;
  /** 模拟获取最新温湿度 */
  fetchLatestReading: () => void;
  /** 加载历史温度数据 */
  loadTemperatureHistory: (hours?: number) => void;
  /** 加载物流信息 */
  loadLogistics: (orderId: string) => void;
  /** 确认告警 */
  resolveAlert: (alertId: string) => void;
  /** 获取温度状态 */
  getTemperatureStatus: () => { normal: boolean; label: string };
  /** 获取湿度状态 */
  getHumidityStatus: () => { normal: boolean; label: string };
}

// ===== 常量 =====
const TEMP_MIN = 2;
const TEMP_MAX = 8;
const HUMIDITY_MIN = 35;
const HUMIDITY_MAX = 75;

// 模拟温度曲线（带周期性波动+随机噪声）
function generateTempHistory(hours: number): TemperaturePoint[] {
  const data: TemperaturePoint[] = [];
  for (let h = hours; h >= 0; h--) {
    const time = new Date(Date.now() - h * 3600000);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    data.push({
      time: timeStr,
      temp: +(2.5 + Math.sin(h * 0.7) * 2.5 + Math.random() * 1.2).toFixed(1),
      humidity: +(45 + Math.cos(h * 0.4) * 15 + Math.random() * 5).toFixed(1),
    });
  }
  return data;
}

// 模拟物流轨迹
function generateLogistics(orderId: string): ColdChainLogistics {
  return {
    order_id: orderId,
    tracking_no: `SF${Date.now().toString(36).toUpperCase().slice(-8)}`,
    carrier: '顺丰医药冷链',
    status: 'IN_TRANSIT',
    eta: '预计 1-2 天送达',
    origin: '广州·大参林药房总仓',
    destination: '深圳·南山患者地址',
    current_location: '深圳集散中心',
    events: [
      { time: new Date(Date.now() - 3600000).toLocaleString(), location: '深圳集散中心', status: '运输中', temperature: 2.8 },
      { time: new Date(Date.now() - 10800000).toLocaleString(), location: '广州天河集散中心', status: '已发出', temperature: 2.5 },
      { time: new Date(Date.now() - 54000000).toLocaleString(), location: '广州·药房冷库', status: '已揽收', temperature: 2.3 },
    ],
  };
}

// 模拟设备信息
function generateDevice(): ColdChainDevice {
  return {
    container_id: `CC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    container_type: '主动制冷·医用保温箱',
    vehicle_plate: '粤B·CHXXX',
    battery_level: 78 + Math.floor(Math.random() * 15),
    signal_strength: '强',
    last_online: Date.now(),
  };
}

// 模拟告警（随机生成少量）
function generateAlerts(tempData: TemperaturePoint[]): ColdChainAlert[] {
  const alerts: ColdChainAlert[] = [];
  for (let i = 0; i < tempData.length; i++) {
    if (tempData[i].temp > TEMP_MAX) {
      alerts.push({
        id: `alert-${i}`,
        time: tempData[i].time,
        type: 'TEMP_HIGH',
        level: 'warning',
        description: `温度偏高 ${tempData[i].temp}°C（上限${TEMP_MAX}°C）`,
        resolved: false,
      });
    } else if (tempData[i].temp < TEMP_MIN) {
      alerts.push({
        id: `alert-${i}`,
        time: tempData[i].time,
        type: 'TEMP_LOW',
        level: 'error',
        description: `温度偏低 ${tempData[i].temp}°C（下限${TEMP_MIN}°C）`,
        resolved: false,
      });
    }
    if (tempData[i].humidity > HUMIDITY_MAX) {
      alerts.push({
        id: `alert-h-${i}`,
        time: tempData[i].time,
        type: 'HUMIDITY_HIGH',
        level: 'info',
        description: `湿度过高 ${tempData[i].humidity}%（上限${HUMIDITY_MAX}%）`,
        resolved: false,
      });
    }
  }
  return alerts.slice(-8);
}

// ===== Store =====
export const useColdChainStore = create<ColdChainState>((set, get) => ({
  temperatureHistory: [],
  currentTemp: 0,
  currentHumidity: 0,
  alerts: [],
  device: null,
  logistics: null,
  activeOrderId: null,
  polling: false,

  startMonitoring: (orderId: string) => {
    const state = get();
    if (state.activeOrderId === orderId) return;

    // 初始化数据
    const history = generateTempHistory(24);
    const latest = history[history.length - 1];

    set({
      activeOrderId: orderId,
      temperatureHistory: history,
      currentTemp: latest?.temp || 0,
      currentHumidity: latest?.humidity || 0,
      alerts: generateAlerts(history),
      device: generateDevice(),
      logistics: generateLogistics(orderId),
      polling: true,
    });

    // 模拟实时轮询（每5秒更新一次）
    const interval = setInterval(() => {
      const s = get();
      if (!s.polling) {
        clearInterval(interval);
        return;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newTemp = +(2.5 + Math.sin(now.getHours() * 0.8) * 2.5 + Math.random() * 1.2).toFixed(1);
      const newHumidity = +(45 + Math.cos(now.getHours() * 0.5) * 15 + Math.random() * 5).toFixed(1);

      set(s => ({
        currentTemp: newTemp,
        currentHumidity: newHumidity,
        temperatureHistory: [...s.temperatureHistory.slice(-47), { time: timeStr, temp: newTemp, humidity: newHumidity }],
        device: s.device ? {
          ...s.device,
          battery_level: Math.max(0, (s.device.battery_level || 80) - Math.random() * 0.5),
          last_online: Date.now(),
        } : null,
      }));

      // 检查温度越界
      if (newTemp > TEMP_MAX || newTemp < TEMP_MIN) {
        const alertId = `alert-realtime-${Date.now()}`;
        set(s => ({
          alerts: [...s.alerts, {
            id: alertId,
            time: timeStr,
            type: newTemp > TEMP_MAX ? 'TEMP_HIGH' : 'TEMP_LOW',
            level: 'warning',
            description: `实时告警：温度${newTemp > TEMP_MAX ? '偏高' : '偏低'} ${newTemp}°C`,
            resolved: false,
          }],
        }));
      }
    }, 5000);
  },

  stopMonitoring: () => {
    set({ polling: false, activeOrderId: null });
  },

  fetchLatestReading: () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTemp = +(2.5 + Math.sin(now.getHours() * 0.8) * 2.5 + Math.random() * 1.2).toFixed(1);
    const newHumidity = +(45 + Math.cos(now.getHours() * 0.5) * 15 + Math.random() * 5).toFixed(1);

    set(s => ({
      currentTemp: newTemp,
      currentHumidity: newHumidity,
      temperatureHistory: [...s.temperatureHistory.slice(-47), { time: timeStr, temp: newTemp, humidity: newHumidity }],
    }));
  },

  loadTemperatureHistory: (hours = 24) => {
    const history = generateTempHistory(hours);
    const latest = history[history.length - 1];
    set({
      temperatureHistory: history,
      currentTemp: latest?.temp || 0,
      currentHumidity: latest?.humidity || 0,
    });
  },

  loadLogistics: (orderId: string) => {
    set({ logistics: generateLogistics(orderId) });
  },

  resolveAlert: (alertId: string) => {
    set(s => ({
      alerts: s.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a),
    }));
  },

  getTemperatureStatus: () => {
    const { currentTemp } = get();
    const normal = currentTemp >= TEMP_MIN && currentTemp <= TEMP_MAX;
    return {
      normal,
      label: normal ? '正常' : currentTemp > TEMP_MAX ? '温度偏高' : '温度偏低',
    };
  },

  getHumidityStatus: () => {
    const { currentHumidity } = get();
    const normal = currentHumidity >= HUMIDITY_MIN && currentHumidity <= HUMIDITY_MAX;
    return {
      normal,
      label: normal ? '正常' : currentHumidity > HUMIDITY_MAX ? '湿度过高' : '湿度过低',
    };
  },
}));

export { TEMP_MIN, TEMP_MAX, HUMIDITY_MIN, HUMIDITY_MAX };
