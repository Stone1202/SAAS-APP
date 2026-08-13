/**
 * 患者APP 壳应用
 * - 认证守卫：未登录 → /patient/login
 * - 手机框模拟（移动端体验）
 * - 注册全部患者端路由（4 Tab：首页/社区/会员/我的，服务内容已整合至首页）
 */
import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAppAuthStore } from '../stores/appAuthStore';

// ============ 页面导入 ============
// 5 Tab 首页
import AppHomePage from '../pages/app/AppHomePage';
import AppServicePage from '../pages/app/AppServicePage';
import AppCommunityPage from '../pages/app/AppCommunityPage';
import AppMemberPage from '../pages/app/AppMemberPage';
import AppMinePage from '../pages/app/AppMinePage';
import AppMallPage from '../pages/app/AppMallPage';

// 问诊全链路
import DoctorSearchPage from '../pages/app/patient/consultation/DoctorSearchPage';
import DoctorProfilePage from '../pages/app/patient/consultation/DoctorProfilePage';
import PreConsultPage from '../pages/app/patient/consultation/PreConsultPage';
import WaitingPage from '../pages/app/patient/consultation/WaitingPage';
import ConsultationChatPage from '../pages/app/patient/consultation/ConsultationChatPage';
import ConsultationSummaryPage from '../pages/app/patient/consultation/ConsultationSummaryPage';
import EvaluationPage from '../pages/app/patient/consultation/EvaluationPage';
import PrescriptionDetailPage from '../pages/app/patient/consultation/PrescriptionDetailPage';
import PostConsultRecommendPage from '../pages/app/patient/consultation/PostConsultRecommendPage';
import DoctorReviewPage from '../pages/app/patient/consultation/DoctorReviewPage';
import ConsultationOrderListPage from '../pages/app/patient/ConsultationOrderListPage';
import FollowupListPage from '../pages/app/patient/consultation/FollowupListPage';
import EmrViewPage from '../pages/app/patient/consultation/EmrViewPage';
import VipServicePage from '../pages/app/patient/consultation/VipServicePage';
import VipDetailPage from '../pages/app/patient/consultation/VipDetailPage';
import EmergencySosPage from '../pages/app/patient/consultation/EmergencySosPage';

// 慢病管理
import CgmBindingPage from '../pages/app/patient/health/CgmBindingPage';
import GlucoseManualPage from '../pages/app/patient/health/GlucoseManualPage';
import GlucoseTrendPage from '../pages/app/patient/health/GlucoseTrendPage';
import TirAnalysisPage from '../pages/app/patient/health/TirAnalysisPage';
import AlertDetailPage from '../pages/app/patient/health/AlertDetailPage';
import Hba1cPredictPage from '../pages/app/patient/health/Hba1cPredictPage';
import DietRecordPage from '../pages/app/patient/health/DietRecordPage';
import DietPlanPage from '../pages/app/patient/health/DietPlanPage';
import ExerciseRecordPage from '../pages/app/patient/health/ExerciseRecordPage';
import HmServicePage from '../pages/app/patient/health/HmServicePage';
import HealthReportPage from '../pages/app/patient/health/HealthReportPage';

// 处方&商城
import PrescriptionListPage from '../pages/app/patient/prescription/PrescriptionListPage';
import RxPrescriptionDetailPage from '../pages/app/patient/prescription/PrescriptionDetailPage';
import PharmacistReviewPage from '../pages/app/patient/prescription/PharmacistReviewPage';
import RefillRequestPage from '../pages/app/patient/prescription/RefillRequestPage';
import DrugInteractionPage from '../pages/app/patient/prescription/DrugInteractionPage';
import MedReminderPage from '../pages/app/patient/prescription/MedReminderPage';
import RxPriceComparePage from '../pages/app/patient/prescription/RxPriceComparePage';
import MallSearchPage from '../pages/app/patient/mall/MallSearchPage';
import MallProductDetailPage from '../pages/app/patient/mall/ProductDetailPage';
import CartPage from '../pages/app/patient/mall/CartPage';
import OrderConfirmPage from '../pages/app/patient/mall/OrderConfirmPage';
import PaymentPage from '../pages/app/patient/mall/PaymentPage';
import RxZonePage from '../pages/app/patient/mall/RxZonePage';
import ProductReviewPage from '../pages/app/patient/mall/ProductReviewPage';
import PatientOrderListPage from '../pages/app/patient/mall/OrderListPage';
import PatientOrderDetailPage from '../pages/app/patient/mall/OrderDetailPage';
import ColdchainTrackPage from '../pages/app/patient/mall/ColdchainTrackPage';
import AftersalePage from '../pages/app/patient/mall/AftersalePage';
import AdrReportPage from '../pages/app/patient/mall/AdrReportPage';

