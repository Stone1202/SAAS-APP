/**
 * SugarMate 全终端路由注册 (V4.0.0 — BA+UX 联合排查报告 全量覆盖版)
 * 
 * 终端通过 URL 路径独立访问，可同时打开 4 个标签页：
 *   /            → 首页（4 终端入口卡片）
 *   /login       → 登录页
 *   /dashboard/* → PC 后台（侧边栏 + 内容区）
 *   /mp/*        → 微信小程序（手机框）
 *   /app/*       → APP 移动端（手机框 + 角色切换）
 *   /live/*      → 直播端（手机框）
 * 
 * 路由变更日志：V4.0.0 基于 BA+UX 联合排查报告，补齐 90+ 缺失路由
 */
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useUserStore } from '@/stores/userStore';
import AppLayout from './components/AppLayout';

// HashRouter 的 basename 必须固定为 /，不能跟随 Vite base path。
// Vite base path 只影响静态资源加载路径；hash 路由的匹配与文档路径无关。
const ROUTER_BASENAME = '/';

// ============ 首页 & 登录 & 入驻 & 门户 ============
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PortalPage from './pages/PortalPage';
import OnboardingApplyPage from './pages/OnboardingApplyPage';
import OnboardingStatusPage from './pages/OnboardingStatusPage';

// ============ 双端 APP（患者端 + 医管端）============
import PatientLoginPage from './pages/patient/PatientLoginPage';
import PatientRegisterPage from './pages/patient/PatientRegisterPage';
import MedicalLoginPage from './pages/medical/MedicalLoginPage';
import PatientApp from './apps/PatientApp';
import MedicalApp from './apps/MedicalApp';

// ============ PC 后台页面 ============
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import MerchantListPage from './pages/MerchantListPage';
import DoctorManagePage from './pages/DoctorManagePage';
import PharmacistManagePage from './pages/PharmacistManagePage';
import NutritionistManagePage from './pages/NutritionistManagePage';
import CertificateCenterPage from './pages/CertificateCenterPage';
import ContractManagePage from './pages/ContractManagePage';
import MerchantRatingPage from './pages/MerchantRatingPage';
// import TrainingManagePage from './pages/TrainingManagePage'; // 培训流程已移除
import ConfigCenterPage from './pages/ConfigCenterPage';
import CustomerPoolPage from './pages/CustomerPoolPage';
import TagManagePage from './pages/TagManagePage';
import SOPManagePage from './pages/SOPManagePage';
import CampaignManagePage from './pages/CampaignManagePage';
import ConversionPage from './pages/ConversionPage';
import ConversationArchivePage from './pages/ConversationArchivePage';
import LeadsManagePage from './pages/LeadsManagePage';
import ProductManagePage from './pages/ProductManagePage';
import OTCReviewPage from './pages/OTCReviewPage';
import CategoryManagePage from './pages/CategoryManagePage';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ColdChainMonitorPage from './pages/ColdChainMonitorPage';
import AftersaleManagePage from './pages/AftersaleManagePage';
// 药店管理 & 商品审核 (V2.2.0)
import PharmacyProductPage from './pages/pc/pharmacy/PharmacyProductPage';
import PharmacyOrderPage from './pages/pc/pharmacy/PharmacyOrderPage';
import ProductAuditPage from './pages/pc/pharmacy/ProductAuditPage';
import SettlementManagePage from './pages/SettlementManagePage';
import ReconciliationPage from './pages/ReconciliationPage';
import SplitConfigPage from './pages/SplitConfigPage';
import BannerManagePage from './pages/BannerManagePage';
import ContentReviewPage from './pages/ContentReviewPage';
import ActivityManagePage from './pages/ActivityManagePage';
import TicketManagePage from './pages/TicketManagePage';
import ComplaintPage from './pages/ComplaintPage';
import BizDashboardPage from './pages/BizDashboardPage';
import ConsultationMonitor from './pages/admin/ConsultationMonitor';
import ConsultationServiceManagePage from './pages/admin/consultation/ConsultationServiceManagePage';
import ConsultationOrderManagePage from './pages/admin/consultation/ConsultationOrderManagePage';
import PrescriptionManagePage from './pages/admin/consultation/PrescriptionManagePage';
import RolePermissionPage from './pages/RolePermissionPage';
import SystemConfigPage from './pages/SystemConfigPage';

