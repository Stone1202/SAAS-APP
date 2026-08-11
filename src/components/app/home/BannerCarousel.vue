<template>
  <!-- 广告轮播 — 图片优先，未上传图片时显示标题卡片 -->
  <div class="banner-carousel">
    <div class="banner-track" :style="{ transform: `translateX(-${current * 100}%)` }">
      <div
        v-for="banner in banners"
        :key="banner.ad_id"
        class="banner-slide"
        @click="onClick(banner)"
      >
        <!-- 有图片：用图片作为背景 -->
        <img v-if="banner.image_url" :src="banner.image_url" class="banner-img" />
        <!-- 无图片：标题卡片 -->
        <div v-else class="banner-text-card">
          <div class="btc-title">{{ banner.title }}</div>
        </div>
      </div>
    </div>
    <!-- 指示器 -->
    <div class="banner-dots" v-if="banners.length > 1">
      <span
        v-for="(_, idx) in banners"
        :key="idx"
        :class="['dot', { active: idx === current }]"
        @click="goTo(idx)"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{ banners: any[] }>();
const emit = defineEmits<{ click: [banner: any] }>();

const current = ref(0);
let timer: number | undefined;

function startAutoPlay() {
  stopAutoPlay();
  if (props.banners.length <= 1) return;
  timer = window.setInterval(() => {
    current.value = (current.value + 1) % props.banners.length;
  }, 3500);
}
function stopAutoPlay() { if (timer) clearInterval(timer); }
function goTo(idx: number) { current.value = idx; }

function onClick(banner: any) {
  emit('click', banner);
}

onMounted(startAutoPlay);
onUnmounted(stopAutoPlay);
watch(() => props.banners, startAutoPlay);
</script>

<style scoped>
.banner-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f5f5f5;
}
.banner-track { display: flex; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.banner-slide {
  flex: 0 0 100%;
  height: 130px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 标题卡片（无图片时的占位） */
.banner-text-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}
.btc-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  text-align: center;
  line-height: 1.4;
}

.banner-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 2;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.2s;
}
.dot.active { width: 16px; background: rgba(0,0,0,0.7); }
</style>