// 社区
import PostDetailPage from '../pages/app/patient/community/PostDetailPage';
import PostCreatePage from '../pages/app/patient/community/PostCreatePage';
import TopicSquarePage from '../pages/app/patient/community/TopicSquarePage';
import TopicDetailPage from '../pages/app/patient/community/TopicDetailPage';
import FollowListPage from '../pages/app/patient/community/FollowListPage';
import CreatorProfilePage from '../pages/app/patient/community/CreatorProfilePage';
import FeaturedPage from '../pages/app/patient/community/FeaturedPage';
import OfficialProfilePage from '../pages/app/patient/community/OfficialProfilePage';
import CircleDetailPage from '../pages/app/patient/community/CircleDetailPage';

// 账号
import AccountSecurityPage from '../pages/app/patient/account/AccountSecurityPage';
import HealthProfilePage from '../pages/app/patient/account/HealthProfilePage';
import PrivacySettingsPage from '../pages/app/patient/account/PrivacySettingsPage';
import FamilyManagePage from '../pages/app/patient/account/FamilyManagePage';
import RemoteMonitorPage from '../pages/app/patient/account/RemoteMonitorPage';
import LanguageSettingsPage from '../pages/app/patient/account/LanguageSettingsPage';

// 会员
import PointsCenterPage from '../pages/app/patient/member/PointsCenterPage';
import CheckinPage from '../pages/app/patient/member/CheckinPage';
import CouponCenterPage from '../pages/app/patient/member/CouponCenterPage';

// 直播
import AppLiveRoomPage, { AppLiveWatchPage } from '../pages/app/AppLiveRoomPage';
import AppReplayListPage, { AppReplayWatchPage } from '../pages/app/AppReplayPage';
import AppHealthKnowledgePage from '../pages/app/AppHealthKnowledgePage';

// ============ 认证守卫 ============
const RequirePatientAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const patientUser = useAppAuthStore(s => s.patientUser);
  const init = useAppAuthStore(s => s.init);
  const navigate = useNavigate();
  const location = useLocation();

  // 用 ref 锁定首次进入时的目标路径，避免 location 变化导致重复跳转
  const targetPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!patientUser) init();
  }, []);

  useEffect(() => {
    if (!patientUser) {
      // 如果已经在登录页，不再触发跳转（防止死循环）
      if (location.pathname === '/patient/login') return;
      navigate('/patient/login', { replace: true, state: { from: location.pathname } });
    }
  }, [patientUser, navigate, location.pathname]);

  if (!patientUser) return null;
  return <>{children}</>;
};

// ============ 患者APP 移动端Header ============
const PatientHeader: React.FC = () => {
  const patientUser = useAppAuthStore(s => s.patientUser);
  const patientLogout = useAppAuthStore(s => s.patientLogout);
  const navigate = useNavigate();

  const items = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => { patientLogout(); navigate('/patient/login', { replace: true }); } },
  ];

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>SugarMate</div>
      <Dropdown menu={{ items }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Avatar size={28} icon={<UserOutlined />} />
          <span style={{ fontSize: 13 }}>{patientUser?.name || '患者'}</span>
        </div>
      </Dropdown>
    </div>
  );
};