// ============ PC 后台 - 直播管理模块 ============
import LiveBroadcastPlanPage from './pages/pc/live/LiveBroadcastPlanPage';
import LiveSessionPage from './pages/pc/live/LiveSessionPage';
import LiveRoomManagePage from './pages/pc/live/LiveRoomManagePage';
import LiveProductConfigPage from './pages/pc/live/LiveProductConfigPage';
import LiveMarketingPage from './pages/pc/live/LiveMarketingPage';
import LiveInteractionPage from './pages/pc/live/LiveInteractionPage';
import LiveControlCenterPage from './pages/pc/live/LiveControlCenterPage';
import BroadcasterStreamPage from './pages/pc/live/BroadcasterStreamPage';

// ============ PC 后台 - 详情/编辑子页面 (P1) ============
import MerchantDetailPage from './pages/pc/sub/MerchantDetailPage';
import DoctorDetailPage from './pages/pc/sub/DoctorDetailPage';
import CustomerDetailPage from './pages/pc/sub/CustomerDetailPage';
import TagDetailPage from './pages/pc/sub/TagDetailPage';
import SopCreatePage from './pages/pc/sub/SopCreatePage';
import ProductCreatePage from './pages/pc/sub/ProductCreatePage';
import ProductEditPage from './pages/pc/sub/ProductEditPage';
import BannerCreatePage from './pages/pc/sub/BannerCreatePage';
import BannerEditPage from './pages/pc/sub/BannerEditPage';
import ActivityCreatePage from './pages/pc/sub/ActivityCreatePage';
import SettlementDetailPage from './pages/pc/sub/SettlementDetailPage';
// import TrainingCoursePage from './pages/pc/sub/TrainingCoursePage'; // 培训流程已移除
// import TrainingExamPage from './pages/pc/sub/TrainingExamPage'; // 培训流程已移除

// ============ MP 微信小程序页面 ============
import MpHomePage from './pages/mp/MpHomePage';
import MpNearbyPage from './pages/mp/MpNearbyPage';
import MpConsultPage from './pages/mp/MpConsultPage';
import MpMinePage from './pages/mp/MpMinePage';
// MP 子页面（P0）
import MpArticleDetailPage from './pages/mp/MpArticleDetailPage';
import MpRiskAssessmentPage from './pages/mp/MpRiskAssessmentPage';
import MpRiskResultPage from './pages/mp/MpRiskResultPage';
import MpProductDetailPage from './pages/mp/MpProductDetailPage';
import MpLiveViewPage from './pages/mp/MpLiveViewPage';
import MpLiveSchedulePage from './pages/mp/MpLiveSchedulePage';
import MpDoctorProfilePage from './pages/mp/MpDoctorProfilePage';
import MpNutritionistProfilePage from './pages/mp/MpNutritionistProfilePage';
import MpCommunityPage from './pages/mp/MpCommunityPage';
import MpInvitePage from './pages/mp/MpInvitePage';
import MpPharmacyDetailPage from './pages/mp/MpPharmacyDetailPage';
import MpSharePage from './pages/mp/MpSharePage';
import MpConsultOrderListPage from './pages/mp/MpConsultOrderListPage';

