<template>
  <div class="app-live">
    <HelpButton />
    <div class="phone">
      <div class="status-bar"><span>9:41</span><span>📶 🔋</span></div>

      <div class="live-area" :class="{ended:liveEnded, muted:isMuting}">
        <!-- 音频未激活覆盖层 -->
        <div v-if="!audioReady && !liveEnded" class="audio-activate" @click="activateAudio">
          <div class="activate-icon">🔊</div>
          <div class="activate-text">点击激活音频</div>
          <div class="activate-hint">模拟直播声音 + 擦音/静音效果</div>
        </div>
        <div v-if="!liveEnded" class="stream">
          <div class="bg"></div>
          <div class="top"><span class="badge">🔴 直播中</span><span class="views">👁 1,256</span></div>

          <!-- 静音模式覆盖层 -->
          <transition name="fade">
            <div v-if="isMuting && muteMode==='mute'" class="mute-overlay">
              <div class="mute-icon">🔇</div>
              <div class="mute-text">音频已静音</div>
              <div class="mute-bar"><div class="mute-bar-fill" :style="{width: muteProgress+'%'}"></div></div>
            </div>
          </transition>

          <!-- 擦音模式覆盖层 -->
          <transition name="fade">
            <div v-if="isMuting && muteMode==='beep'" class="beep-overlay">
              <div class="beep-icon">🎧</div>
              <div class="beep-text">敏感词已消音</div>
              <div class="beep-wave"><span v-for="i in 5" :key="i" class="wave-dot" :style="{animationDelay: i*0.1+'s'}"></span></div>
              <div class="beep-hint">嘀———</div>
            </div>
          </transition>

          <div class="anchor"><div class="avatar">美</div><div><div class="name">小美</div><div class="desc">2026夏季新品发布会</div></div><button class="follow">+关注</button></div>
        </div>
        <div v-else class="end"><p>📺</p><p class="end-t">直播已结束</p><p class="end-d">该直播因内容违规已被终止</p></div>
      </div>

      <div class="chat" v-if="!liveEnded">
        <div v-for="m in msgs" :key="m.id" class="msg" :class="{filtered:m.filtered}">
          <span class="u">{{m.user}}</span><span class="t">{{m.filtered?'⚠ 违禁词已过滤':m.text}}</span>
        </div>
      </div>

      <!-- 擦音/静音结果提示 -->
      <transition name="fade">
        <div v-if="showMute" class="toast" :class="{'toast-warn': !lastHasCallback}">
          <span v-if="muteMode==='mute'">🔇 静音处理 · 音频已静音{{lastMuteDuration}}秒</span>
          <span v-else>🎧 擦音处理 · 敏感词已用嘀声替换</span>
          <span v-if="!lastHasCallback" class="toast-warn-text">⚠ 中控室尚未收到此违规回调</span>
        </div>
      </transition>

      <div class="bottom" v-if="!liveEnded">
        <input class="input" placeholder="说点什么..." readonly />
        <button class="btn" @click="showGoods=!showGoods">🛒</button>
        <button class="btn">🎁</button>
        <button class="btn">📤</button>
      </div>
      <transition name="up"><div v-if="showGoods" class="popup">
        <div class="ph">直播商品 <span @click="showGoods=false">×</span></div>
        <div v-for="g in goods" :key="g.id" class="gi"><div class="gimg"></div><div><div class="gn">{{g.name}}</div><div class="gp">¥{{g.price}}</div></div><button class="buy">抢购</button></div>
      </div></transition>
    </div>

    <div class="info">
      <h3>观众直播APP</h3>
      <div class="mode-badge">
        当前擦音模式：<el-tag :type="muteMode==='mute'?'warning':'success'" size="small">{{ muteMode==='mute'?'静音（直接消音）':'擦音（嘀声替换）' }}</el-tag>
        <el-button size="small" text @click="switchMode">切换模式</el-button><InlineHelpMark :uc="buttonUseCases['BTN-009']" />
      </div>
      <table>
        <tr><td>终端</td><td>移动端H5/APP (375px)</td></tr>
        <tr><td>角色</td><td>观众（C端用户）</td></tr>
        <tr><td>静音模式</td><td>检测到违规→音频直接静音（无声音），画面继续</td></tr>
        <tr><td>擦音模式</td><td>检测到违规→敏感词部分用"嘀——"声替换，其他声音正常</td></tr>
        <tr><td>中控无数据</td><td>30%概率模拟回调丢失：APP已擦音但中控室无违规记录</td></tr>
        <tr><td>弹幕审查</td><td>腾讯云IM云端审核（独立于内容审查）</td></tr>
      </table>
      <div class="stats">
        <div class="stat-item"><span class="stat-label">擦音次数</span><span class="stat-val">{{ muteCount }}</span></div>
        <div class="stat-item"><span class="stat-label">静音模式</span><span class="stat-val">{{ muteModeCount }}</span></div>
        <div class="stat-item"><span class="stat-label">擦音模式</span><span class="stat-val">{{ beepModeCount }}</span></div>
        <div class="stat-item"><span class="stat-label">中控无数据</span><span class="stat-val warn">{{ noCallbackCount }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HelpButton from '@/components/audit/HelpButton.vue'
import InlineHelpMark from '@/components/audit/InlineHelpMark.vue'
import { buttonUseCases } from '@/data/use-case-cards'

const liveEnded = ref(false)
const showGoods = ref(false)
const isMuting = ref(false)
const showMute = ref(false)
const muteMode = ref<'mute' | 'beep'>('mute')
const lastHasCallback = ref(true)
const lastMuteDuration = ref(3)
const muteProgress = ref(0)
const audioReady = ref(false)

const muteCount = ref(0)
const muteModeCount = ref(0)
const beepModeCount = ref(0)
const noCallbackCount = ref(0)

const goods = ref([
  { id: 1, name: '夏季防晒霜SPF50+', price: '89' },
  { id: 2, name: '玻尿酸保湿面膜', price: '129' },
  { id: 3, name: '维C亮肤精华液', price: '199' },
])
const msgs = ref([
  { id: 1, user: '用户A', text: '这个防晒霜防水吗？', filtered: false },
  { id: 2, user: '用户B', text: '已下单！期待发货', filtered: false },
  { id: 3, user: '用户C', text: '***', filtered: true },
  { id: 4, user: '用户D', text: '主播皮肤好好啊', filtered: false },
])

// ===== Web Audio API 音频模拟 =====
let audioCtx: AudioContext | null = null
let bgGain: GainNode | null = null       // 背景音增益（控制静音）
let bgOsc1: OscillatorNode | null = null  // 背景音振荡器1（低频环境音）
let bgOsc2: OscillatorNode | null = null  // 背景音振荡器2（模拟人声）
let bgLfo: OscillatorNode | null = null   // LFO调制人声频率（模拟说话起伏）
let bgLfoGain: GainNode | null = null

/** 用户点击激活音频 */
function activateAudio() {
  if (audioCtx) return
  audioCtx = new AudioContext()

  // 背景音增益
  bgGain = audioCtx.createGain()
  bgGain.gain.value = 0.08
  bgGain.connect(audioCtx.destination)

  // 背景音1：低频环境音（200Hz正弦波，模拟直播间的环境嗡嗡声）
  bgOsc1 = audioCtx.createOscillator()
  bgOsc1.type = 'sine'
  bgOsc1.frequency.value = 200
  bgOsc1.connect(bgGain)
  bgOsc1.start()

  // 背景音2：模拟人声（300-500Hz三角波，用LFO调制频率模拟说话起伏）
  const voiceGain = audioCtx.createGain()
  voiceGain.gain.value = 0.04
  voiceGain.connect(audioCtx.destination)

  bgOsc2 = audioCtx.createOscillator()
  bgOsc2.type = 'triangle'
  bgOsc2.frequency.value = 400

  bgLfo = audioCtx.createOscillator()
  bgLfo.type = 'sine'
  bgLfo.frequency.value = 3  // 3Hz调制，模拟说话节奏
  bgLfoGain = audioCtx.createGain()
  bgLfoGain.gain.value = 80   // 频率调制范围±80Hz
  bgLfo.connect(bgLfoGain)
  bgLfoGain.connect(bgOsc2.frequency)
  bgOsc2.connect(voiceGain)
  bgOsc2.start()
  bgLfo.start()

  audioReady.value = true
}

/** 静音模式：背景音静音 */
function doMuteAudio(duration: number) {
  if (!audioCtx || !bgGain) return
  const now = audioCtx.currentTime
  bgGain.gain.cancelScheduledValues(now)
  bgGain.gain.setValueAtTime(bgGain.gain.value, now)
  bgGain.gain.linearRampToValueAtTime(0, now + 0.05)           // 50ms内静音
  bgGain.gain.setValueAtTime(0, now + duration)                 // 保持静音
  bgGain.gain.linearRampToValueAtTime(0.08, now + duration + 0.1) // 恢复
}

/** 擦音模式：嘀声替换背景音 */
function doBeepAudio(duration: number) {
  if (!audioCtx || !bgGain) return
  const now = audioCtx.currentTime

  // 降低背景音
  bgGain.gain.cancelScheduledValues(now)
  bgGain.gain.setValueAtTime(bgGain.gain.value, now)
  bgGain.gain.linearRampToValueAtTime(0.01, now + 0.05)        // 背景音降到极低
  bgGain.gain.setValueAtTime(0.01, now + duration)
  bgGain.gain.linearRampToValueAtTime(0.08, now + duration + 0.1) // 恢复

  // 播放嘀声（1000Hz方波，模拟"嘀——"消音音效）
  const beepOsc = audioCtx.createOscillator()
  const beepGain = audioCtx.createGain()
  beepOsc.type = 'square'
  beepOsc.frequency.value = 1000
  beepGain.gain.value = 0
  beepGain.gain.setValueAtTime(0, now)
  beepGain.gain.linearRampToValueAtTime(0.12, now + 0.02)      // 淡入
  beepGain.gain.setValueAtTime(0.12, now + duration - 0.05)
  beepGain.gain.linearRampToValueAtTime(0, now + duration)     // 淡出
  beepOsc.connect(beepGain)
  beepGain.connect(audioCtx.destination)
  beepOsc.start(now)
  beepOsc.stop(now + duration)
}

let muteTimer: any
let endTimer: any
let progressTimer: any

function getMuteMode(): 'mute' | 'beep' {
  const saved = localStorage.getItem('muteMode')
  return saved === 'beep' ? 'beep' : 'mute'
}

function switchMode() {
  muteMode.value = muteMode.value === 'mute' ? 'beep' : 'mute'
  localStorage.setItem('muteMode', muteMode.value)
}

function triggerMute() {
  muteMode.value = getMuteMode()
  lastMuteDuration.value = 2 + Math.floor(Math.random() * 4)
  lastHasCallback.value = Math.random() > 0.3

  // 播放音频效果
  if (audioReady.value) {
    if (muteMode.value === 'mute') doMuteAudio(lastMuteDuration.value)
    else doBeepAudio(lastMuteDuration.value)
  }

  // 视觉动画
  isMuting.value = true
  muteProgress.value = 0
  const duration = lastMuteDuration.value * 1000
  const startTime = Date.now()
  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    muteProgress.value = Math.min(100, (elapsed / duration) * 100)
    if (muteProgress.value >= 100) { clearInterval(progressTimer); isMuting.value = false }
  }, 50)

  setTimeout(() => {
    showMute.value = true
    setTimeout(() => { showMute.value = false }, 4000)
  }, duration)

  muteCount.value++
  if (muteMode.value === 'mute') muteModeCount.value++
  else beepModeCount.value++
  if (!lastHasCallback.value) noCallbackCount.value++
}

