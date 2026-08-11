<template>
  <!-- 收货地址管理 — UC-SHP-MINE-003 -->
  <div class="address-manage">
    <!-- 导航 -->
    <div class="am-nav">
      <div class="amn-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="amn-title">我的收货地址</div>
      <div class="amn-add" @click="startAdd">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </div>

    <!-- 地址列表 -->
    <div class="am-list" v-if="addresses.length">
      <div
        v-for="addr in addresses"
        :key="addr.address_id"
        class="am-item"
      >
        <div class="ami-info" @click="startEdit(addr)">
          <div class="ami-recipient">
            <span class="ami-name">{{ addr.recipient_name }}</span>
            <span class="ami-phone">{{ maskPhone(addr.phone) }}</span>
            <span class="ami-default" v-if="addr.is_default">默认</span>
          </div>
          <div class="ami-address">
            <span class="ami-region">{{ addr.province }}{{ addr.city }}{{ addr.district }}</span>
            <span class="ami-detail">{{ addr.detail_address }}</span>
          </div>
        </div>
        <div class="ami-actions">
          <span class="ami-btn ami-edit" @click="startEdit(addr)">编辑</span>
          <span class="ami-btn ami-del" @click="deleteAddress(addr.address_id)">删除</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="am-empty" v-else>
      <span class="ame-icon">📍</span>
      <span class="ame-text">暂无收货地址</span>
      <span class="ame-btn" @click="startAdd">新增收货地址</span>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div class="am-modal" v-if="showForm">
      <div class="amm-mask" @click="closeForm"></div>
      <div class="amm-sheet">
        <div class="amm-header">
          <span class="amm-cancel" @click="closeForm">取消</span>
          <span class="amm-title">{{ editingId ? '编辑地址' : '新增地址' }}</span>
          <span class="amm-save" @click="saveAddress">保存</span>
        </div>
        <div class="amm-body">
          <div class="amb-field">
            <span class="amb-label">收货人</span>
            <input
              v-model="form.recipient_name"
              class="amb-input"
              placeholder="请输入收货人姓名"
              maxlength="20"
            />
          </div>
          <div class="amb-field">
            <span class="amb-label">手机号</span>
            <input
              v-model="form.phone"
              class="amb-input"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </div>
          <div class="amb-field">
            <span class="amb-label">所在地区</span>
            <input
              v-model="form.province"
              class="amb-input amb-input-short"
              placeholder="省"
            />
            <input
              v-model="form.city"
              class="amb-input amb-input-short"
              placeholder="市"
            />
            <input
              v-model="form.district"
              class="amb-input amb-input-short"
              placeholder="区"
            />
          </div>
          <div class="amb-field">
            <span class="amb-label">详细地址</span>
            <textarea
              v-model="form.detail_address"
              class="amb-input amb-textarea"
              placeholder="请输入详细地址（5-100字符）"
              maxlength="100"
            />
          </div>
          <div class="amb-field amb-field-default">
            <span class="amb-label">设为默认</span>
            <span
              :class="['amb-switch', { active: form.is_default }]"
              @click="form.is_default = !form.is_default"
            >
              <span class="ambs-dot"></span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="safe-bottom"></div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-005A', '收货地址管理页');
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user-store';
import type { ShippingAddress } from '../../../contracts';

const router = useRouter();
const userStore = useUserStore();

// 地址列表 — 从user-store读取（持久化到localStorage）
const addresses = ref<ShippingAddress[]>(userStore.shippingAddresses);

// 表单状态
const showForm = ref(false);
const editingId = ref('');
const form = reactive({
  recipient_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false,
});

function startAdd() {
  editingId.value = '';
  form.recipient_name = '';
  form.phone = '';
  form.province = '';
  form.city = '';
  form.district = '';
  form.detail_address = '';
  form.is_default = false;
  showForm.value = true;
}