// ============ APP 患者视图页面 ============
import AppHomePage from './pages/app/AppHomePage';
import AppServicePage from './pages/app/AppServicePage';
import AppCommunityPage from './pages/app/AppCommunityPage';
import AppMemberPage from './pages/app/AppMemberPage';
import AppMinePage from './pages/app/AppMinePage';
import AppMallPage from './pages/app/AppMallPage';
// APP 患者 - 直播看播 & 回放
import AppLiveRoomPage, { AppLiveWatchPage } from './pages/app/AppLiveRoomPage';
import AppReplayListPage, { AppReplayWatchPage } from './pages/app/AppReplayPage';
// APP 患者 - 健康科普
import AppHealthKnowledgePage from './pages/app/AppHealthKnowledgePage';
// APP 患者 - 账号域 (P0)
import AccountSecurityPage from './pages/app/patient/account/AccountSecurityPage';
import HealthProfilePage from './pages/app/patient/account/HealthProfilePage';
import PrivacySettingsPage from './pages/app/patient/account/PrivacySettingsPage';
import FamilyManagePage from './pages/app/patient/account/FamilyManagePage';
import RemoteMonitorPage from './pages/app/patient/account/RemoteMonitorPage';
import LanguageSettingsPage from './pages/app/patient/account/LanguageSettingsPage';
// APP 患者 - 问诊域 (P0)
import DoctorSearchPage from './pages/app/patient/consultation/DoctorSearchPage';
import DoctorProfilePage from './pages/app/patient/consultation/DoctorProfilePage';
import ConsultationChatPage from './pages/app/patient/consultation/ConsultationChatPage';
import FollowupListPage from './pages/app/patient/consultation/FollowupListPage';
import DoctorReviewPage from './pages/app/patient/consultation/DoctorReviewPage';
import EmrViewPage from './pages/app/patient/consultation/EmrViewPage';
import VipServicePage from './pages/app/patient/consultation/VipServicePage';
import VipDetailPage from './pages/app/patient/consultation/VipDetailPage';
import EmergencySosPage from './pages/app/patient/consultation/EmergencySosPage';
import ConsultationOrderListPage from './pages/app/patient/ConsultationOrderListPage';
import UnifiedOrderListPage from './pages/app/patient/UnifiedOrderListPage';
import PreConsultPage from './pages/app/patient/consultation/PreConsultPage';
import WaitingPage from './pages/app/patient/consultation/WaitingPage';
import ConsultationSummaryPage from './pages/app/patient/consultation/ConsultationSummaryPage';
import EvaluationPage from './pages/app/patient/consultation/EvaluationPage';
import PrescriptionDetailPage from './pages/app/patient/consultation/PrescriptionDetailPage';
import PostConsultRecommendPage from './pages/app/patient/consultation/PostConsultRecommendPage';
// APP 患者 - 慢病管理域 (P0)
import CgmBindingPage from './pages/app/patient/health/CgmBindingPage';
import GlucoseManualPage from './pages/app/patient/health/GlucoseManualPage';
import GlucoseTrendPage from './pages/app/patient/health/GlucoseTrendPage';
import TirAnalysisPage from './pages/app/patient/health/TirAnalysisPage';
import AlertDetailPage from './pages/app/patient/health/AlertDetailPage';
import Hba1cPredictPage from './pages/app/patient/health/Hba1cPredictPage';
import DietRecordPage from './pages/app/patient/health/DietRecordPage';
import DietPlanPage from './pages/app/patient/health/DietPlanPage';
import ExerciseRecordPage from './pages/app/patient/health/ExerciseRecordPage';
import HmServicePage from './pages/app/patient/health/HmServicePage';
import HealthReportPage from './pages/app/patient/health/HealthReportPage';
// APP 患者 - 处方&商城域 (P1)
import PrescriptionListPage from './pages/app/patient/prescription/PrescriptionListPage';
import RxPrescriptionDetailPage from './pages/app/patient/prescription/PrescriptionDetailPage';
import PharmacistReviewPage from './pages/app/patient/prescription/PharmacistReviewPage';
import RefillRequestPage from './pages/app/patient/prescription/RefillRequestPage';
import DrugInteractionPage from './pages/app/patient/prescription/DrugInteractionPage';
import MedReminderPage from './pages/app/patient/prescription/MedReminderPage';
import RxPriceComparePage from './pages/app/patient/prescription/RxPriceComparePage';
import MallSearchPage from './pages/app/patient/mall/MallSearchPage';
import MallProductDetailPage from './pages/app/patient/mall/ProductDetailPage';
import CartPage from './pages/app/patient/mall/CartPage';
import OrderConfirmPage from './pages/app/patient/mall/OrderConfirmPage';
import PaymentPage from './pages/app/patient/mall/PaymentPage';
import RxZonePage from './pages/app/patient/mall/RxZonePage';
import ProductReviewPage from './pages/app/patient/mall/ProductReviewPage';
import PatientOrderListPage from './pages/app/patient/mall/OrderListPage';
import PatientOrderDetailPage from './pages/app/patient/mall/OrderDetailPage';
import ColdchainTrackPage from './pages/app/patient/mall/ColdchainTrackPage';
import AftersalePage from './pages/app/patient/mall/AftersalePage';
import AdrReportPage from './pages/app/patient/mall/AdrReportPage';
// APP 患者 - 社区域 (P1)
import PostDetailPage from './pages/app/patient/community/PostDetailPage';
import PostCreatePage from './pages/app/patient/community/PostCreatePage';
import TopicSquarePage from './pages/app/patient/community/TopicSquarePage';
import TopicDetailPage from './pages/app/patient/community/TopicDetailPage';
import FollowListPage from './pages/app/patient/community/FollowListPage';
import CreatorProfilePage from './pages/app/patient/community/CreatorProfilePage';
import FeaturedPage from './pages/app/patient/community/FeaturedPage';
import OfficialProfilePage from './pages/app/patient/community/OfficialProfilePage';
import CircleDetailPage from './pages/app/patient/community/CircleDetailPage';
// APP 患者 - 会员域 (P1)
import PointsCenterPage from './pages/app/patient/member/PointsCenterPage';
import CheckinPage from './pages/app/patient/member/CheckinPage';
import CouponCenterPage from './pages/app/patient/member/CouponCenterPage';

