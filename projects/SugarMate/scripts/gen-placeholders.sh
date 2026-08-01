#!/bin/bash
# 批量生成剩余占位页面 — SugarMate BA+UX 联合排查报告 P0-P3 全覆盖
BASE="/Users/jojo/Desktop/原型设计/九天科技/AI-SCRM/projects/SugarMate/src/pages"

# MP 子页面模板 (MpPageFrame)
mp_page() {
  mkdir -p "$(dirname "$1")"
  cat > "$1" <<EOF
import React from 'react';
import { Typography, Card } from 'antd';
import MpPageFrame from '../../components/MpPageFrame';
const Page: React.FC = () => (
  <MpPageFrame title="$2">
    <div style={{ padding: 16 }}>
      <Card style={{ borderRadius: 10 }}><Typography.Title level={5}>$2</Typography.Title><Typography.Text type="secondary">内容待补充</Typography.Text></Card>
    </div>
  </MpPageFrame>
);
export default Page;
EOF
}

# APP 子页面模板 (AppPageFrame)
app_page() {
  mkdir -p "$(dirname "$1")"
  cat > "$1" <<EOF
import React from 'react';
import { Typography, Card } from 'antd';
import AppPageFrame from '../../../components/AppPageFrame';
const Page: React.FC = () => (
  <AppPageFrame title="$2">
    <div style={{ padding: 16 }}>
      <Card style={{ borderRadius: 10 }}><Typography.Title level={5}>$2</Typography.Title><Typography.Text type="secondary">内容待补充</Typography.Text></Card>
    </div>
  </AppPageFrame>
);
export default Page;
EOF
}

# PC 子页面模板（无框架，直接渲染内容，由 AppLayout 包裹）
pc_page() {
  mkdir -p "$(dirname "$1")"
  cat > "$1" <<EOF
import React from 'react';
import { Typography, Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const Page: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Typography.Title level={4} style={{ margin: 0 }}>$2</Typography.Title>
      </div>
      <Card style={{ borderRadius: 10 }}><Typography.Text type="secondary">$2 — 内容待补充</Typography.Text></Card>
    </div>
  );
};
export default Page;
EOF
}

# LIVE 子页面模板（MobileFrame 无Tab）
live_page() {
  mkdir -p "$(dirname "$1")"
  cat > "$1" <<EOF
import React from 'react';
import { Typography, Card } from 'antd';
import MobileFrame from '../../../components/MobileFrame';
const Page: React.FC = () => (
  <MobileFrame title="$2" tabs={[]} basePath="/live">
    <div style={{ padding: 16 }}>
      <Card style={{ borderRadius: 10 }}><Typography.Title level={5}>$2</Typography.Title><Typography.Text type="secondary">内容待补充</Typography.Text></Card>
    </div>
  </MobileFrame>
);
export default Page;
EOF
}

# ====== MP 剩余子页面 ======
mp_page "$BASE/mp/MpLiveSchedulePage.tsx" "直播预告"
mp_page "$BASE/mp/MpCommunityPage.tsx" "糖友圈"
mp_page "$BASE/mp/MpInvitePage.tsx" "邀请有礼"
mp_page "$BASE/mp/MpPharmacyDetailPage.tsx" "药房详情"
mp_page "$BASE/mp/MpSharePage.tsx" "在线咨询"

# ====== APP 患者端 - 账号域 ======
app_page "$BASE/app/patient/account/AccountSecurityPage.tsx" "账号安全"
app_page "$BASE/app/patient/account/RoleSwitchPage.tsx" "角色切换"
app_page "$BASE/app/patient/account/HealthProfilePage.tsx" "健康档案"
app_page "$BASE/app/patient/account/PrivacySettingsPage.tsx" "隐私与数据授权"
app_page "$BASE/app/patient/account/FamilyManagePage.tsx" "家属管理"
app_page "$BASE/app/patient/account/RemoteMonitorPage.tsx" "远程监护"
app_page "$BASE/app/patient/account/LanguageSettingsPage.tsx" "多语言设置"