function startEdit(addr: ShippingAddress) {
  editingId.value = addr.address_id;
  form.recipient_name = addr.recipient_name;
  form.phone = addr.phone;
  form.province = addr.province;
  form.city = addr.city;
  form.district = addr.district;
  form.detail_address = addr.detail_address;
  form.is_default = addr.is_default;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

function saveAddress() {
  // 表单校验
  if (!form.recipient_name.trim()) {
    alert('请输入收货人姓名');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    alert('请输入正确的手机号');
    return;
  }
  if (!form.province || !form.city || !form.district) {
    alert('请选择省市区');
    return;
  }
  if (form.detail_address.length < 5) {
    alert('详细地址至少5个字符');
    return;
  }

  const addrData = {
    user_id: 'user-001',
    recipient_name: form.recipient_name,
    phone: form.phone,
    province: form.province,
    city: form.city,
    district: form.district,
    detail_address: form.detail_address,
    is_default: form.is_default,
  };

  if (editingId.value) {
    // 编辑 — 调用store方法
    userStore.updateAddress(editingId.value, addrData);
  } else {
    // 新增 — 调用store方法
    userStore.addAddress(addrData);
  }

  // 重新同步地址列表（store内部已处理默认地址互斥）
  addresses.value = [...userStore.shippingAddresses];
  showForm.value = false;
}

function deleteAddress(id: string) {
  if (confirm('确定删除该收货地址？')) {
    userStore.deleteAddress(id);
    addresses.value = [...userStore.shippingAddresses];
  }
}

function maskPhone(phone: string) {
  if (phone.length === 11) {
    return phone.slice(0, 3) + '****' + phone.slice(7);
  }
  return phone;
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.address-manage {
  background: #f5f5f5;
  min-height: 100vh;
}

/* 导航 */
.am-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.amn-back, .amn-add {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
}
.amn-back:active, .amn-add:active { background: #f0f0f0; }
.amn-title { font-size: 17px; font-weight: 600; color: #111; }

/* 地址列表 */
.am-list { padding: 10px 12px; }
.am-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
}
.ami-info { flex: 1; cursor: pointer; }
.ami-recipient { display: flex; align-items: center; gap: 10px; }
.ami-name { font-size: 15px; font-weight: 600; color: #111; }
.ami-phone { font-size: 13px; color: #666; }
.ami-default {
  padding: 1px 6px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 10px;
  border-radius: 4px;
}
.ami-address {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
.ami-region { display: block; }
.ami-detail { display: block; margin-top: 2px; }
.ami-actions { display: flex; gap: 12px; margin-left: 12px; }
.ami-btn { font-size: 13px; cursor: pointer; }
.ami-edit { color: #FF6B35; }
.ami-del { color: #999; }

/* 空状态 */
.am-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 12px;
}
.ame-icon { font-size: 56px; opacity: 0.3; }
.ame-text { font-size: 14px; color: #999; }
.ame-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
}

/* 弹窗 */
.am-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
}
.amm-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
}
.amm-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 414px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
  overflow-y: auto;
}
.amm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.amm-cancel { font-size: 14px; color: #999; cursor: pointer; }
.amm-title { font-size: 16px; font-weight: 600; color: #111; }
.amm-save { font-size: 14px; color: #FF6B35; font-weight: 600; cursor: pointer; }

.amm-body { padding: 16px; }
.amb-field { margin-bottom: 16px; }
.amb-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.amb-field-default {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.amb-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  box-sizing: border-box;
}
.amb-input:focus { outline: none; border-color: #FF6B35; background: #fff; }
.amb-input-short { width: 32%; display: inline-block; margin-right: 2%; }
.amb-input-short:last-child { margin-right: 0; }
.amb-textarea { min-height: 80px; resize: none; font-family: inherit; }

/* 开关 */
.amb-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #ddd;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.amb-switch.active { background: #FF6B35; }
.amb-switch .ambs-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}
.amb-switch.active .ambs-dot { transform: translateX(20px); }

.safe-bottom { height: 24px; }
</style>