// ============ APP 医生视图页面 ============
import AppDoctorWorkbenchPage from './pages/app/AppDoctorWorkbenchPage';

import AppDoctorPatientsPage from './pages/app/AppDoctorPatientsPage';
import AppDoctorLivePage from './pages/app/AppDoctorLivePage';
import AppDoctorMinePage from './pages/app/AppDoctorMinePage';
// APP 医生 - 子页面 (P2)
import DoctorPatientDetailPage from './pages/app/doctor/PatientDetailPage';
import DiagnosisWritePage from './pages/app/doctor/DiagnosisWritePage';
import DoctorConsultPanel from './pages/app/doctor/DoctorConsultPanel';
import DoctorConsultationChatPage from './pages/app/doctor/DoctorConsultationChatPage';
import DoctorConsultListPage from './pages/app/doctor/DoctorConsultListPage';
import DoctorConsultDetailPage from './pages/app/doctor/DoctorConsultDetailPage';
import DoctorPrescriptionPage from './pages/app/doctor/DoctorPrescriptionPage';
import DoctorIncomeDetailPage from './pages/app/doctor/IncomeDetailPage';
import ReviewManagePage from './pages/app/doctor/ReviewManagePage';
import ProfileEditPage from './pages/app/doctor/ProfileEditPage';
import CredentialsPage from './pages/app/doctor/CredentialsPage';

// ============ APP 营养师视图页面 ============
import AppNutritionistWorkbenchPage from './pages/app/AppNutritionistWorkbenchPage';
import AppNutritionistPatientsPage from './pages/app/AppNutritionistPatientsPage';
import AppNutritionistDietPage from './pages/app/AppNutritionistDietPage';
import AppNutritionistLivePage from './pages/app/AppNutritionistLivePage';
import AppNutritionistMinePage from './pages/app/AppNutritionistMinePage';
// APP 营养师 - 子页面 (P2)

// ============ APP 健康管理师视图页面 ============
import AppHmWorkbenchPage from './pages/app/AppHmWorkbenchPage';
import AppHmPatientsPage from './pages/app/AppHmPatientsPage';
import AppHmVisitPage from './pages/app/AppHmVisitPage';
import AppHmMinePage from './pages/app/AppHmMinePage';

// APP 营养师 - 子页面 (P2)
import DietTemplatesPage from './pages/app/nutritionist/DietTemplatesPage';
import DietTrackingPage from './pages/app/nutritionist/DietTrackingPage';
import NutritionistIncomeDetailPage from './pages/app/nutritionist/IncomeDetailPage';

// ============ LIVE 直播端页面 ============
import LiveRoomPage from './pages/live/LiveRoomPage';
import LiveSchedulePage from './pages/live/LiveSchedulePage';
import LiveMallPage from './pages/live/LiveMallPage';
import LiveDataPage from './pages/live/LiveDataPage';
import LiveMinePage from './pages/live/LiveMinePage';
// LIVE - 子页面 (P3)
import CreateRoomPage from './pages/live/CreateRoomPage';
// LIVE - PC联动页面 (V2.0)
import ShoppingLivePage from './pages/live/ShoppingLivePage';
import KnowledgeLivePage from './pages/live/KnowledgeLivePage';
import PlanManagePage from './pages/live/PlanManagePage';
// LIVE - 商品场景闭环 (V3.0)
import LiveProductDetailPage from './pages/live/LiveProductDetailPage';
// Lazy imports for large live pages