# ====== APP 患者端 - 问诊域 (P0) ======
app_page "$BASE/app/patient/consultation/DoctorSearchPage.tsx" "医生搜索"
app_page "$BASE/app/patient/consultation/DoctorProfilePage.tsx" "医生主页"
app_page "$BASE/app/patient/consultation/ConsultationChatPage.tsx" "问诊对话"
app_page "$BASE/app/patient/consultation/FollowupListPage.tsx" "复诊记录"
app_page "$BASE/app/patient/consultation/DoctorReviewPage.tsx" "医生评价"
app_page "$BASE/app/patient/consultation/EmrViewPage.tsx" "电子病历"
app_page "$BASE/app/patient/consultation/VipServicePage.tsx" "1v1签约服务"
app_page "$BASE/app/patient/consultation/VipDetailPage.tsx" "签约详情"
app_page "$BASE/app/patient/consultation/EmergencySosPage.tsx" "紧急SOS"

# ====== APP 患者端 - 慢病管理 (P0) ======
app_page "$BASE/app/patient/health/CgmBindingPage.tsx" "CGM设备绑定"
app_page "$BASE/app/patient/health/GlucoseManualPage.tsx" "手动血糖录入"
app_page "$BASE/app/patient/health/GlucoseTrendPage.tsx" "血糖趋势分析"
app_page "$BASE/app/patient/health/TirAnalysisPage.tsx" "TIR达标分析"
app_page "$BASE/app/patient/health/AlertDetailPage.tsx" "预警详情"
app_page "$BASE/app/patient/health/Hba1cPredictPage.tsx" "HbA1c预测"
app_page "$BASE/app/patient/health/DietRecordPage.tsx" "饮食记录"
app_page "$BASE/app/patient/health/DietPlanPage.tsx" "饮食方案"
app_page "$BASE/app/patient/health/ExerciseRecordPage.tsx" "运动记录"
app_page "$BASE/app/patient/health/HmServicePage.tsx" "HM服务"
app_page "$BASE/app/patient/health/HealthReportPage.tsx" "健康报告"

# ====== APP 患者 - 处方&商城 (P1) ======
app_page "$BASE/app/patient/prescription/PrescriptionListPage.tsx" "处方列表"
app_page "$BASE/app/patient/prescription/PrescriptionDetailPage.tsx" "处方详情"
app_page "$BASE/app/patient/prescription/PharmacistReviewPage.tsx" "药师审核"
app_page "$BASE/app/patient/prescription/RefillRequestPage.tsx" "续方申请"
app_page "$BASE/app/patient/prescription/DrugInteractionPage.tsx" "药物相互作用"
app_page "$BASE/app/patient/prescription/MedReminderPage.tsx" "用药提醒"
app_page "$BASE/app/patient/prescription/RxPriceComparePage.tsx" "处方流转比价"

app_page "$BASE/app/patient/mall/MallSearchPage.tsx" "商品搜索"
app_page "$BASE/app/patient/mall/ProductDetailPage.tsx" "商品详情"
app_page "$BASE/app/patient/mall/CartPage.tsx" "购物车"
app_page "$BASE/app/patient/mall/OrderConfirmPage.tsx" "下单确认"
app_page "$BASE/app/patient/mall/PaymentPage.tsx" "支付"
app_page "$BASE/app/patient/mall/RxZonePage.tsx" "处方药专区"
app_page "$BASE/app/patient/mall/ProductReviewPage.tsx" "商品评价"
app_page "$BASE/app/patient/mall/OrderListPage.tsx" "订单列表"
app_page "$BASE/app/patient/mall/OrderDetailPage.tsx" "订单详情"
app_page "$BASE/app/patient/mall/ColdchainTrackPage.tsx" "冷链配送追踪"
app_page "$BASE/app/patient/mall/AftersalePage.tsx" "退款/售后"
app_page "$BASE/app/patient/mall/AdrReportPage.tsx" "ADR不良反应上报"

# ====== APP 患者 - 社区 (P1) ======
app_page "$BASE/app/patient/community/PostDetailPage.tsx" "帖子详情"
app_page "$BASE/app/patient/community/PostCreatePage.tsx" "发布帖子"
app_page "$BASE/app/patient/community/TopicSquarePage.tsx" "话题广场"
app_page "$BASE/app/patient/community/TopicDetailPage.tsx" "话题详情"
app_page "$BASE/app/patient/community/FollowListPage.tsx" "关注/粉丝"
app_page "$BASE/app/patient/community/CreatorProfilePage.tsx" "达人主页"
app_page "$BASE/app/patient/community/FeaturedPage.tsx" "精华推荐"
app_page "$BASE/app/patient/community/OfficialProfilePage.tsx" "官方账号"
app_page "$BASE/app/patient/community/CircleDetailPage.tsx" "糖友圈社群"