onMounted(() => {
  muteMode.value = getMuteMode()
  function scheduleMute() {
    muteTimer = setTimeout(() => { triggerMute(); scheduleMute() }, 8000 + Math.random() * 7000)
  }
  scheduleMute()
  endTimer = setTimeout(() => {
    liveEnded.value = true
    if (audioCtx) { bgGain?.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1) }
  }, 90000)
})

onUnmounted(() => {
  clearTimeout(muteTimer); clearTimeout(endTimer); clearInterval(progressTimer)
  if (audioCtx) { bgOsc1?.stop(); bgOsc2?.stop(); bgLfo?.stop(); audioCtx.close() }
})
</script>

<style scoped>
.app-live{display:flex;justify-content:center;gap:32px;padding:20px;background:#1a1a1a;min-height:100vh}
.phone{width:375px;height:720px;background:#000;border-radius:32px;overflow:hidden;position:relative;border:8px solid #333}
.status-bar{display:flex;justify-content:space-between;padding:8px 20px;color:#fff;font-size:13px}

.live-area{height:520px;position:relative;background:linear-gradient(135deg,#667eea,#764ba2);transition:filter .3s}
.live-area.ended{background:#1a1a1a}
.live-area.muted{filter:brightness(0.7)}
.bg{width:100%;height:100%;opacity:0.6}

/* 音频激活覆盖层 */
.audio-activate{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:30;cursor:pointer;background:rgba(0,0,0,0.6);padding:32px 48px;border-radius:16px}
.activate-icon{font-size:48px}
.activate-text{color:#fff;font-size:18px;margin-top:8px;font-weight:600}
.activate-hint{color:rgba(255,255,255,0.6);font-size:12px;margin-top:4px}
.audio-activate:hover{background:rgba(0,0,0,0.7)}
.top{position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;z-index:5}
.badge{background:rgba(245,34,45,.9);color:#fff;padding:4px 10px;border-radius:12px;font-size:12px}
.views{background:rgba(0,0,0,.5);color:#fff;padding:4px 10px;border-radius:12px;font-size:12px}
.anchor{position:absolute;bottom:16px;left:12px;right:12px;display:flex;align-items:center;gap:8px;z-index:5}
.avatar{width:36px;height:36px;border-radius:50%;background:#ff5000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px}
.name{color:#fff;font-size:14px;font-weight:600}.desc{color:rgba(255,255,255,.7);font-size:12px}
.follow{background:#ff5000;color:#fff;border:none;padding:6px 16px;border-radius:16px;font-size:13px}

/* 静音覆盖层 */
.mute-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:10}
.mute-icon{font-size:48px}
.mute-text{color:#fff;font-size:16px;margin-top:8px;font-weight:600}
.mute-bar{width:200px;height:4px;background:rgba(255,255,255,.3);border-radius:2px;margin-top:12px;overflow:hidden}
.mute-bar-fill{height:100%;background:#fff;border-radius:2px;transition:width .05s linear}

/* 擦音覆盖层 */
.beep-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:10}
.beep-icon{font-size:48px}
.beep-text{color:#52c41a;font-size:16px;margin-top:8px;font-weight:600}
.beep-wave{display:flex;gap:4px;justify-content:center;margin-top:12px}
.wave-dot{width:6px;height:20px;background:#52c41a;border-radius:3px;animation:wave .6s ease-in-out infinite alternate}
@keyframes wave{0%{height:6px}100%{height:24px}}
.beep-hint{color:rgba(255,255,255,.7);font-size:14px;margin-top:8px;letter-spacing:2px}

.end{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%}
.end-t{font-size:18px;color:#fff;margin:8px 0 4px}.end-d{font-size:13px;color:#999}

.chat{height:140px;overflow-y:auto;padding:8px 12px}
.msg{padding:4px 0;font-size:13px}.u{color:#ff9c9c;margin-right:4px}.t{color:rgba(255,255,255,.9)}
.msg.filtered{opacity:.6}.msg.filtered .t{color:#999;font-style:italic}

.toast{position:absolute;top:300px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;z-index:20;text-align:center;max-width:320px}
.toast-warn{border:1px solid #faad14}
.toast-warn-text{display:block;margin-top:4px;color:#faad14;font-size:12px}
.fade-enter-active,.fade-leave-active{transition:opacity .3s}.fade-enter-from,.fade-leave-to{opacity:0}

.bottom{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#1a1a1a}
.input{flex:1;background:#333;border:none;border-radius:20px;padding:8px 16px;color:#fff;font-size:13px;outline:none}
.btn{background:#333;border:none;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer}

.popup{position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:16px 16px 0 0;max-height:300px;overflow-y:auto}
.ph{padding:12px 16px;font-weight:600;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between}
.gi{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f5f5f5}
.gimg{width:48px;height:48px;border-radius:8px;background:linear-gradient(135deg,#667eea,#764ba2)}
.gn{font-size:14px}.gp{color:#ff5000;font-weight:600;margin-top:4px}
.buy{background:#ff5000;color:#fff;border:none;padding:6px 16px;border-radius:16px;font-size:13px}
.up-enter-active,.up-leave-active{transition:transform .3s}.up-enter-from,.up-leave-to{transform:translateY(100%)}

.info{color:#fff;max-width:420px}.info h3{margin:0 0 16px}
.mode-badge{margin-bottom:16px;display:flex;align-items:center;gap:8px}
.info table{border-collapse:collapse;width:100%;margin-bottom:16px}
.info td{padding:8px 12px;border:1px solid #333;font-size:13px}
.info td:first-child{color:#8c8c8c;width:100px}
.stats{display:flex;gap:16px;flex-wrap:wrap}
.stat-item{display:flex;flex-direction:column;align-items:center;background:#222;padding:12px 16px;border-radius:8px;min-width:80px}
.stat-label{font-size:12px;color:#8c8c8c}
.stat-val{font-size:24px;font-weight:700;color:#1890ff;margin-top:4px}
.stat-val.warn{color:#faad14}
</style>