const App: React.FC = () => {
  // 应用启动时恢复登录态（从 localStorage token 恢复）
  useEffect(() => {
    useUserStore.getState().init();
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2196F3',
          borderRadius: 6,
          colorSuccess: '#4CAF50',
          colorError: '#F44336',
          colorWarning: '#FF9800',
        },
      }}
    >
      <AntApp>
        <HashRouter basename={ROUTER_BASENAME}>
          <Routes>
            {/* ============ 首页 & 登录 & 入驻 & 门户（无 AppLayout 包裹） ============ */}
            <Route path="/" element={<HomePage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/apply" element={<OnboardingApplyPage />} />
            <Route path="/status" element={<OnboardingStatusPage />} />

            {/* ============ 患者APP（独立壳，带登录守卫）============ */}
            <Route path="/app/login" element={<Navigate to="/patient/login" replace />} />
            <Route path="/patient/login" element={<PatientLoginPage />} />
            <Route path="/patient/register" element={<PatientRegisterPage />} />
            <Route path="/patient/*" element={<PatientApp />} />

            {/* ============ 医管APP（独立壳，带登录守卫，仅ONLINE人员可登录）============ */}
            <Route path="/medical/login" element={<MedicalLoginPage />} />
            <Route path="/medical/*" element={<MedicalApp />} />

            {/* ============ 各终端（AppLayout 自动识别终端类型） ============ */}
            <Route element={<AppLayout />}>
              
              {/* ==================== PC 后台 ==================== */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="merchants" element={<MerchantListPage />} />
              <Route path="merchants/:id" element={<MerchantDetailPage />} />
              <Route path="doctors" element={<DoctorManagePage />} />
              <Route path="doctors/:id" element={<DoctorDetailPage />} />
              <Route path="pharmacists" element={<PharmacistManagePage />} />
              <Route path="nutritionists" element={<NutritionistManagePage />} />
              <Route path="certificates" element={<CertificateCenterPage />} />
              <Route path="contracts" element={<ContractManagePage />} />
              <Route path="ratings" element={<MerchantRatingPage />} />
              {/* 培训管理路由已移除 */}
              {/* <Route path="trainings" element={<TrainingManagePage />} /> */}
              {/* <Route path="trainings/courses" element={<TrainingCoursePage />} /> */}
              {/* <Route path="trainings/exam" element={<TrainingExamPage />} /> */}
              <Route path="config-center" element={<ConfigCenterPage />} />
              <Route path="scrm/customers" element={<CustomerPoolPage />} />
              <Route path="scrm/customers/:id" element={<CustomerDetailPage />} />
              <Route path="scrm/tags" element={<TagManagePage />} />
              <Route path="scrm/tags/:id" element={<TagDetailPage />} />
              <Route path="scrm/sop" element={<SOPManagePage />} />
              <Route path="scrm/sop/create" element={<SopCreatePage />} />
              <Route path="scrm/campaign" element={<CampaignManagePage />} />
              <Route path="scrm/conversion" element={<ConversionPage />} />
              <Route path="scrm/conversations" element={<ConversationArchivePage />} />
              <Route path="scrm/leads" element={<LeadsManagePage />} />
              <Route path="products-mgmt" element={<ProductManagePage />} />
              <Route path="products-mgmt/create" element={<ProductCreatePage />} />
              <Route path="products-mgmt/:id/edit" element={<ProductEditPage />} />
              <Route path="otc-review" element={<OTCReviewPage />} />
              <Route path="categories" element={<CategoryManagePage />} />
              {/* 商品审核中心 (V2.2.0) */}
              <Route path="products-review" element={<ProductAuditPage />} />
              {/* 药店管理 - 商品分类 (V2.2.0) */}
              <Route path="pharmacy/rx" element={<PharmacyProductPage />} />
              <Route path="pharmacy/otc" element={<PharmacyProductPage />} />
              <Route path="pharmacy/devices" element={<PharmacyProductPage />} />
              <Route path="pharmacy/supplements" element={<PharmacyProductPage />} />
              <Route path="pharmacy/prescriptions" element={<PrescriptionManagePage />} />
              <Route path="pharmacy/orders" element={<PharmacyOrderPage />} />
              <Route path="pharmacy/coldchain" element={<ColdChainMonitorPage />} />
              <Route path="pharmacy/aftersale" element={<AftersaleManagePage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="coldchain" element={<ColdChainMonitorPage />} />
              <Route path="aftersale-mgmt" element={<AftersaleManagePage />} />
              <Route path="finance/settlements" element={<SettlementManagePage />} />
              <Route path="finance/settlements/:id" element={<SettlementDetailPage />} />
              <Route path="finance/reconciliation" element={<ReconciliationPage />} />
              <Route path="finance/split-config" element={<SplitConfigPage />} />
              <Route path="ops/banners" element={<BannerManagePage />} />
              <Route path="ops/banners/create" element={<BannerCreatePage />} />
              <Route path="ops/banners/:id/edit" element={<BannerEditPage />} />
              <Route path="ops/content-review" element={<ContentReviewPage />} />
              <Route path="ops/activities" element={<ActivityManagePage />} />
              <Route path="ops/activities/create" element={<ActivityCreatePage />} />
              <Route path="ops/tickets" element={<TicketManagePage />} />
              <Route path="ops/complaints" element={<ComplaintPage />} />
              {/* PC后台 - 问诊管理 (V1.0.0新增) */}
              <Route path="consultation/monitor" element={<ConsultationMonitor />} />
              <Route path="consultation/services" element={<ConsultationServiceManagePage />} />
              <Route path="consultation/orders" element={<ConsultationOrderManagePage />} />
              <Route path="consultation/prescriptions" element={<PrescriptionManagePage />} />
              <Route path="data/dashboard" element={<BizDashboardPage />} />
              <Route path="system/roles" element={<RolePermissionPage />} />
              <Route path="system/config" element={<SystemConfigPage />} />

              {/* ==================== PC 后台 - 直播管理 ==================== */}
              <Route path="live-mgmt/plans" element={<LiveBroadcastPlanPage />} />
              <Route path="live-mgmt/sessions" element={<LiveSessionPage />} />
              <Route path="live-mgmt/rooms" element={<LiveRoomManagePage />} />
              <Route path="live-mgmt/products" element={<LiveProductConfigPage />} />
              <Route path="live-mgmt/marketing" element={<LiveMarketingPage />} />
              <Route path="live-mgmt/interaction" element={<LiveInteractionPage />} />
              <Route path="live-mgmt/control" element={<LiveControlCenterPage />} />
              <Route path="live-mgmt/stream" element={<BroadcasterStreamPage />} />

              {/* ==================== MP 微信小程序 (4 Tab) ==================== */}
              <Route path="mp" element={<Navigate to="/mp/home" replace />} />
              <Route path="mp/home" element={<MpHomePage />} />
              <Route path="mp/nearby" element={<MpNearbyPage />} />
              <Route path="mp/consult" element={<MpConsultPage />} />
              <Route path="mp/consult/orders" element={<MpConsultOrderListPage />} />
              <Route path="mp/mine" element={<MpMinePage />} />
              {/* MP 入驻 */}
              <Route path="mp/apply" element={<OnboardingApplyPage />} />
              {/* MP 子页面 */}
              <Route path="mp/article/:id" element={<MpArticleDetailPage />} />
              <Route path="mp/assessment" element={<MpRiskAssessmentPage />} />
              <Route path="mp/assessment/result" element={<MpRiskResultPage />} />
              <Route path="mp/product/:id" element={<MpProductDetailPage />} />
              <Route path="mp/live/:id" element={<MpLiveViewPage />} />
              <Route path="mp/live/schedule" element={<MpLiveSchedulePage />} />
              <Route path="mp/doctor/:id" element={<MpDoctorProfilePage />} />
              <Route path="mp/nutritionist/:id" element={<MpNutritionistProfilePage />} />
              <Route path="mp/community" element={<MpCommunityPage />} />
              <Route path="mp/invite" element={<MpInvitePage />} />
              <Route path="mp/pharmacy/:id" element={<MpPharmacyDetailPage />} />
              <Route path="mp/share" element={<MpSharePage />} />

              {/* ==================== APP 患者视图 (5 Tab) ==================== */}
              <Route path="app" element={<Navigate to="/app/home" replace />} />
              <Route path="app/home" element={<AppHomePage />} />
              <Route path="app/service" element={<AppServicePage />} />
              <Route path="app/community" element={<AppCommunityPage />} />
              <Route path="app/member" element={<AppMemberPage />} />
              <Route path="app/mine" element={<AppMinePage />} />

              {/* APP 患者 - 账号域子页面 */}
              <Route path="app/mine/security" element={<AccountSecurityPage />} />
              <Route path="app/mine/health-profile" element={<HealthProfilePage />} />
              <Route path="app/mine/privacy" element={<PrivacySettingsPage />} />
              <Route path="app/mine/family" element={<FamilyManagePage />} />
              <Route path="app/mine/remote-monitor" element={<RemoteMonitorPage />} />
              <Route path="app/mine/language" element={<LanguageSettingsPage />} />

              {/* APP 患者 - 问诊域子页面 (P0) */}
              <Route path="app/service/doctors" element={<DoctorSearchPage />} />
              <Route path="app/service/doctor/:id" element={<DoctorProfilePage />} />
              <Route path="app/service/consult/:id" element={<ConsultationChatPage />} />
              <Route path="app/service/followup" element={<FollowupListPage />} />
              <Route path="app/service/review/:id" element={<DoctorReviewPage />} />
              <Route path="app/service/emr/:id" element={<EmrViewPage />} />
              <Route path="app/service/vip" element={<VipServicePage />} />
              <Route path="app/service/vip/:id" element={<VipDetailPage />} />
              <Route path="app/service/sos" element={<EmergencySosPage />} />

              {/* APP 患者 - 问诊全链路（新增V1.0.0） */}
              <Route path="app/consultation" element={<DoctorSearchPage />} />
              <Route path="app/consultation/doctor/:doctorId" element={<DoctorProfilePage />} />
              <Route path="app/consultation/pre-consult/:doctorId" element={<PreConsultPage />} />
              <Route path="app/consultation/waiting/:orderId" element={<WaitingPage />} />
              <Route path="app/consultation/chat/:orderId" element={<ConsultationChatPage />} />
              <Route path="app/consultation/summary/:orderId" element={<ConsultationSummaryPage />} />
              <Route path="app/consultation/evaluate/:orderId" element={<EvaluationPage />} />
              <Route path="app/consultation/prescription/:prescriptionId" element={<PrescriptionDetailPage />} />
              <Route path="app/consultation/recommend/:orderId" element={<PostConsultRecommendPage />} />
              <Route path="app/consultation/reviews" element={<DoctorReviewPage />} />

              {/* APP 患者 - 慢病管理域子页面 (P0) */}
              <Route path="app/home/cgm/bind" element={<CgmBindingPage />} />
              <Route path="app/home/glucose/entry" element={<GlucoseManualPage />} />
              <Route path="app/home/glucose/trend" element={<GlucoseTrendPage />} />
              <Route path="app/home/glucose/tir" element={<TirAnalysisPage />} />
              <Route path="app/home/alert/:id" element={<AlertDetailPage />} />
              <Route path="app/home/glucose/hba1c" element={<Hba1cPredictPage />} />
              <Route path="app/home/diet" element={<DietRecordPage />} />
              <Route path="app/home/diet/plan" element={<DietPlanPage />} />
              <Route path="app/home/exercise" element={<ExerciseRecordPage />} />
              <Route path="app/home/hm-service" element={<HmServicePage />} />
              <Route path="app/mine/health-report" element={<HealthReportPage />} />

              {/* APP 患者 - 处方&商城域子页面 (P1) */}
              <Route path="app/mine/prescriptions" element={<PrescriptionListPage />} />
              <Route path="app/mine/prescription/:id" element={<RxPrescriptionDetailPage />} />
              <Route path="app/mine/prescription/:id/review" element={<PharmacistReviewPage />} />
              <Route path="app/mine/prescription/:id/refill" element={<RefillRequestPage />} />
              <Route path="app/mine/drug-interaction" element={<DrugInteractionPage />} />
              <Route path="app/mine/med-reminder" element={<MedReminderPage />} />
              <Route path="app/mine/prescription/:id/compare" element={<RxPriceComparePage />} />

              <Route path="app/mall" element={<AppMallPage />} />
              <Route path="app/mall/search" element={<MallSearchPage />} />
              <Route path="app/mall/product/:productId" element={<MallProductDetailPage />} />
              <Route path="app/mall/cart" element={<CartPage />} />
              <Route path="app/mall/checkout" element={<OrderConfirmPage />} />
              <Route path="app/mall/payment/:orderId" element={<PaymentPage />} />
              <Route path="app/mall/rx" element={<RxZonePage />} />
              <Route path="app/mall/review/:orderId" element={<ProductReviewPage />} />
              <Route path="app/mine/orders" element={<PatientOrderListPage />} />
              <Route path="app/mine/orders/unified" element={<UnifiedOrderListPage />} />
              <Route path="app/mine/consultations" element={<ConsultationOrderListPage />} />
              <Route path="app/mine/order/:id" element={<PatientOrderDetailPage />} />
              <Route path="app/mine/order/:id/track" element={<ColdchainTrackPage />} />
              <Route path="app/mine/order/:id/aftersale" element={<AftersalePage />} />
              <Route path="app/mine/adr-report" element={<AdrReportPage />} />

              {/* APP 患者 - 社区域子页面 (P1) */}
              <Route path="app/community/post/:id" element={<PostDetailPage />} />
              <Route path="app/community/create" element={<PostCreatePage />} />
              <Route path="app/community/topics" element={<TopicSquarePage />} />
              <Route path="app/community/topic/:id" element={<TopicDetailPage />} />
              <Route path="app/community/follows" element={<FollowListPage />} />
              <Route path="app/community/creator/:id" element={<CreatorProfilePage />} />
              <Route path="app/community/featured" element={<FeaturedPage />} />
              <Route path="app/community/official/:id" element={<OfficialProfilePage />} />
              <Route path="app/community/circle/:id" element={<CircleDetailPage />} />
              {/* APP 患者 - 直播看播 & 回放 */}
              <Route path="app/health/knowledge" element={<AppHealthKnowledgePage />} />
              <Route path="app/service/live" element={<AppLiveRoomPage />} />
              <Route path="app/service/live/:id" element={<AppLiveWatchPage />} />
              <Route path="app/community/replays" element={<AppReplayListPage />} />
              <Route path="app/community/replay/:id" element={<AppReplayWatchPage />} />

              {/* APP 患者 - 会员域子页面 (P1) */}
              <Route path="app/member/points" element={<PointsCenterPage />} />
              <Route path="app/member/checkin" element={<CheckinPage />} />
              <Route path="app/member/coupons" element={<CouponCenterPage />} />

              {/* ==================== APP 医生视图 ==================== */}
              <Route path="app/doctor" element={<Navigate to="/app/doctor/workbench" replace />} />
              <Route path="app/doctor/workbench" element={<AppDoctorWorkbenchPage />} />
              <Route path="app/doctor/consult" element={<DoctorConsultPanel />} />
              <Route path="app/doctor/consult/list" element={<DoctorConsultListPage />} />
              <Route path="app/doctor/consult/chat/:orderId" element={<DoctorConsultationChatPage />} />
              <Route path="app/doctor/consult/detail/:orderId" element={<DoctorConsultDetailPage />} />
              <Route path="app/doctor/patients" element={<AppDoctorPatientsPage />} />
              <Route path="app/doctor/live" element={<AppDoctorLivePage />} />
              <Route path="app/doctor/mine" element={<AppDoctorMinePage />} />
              {/* APP 医生 - 子页面 (P2) */}
              <Route path="app/doctor/patient/:id" element={<DoctorPatientDetailPage />} />
              <Route path="app/doctor/diagnosis/:id" element={<DiagnosisWritePage />} />
              <Route path="app/doctor/prescription" element={<DoctorPrescriptionPage />} />
              <Route path="app/doctor/mine/income" element={<DoctorIncomeDetailPage />} />
              <Route path="app/doctor/mine/reviews" element={<ReviewManagePage />} />
              <Route path="app/doctor/mine/profile" element={<ProfileEditPage />} />
              <Route path="app/doctor/mine/credentials" element={<CredentialsPage />} />
              <Route path="app/doctor/prescribe" element={<DoctorPrescriptionPage />} />

              {/* ==================== APP 营养师视图 ==================== */}
              <Route path="app/nutritionist" element={<Navigate to="/app/nutritionist/workbench" replace />} />
              <Route path="app/nutritionist/workbench" element={<AppNutritionistWorkbenchPage />} />
              <Route path="app/nutritionist/patients" element={<AppNutritionistPatientsPage />} />
              <Route path="app/nutritionist/diet" element={<AppNutritionistDietPage />} />
              <Route path="app/nutritionist/live" element={<AppNutritionistLivePage />} />
              <Route path="app/nutritionist/mine" element={<AppNutritionistMinePage />} />
              {/* APP 营养师 - 子页面 (P2) */}
              <Route path="app/nutritionist/diet/templates" element={<DietTemplatesPage />} />
              <Route path="app/nutritionist/diet/tracking/:id" element={<DietTrackingPage />} />
              <Route path="app/nutritionist/mine/income" element={<NutritionistIncomeDetailPage />} />

              {/* ==================== APP 健康管理师视图 ==================== */}
              <Route path="app/hm" element={<Navigate to="/app/hm/workbench" replace />} />
              <Route path="app/hm/workbench" element={<AppHmWorkbenchPage />} />
              <Route path="app/hm/patients" element={<AppHmPatientsPage />} />
              <Route path="app/hm/visit" element={<AppHmVisitPage />} />
              <Route path="app/hm/mine" element={<AppHmMinePage />} />

            </Route>

            {/* ============ LIVE 主播端（独立路由，无 AppLayout） ============ */}
            <Route path="live" element={<Navigate to="/live/room" replace />} />
            <Route path="live/room" element={<LiveRoomPage />} />
            <Route path="live/room/create" element={<CreateRoomPage />} />
            <Route path="live/products" element={<LiveMallPage />} />
            <Route path="live/product-detail" element={<LiveProductDetailPage />} />
            <Route path="live/interact" element={<LiveSchedulePage />} />
            <Route path="live/data" element={<LiveDataPage />} />
            <Route path="live/mine" element={<LiveMinePage />} />
            {/* LIVE - PC联动页面 (V2.0) */}
            <Route path="live/plan" element={<PlanManagePage />} />
            <Route path="live/shopping/:sessionId" element={<ShoppingLivePage />} />
            <Route path="live/knowledge/:sessionId" element={<KnowledgeLivePage />} />

          </Routes>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