# ====== APP 患者 - 会员 (P1) ======
app_page "$BASE/app/patient/member/PointsCenterPage.tsx" "积分中心"
app_page "$BASE/app/patient/member/CheckinPage.tsx" "签到"
app_page "$BASE/app/patient/member/CouponCenterPage.tsx" "优惠券中心"

# ====== APP 医生端 (P2) ======
app_page "$BASE/app/doctor/PatientDetailPage.tsx" "患者详情"
app_page "$BASE/app/doctor/DiagnosisWritePage.tsx" "诊断书写"
app_page "$BASE/app/doctor/EPrescriptionPage.tsx" "电子处方"
app_page "$BASE/app/doctor/IncomeDetailPage.tsx" "收入明细"
app_page "$BASE/app/doctor/ReviewManagePage.tsx" "评价管理"
app_page "$BASE/app/doctor/ProfileEditPage.tsx" "主页编辑"
app_page "$BASE/app/doctor/CredentialsPage.tsx" "执业信息"

# ====== APP 营养师端 (P2) ======
app_page "$BASE/app/nutritionist/DietTemplatesPage.tsx" "方案模板库"
app_page "$BASE/app/nutritionist/DietTrackingPage.tsx" "方案执行追踪"
app_page "$BASE/app/nutritionist/IncomeDetailPage.tsx" "收入明细"

# ====== APP HM端 (P2) ======
app_page "$BASE/app/hm/VisitExecPage.tsx" "回访执行"
app_page "$BASE/app/hm/ServiceStatsPage.tsx" "服务统计"

# ====== PC 后台详情/编辑子页面 (P1) ======
pc_page "$BASE/pc/sub/MerchantDetailPage.tsx" "药房详情"
pc_page "$BASE/pc/sub/DoctorDetailPage.tsx" "医生详情"
pc_page "$BASE/pc/sub/CustomerDetailPage.tsx" "客户详情"
pc_page "$BASE/pc/sub/TagDetailPage.tsx" "标签详情"
pc_page "$BASE/pc/sub/SopCreatePage.tsx" "新建SOP规则"
pc_page "$BASE/pc/sub/ProductCreatePage.tsx" "商品上架"
pc_page "$BASE/pc/sub/ProductEditPage.tsx" "商品编辑"
pc_page "$BASE/pc/sub/BannerCreatePage.tsx" "Banner创建"
pc_page "$BASE/pc/sub/BannerEditPage.tsx" "Banner编辑"
pc_page "$BASE/pc/sub/ActivityCreatePage.tsx" "创建活动"
pc_page "$BASE/pc/sub/SettlementDetailPage.tsx" "结算单详情"
pc_page "$BASE/pc/sub/TrainingCoursePage.tsx" "培训课程"
pc_page "$BASE/pc/sub/TrainingExamPage.tsx" "考试管理"

# ====== LIVE 直播端子页面 (P3) ======
live_page "$BASE/live/CreateRoomPage.tsx" "创建直播间"
live_page "$BASE/live/PushConfigPage.tsx" "推流配置"
live_page "$BASE/live/BeautyFilterPage.tsx" "美颜设置"
live_page "$BASE/live/DanmakuPage.tsx" "弹幕管理"
live_page "$BASE/live/RecordingPage.tsx" "录制管理"
live_page "$BASE/live/ReplayPage.tsx" "回放"
live_page "$BASE/live/LiveStatsPage.tsx" "直播数据统计"
live_page "$BASE/live/AuditCenterPage.tsx" "安全审核"
live_page "$BASE/live/KnowledgeLivePage.tsx" "科普直播"
live_page "$BASE/live/LectureLivePage.tsx" "讲堂直播"
live_page "$BASE/live/ShoppingLivePage.tsx" "直播带货"
live_page "$BASE/live/QaSessionPage.tsx" "互动问答"
live_page "$BASE/live/SubscriptionsPage.tsx" "关注订阅"
live_page "$BASE/live/PlanManagePage.tsx" "计划管理"
live_page "$BASE/live/QualificationPage.tsx" "资质管理"
live_page "$BASE/live/LiveProductPage.tsx" "直播商品管理"
live_page "$BASE/live/RiskControlPage.tsx" "风控"
live_page "$BASE/live/IncomeSettlePage.tsx" "收入结算"

echo "✅ 占位页面生成完毕"