// ============ 患者APP 底部TabBar ============
const PatientTabBar: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const navigate = useNavigate();
  const tabs = [
    { key: '/patient/home', label: '首页', icon: '🏠' },
    { key: '/patient/community', label: '社区', icon: '💬' },
    { key: '/patient/member', label: '会员', icon: '👑' },
    { key: '/patient/mine', label: '我的', icon: '👤' },
  ];

  return (
    <div style={{
      height: 56, display: 'flex', borderTop: '1px solid #f0f0f0', background: '#fff', flexShrink: 0,
    }}>
      {tabs.map(tab => (
        <div
          key={tab.key}
          onClick={() => navigate(tab.key)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            color: currentPath === tab.key ? '#667eea' : '#8c8c8c',
          }}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, marginTop: 2 }}>{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

// ============ 患者APP 整体壳 ============
const PatientApp: React.FC = () => {
  const location = useLocation();

  // 判断是否全屏页面（聊天、直播等不需要TabBar）
  const isFullScreen = location.pathname.includes('/consult/') 
    || location.pathname.includes('/chat/')
    || location.pathname.includes('/live/')
    || location.pathname.includes('/mall/')
    || location.pathname.startsWith('/patient/service/')
    || location.pathname.startsWith('/patient/community/post')
    || location.pathname.startsWith('/patient/community/topic')
    || location.pathname.startsWith('/patient/community/circle');

  const tabRoute = isFullScreen ? null : (() => {
    const p = location.pathname;
    if (p.startsWith('/patient/home')) return '/patient/home';
    // service 子页面全屏显示（不激活Tab），直接访问 /patient/service 默认回到首页
    if (p.startsWith('/patient/service')) return '/patient/home';
    if (p.startsWith('/patient/community')) return '/patient/community';
    if (p.startsWith('/patient/member')) return '/patient/member';
    if (p.startsWith('/patient/mine')) return '/patient/mine';
    return '/patient/home';
  })();

  return (
    <RequirePatientAuth>
      <div style={{
        width: 390, height: '100vh', margin: '0 auto',
        display: 'flex', flexDirection: 'column', background: '#f5f5f5',
        boxShadow: '0 0 30px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {!isFullScreen && <PatientHeader />}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route index element={<Navigate to="/patient/home" replace />} />
            <Route path="home" element={<AppHomePage />} />
            <Route path="service" element={<AppServicePage />} />
            <Route path="community" element={<AppCommunityPage />} />
            <Route path="member" element={<AppMemberPage />} />
            <Route path="mine" element={<AppMinePage />} />

            {/* 问诊全链路 */}
            <Route path="service/doctors" element={<DoctorSearchPage />} />
            <Route path="service/doctor/:id" element={<DoctorProfilePage />} />
            <Route path="service/consult/:id" element={<ConsultationChatPage />} />
            <Route path="service/followup" element={<FollowupListPage />} />
            <Route path="service/review/:id" element={<DoctorReviewPage />} />
            <Route path="service/emr/:id" element={<EmrViewPage />} />
            <Route path="service/vip" element={<VipServicePage />} />
            <Route path="service/vip/:id" element={<VipDetailPage />} />
            <Route path="service/sos" element={<EmergencySosPage />} />

            <Route path="consultation" element={<DoctorSearchPage />} />
            <Route path="consultation/doctor/:doctorId" element={<DoctorProfilePage />} />
            <Route path="consultation/pre-consult/:doctorId" element={<PreConsultPage />} />
            <Route path="consultation/waiting/:orderId" element={<WaitingPage />} />
            <Route path="consultation/chat/:orderId" element={<ConsultationChatPage />} />
            <Route path="consultation/summary/:orderId" element={<ConsultationSummaryPage />} />
            <Route path="consultation/evaluate/:orderId" element={<EvaluationPage />} />
            <Route path="consultation/prescription/:prescriptionId" element={<PrescriptionDetailPage />} />
            <Route path="consultation/recommend/:orderId" element={<PostConsultRecommendPage />} />
            <Route path="consultation/reviews" element={<DoctorReviewPage />} />

            {/* 慢病管理 */}
            <Route path="home/cgm/bind" element={<CgmBindingPage />} />
            <Route path="home/glucose/entry" element={<GlucoseManualPage />} />
            <Route path="home/glucose/trend" element={<GlucoseTrendPage />} />
            <Route path="home/glucose/tir" element={<TirAnalysisPage />} />
            <Route path="home/alert/:id" element={<AlertDetailPage />} />
            <Route path="home/glucose/hba1c" element={<Hba1cPredictPage />} />
            <Route path="home/diet" element={<DietRecordPage />} />
            <Route path="home/diet/plan" element={<DietPlanPage />} />
            <Route path="home/exercise" element={<ExerciseRecordPage />} />
            <Route path="home/hm-service" element={<HmServicePage />} />
            <Route path="mine/health-report" element={<HealthReportPage />} />

            {/* 处方&商城 */}
            <Route path="mine/prescriptions" element={<PrescriptionListPage />} />
            <Route path="mine/prescription/:id" element={<RxPrescriptionDetailPage />} />
            <Route path="mine/prescription/:id/review" element={<PharmacistReviewPage />} />
            <Route path="mine/prescription/:id/refill" element={<RefillRequestPage />} />
            <Route path="mine/drug-interaction" element={<DrugInteractionPage />} />
            <Route path="mine/med-reminder" element={<MedReminderPage />} />
            <Route path="mine/prescription/:id/compare" element={<RxPriceComparePage />} />
            <Route path="mine/orders" element={<PatientOrderListPage />} />
            <Route path="mine/consultations" element={<ConsultationOrderListPage />} />
            <Route path="mine/order/:id" element={<PatientOrderDetailPage />} />
            <Route path="mine/order/:id/track" element={<ColdchainTrackPage />} />
            <Route path="mine/order/:id/aftersale" element={<AftersalePage />} />
            <Route path="mine/adr-report" element={<AdrReportPage />} />

            <Route path="mall" element={<AppMallPage />} />
            <Route path="mall/search" element={<MallSearchPage />} />
            <Route path="mall/product/:productId" element={<MallProductDetailPage />} />
            <Route path="mall/cart" element={<CartPage />} />
            <Route path="mall/checkout" element={<OrderConfirmPage />} />
            <Route path="mall/payment/:orderId" element={<PaymentPage />} />
            <Route path="mall/rx" element={<RxZonePage />} />
            <Route path="mall/review/:orderId" element={<ProductReviewPage />} />

            {/* 社区 */}
            <Route path="community/post/:id" element={<PostDetailPage />} />
            <Route path="community/create" element={<PostCreatePage />} />
            <Route path="community/topics" element={<TopicSquarePage />} />
            <Route path="community/topic/:id" element={<TopicDetailPage />} />
            <Route path="community/follows" element={<FollowListPage />} />
            <Route path="community/creator/:id" element={<CreatorProfilePage />} />
            <Route path="community/featured" element={<FeaturedPage />} />
            <Route path="community/official/:id" element={<OfficialProfilePage />} />
            <Route path="community/circle/:id" element={<CircleDetailPage />} />

            {/* 账号 */}
            <Route path="mine/security" element={<AccountSecurityPage />} />
            <Route path="mine/health-profile" element={<HealthProfilePage />} />
            <Route path="mine/privacy" element={<PrivacySettingsPage />} />
            <Route path="mine/family" element={<FamilyManagePage />} />
            <Route path="mine/remote-monitor" element={<RemoteMonitorPage />} />
            <Route path="mine/language" element={<LanguageSettingsPage />} />

            {/* 会员 */}
            <Route path="member/points" element={<PointsCenterPage />} />
            <Route path="member/checkin" element={<CheckinPage />} />
            <Route path="member/coupons" element={<CouponCenterPage />} />

            {/* 直播 */}
            <Route path="health/knowledge" element={<AppHealthKnowledgePage />} />
            <Route path="service/live" element={<AppLiveRoomPage />} />
            <Route path="service/live/:id" element={<AppLiveWatchPage />} />
            <Route path="community/replays" element={<AppReplayListPage />} />
            <Route path="community/replay/:id" element={<AppReplayWatchPage />} />
          </Routes>
        </div>
        {!isFullScreen && <PatientTabBar currentPath={tabRoute || '/patient/home'} />}
      </div>
    </RequirePatientAuth>
  );
};

export default PatientApp;
