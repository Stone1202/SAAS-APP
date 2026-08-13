/**
 * 医管APP 壳应用（医生 / 药师 / 营养师 / 健康管理师）
 * - 认证守卫：未登录 → /medical/login
 * - 仅 lifecycleStatus=ONLINE 人员可登录
 * - 登录后按角色进入对应工作台
 * - 手机框模拟（移动端体验）
 */
import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAppAuthStore } from '../stores/appAuthStore';

// ============ 医生端页面 ============
import AppDoctorWorkbenchPage from '../pages/app/AppDoctorWorkbenchPage';
import AppDoctorPatientsPage from '../pages/app/AppDoctorPatientsPage';
import AppDoctorLivePage from '../pages/app/AppDoctorLivePage';
import AppDoctorMinePage from '../pages/app/AppDoctorMinePage';
import DoctorPatientDetailPage from '../pages/app/doctor/PatientDetailPage';
import DiagnosisWritePage from '../pages/app/doctor/DiagnosisWritePage';
import DoctorConsultPanel from '../pages/app/doctor/DoctorConsultPanel';
import DoctorConsultationChatPage from '../pages/app/doctor/DoctorConsultationChatPage';
import DoctorConsultListPage from '../pages/app/doctor/DoctorConsultListPage';
import DoctorConsultDetailPage from '../pages/app/doctor/DoctorConsultDetailPage';
import DoctorPrescriptionPage from '../pages/app/doctor/DoctorPrescriptionPage';
import DoctorIncomeDetailPage from '../pages/app/doctor/IncomeDetailPage';
import ReviewManagePage from '../pages/app/doctor/ReviewManagePage';
import ProfileEditPage from '../pages/app/doctor/ProfileEditPage';
import CredentialsPage from '../pages/app/doctor/CredentialsPage';

// ============ 营养师端页面 ============
import AppNutritionistWorkbenchPage from '../pages/app/AppNutritionistWorkbenchPage';
import AppNutritionistPatientsPage from '../pages/app/AppNutritionistPatientsPage';
import AppNutritionistDietPage from '../pages/app/AppNutritionistDietPage';
import AppNutritionistLivePage from '../pages/app/AppNutritionistLivePage';
import AppNutritionistMinePage from '../pages/app/AppNutritionistMinePage';
import DietTemplatesPage from '../pages/app/nutritionist/DietTemplatesPage';
import DietTrackingPage from '../pages/app/nutritionist/DietTrackingPage';
import NutritionistIncomeDetailPage from '../pages/app/nutritionist/IncomeDetailPage';

// ============ 健康管理师端页面 ============
import AppHmWorkbenchPage from '../pages/app/AppHmWorkbenchPage';
import AppHmPatientsPage from '../pages/app/AppHmPatientsPage';
import AppHmVisitPage from '../pages/app/AppHmVisitPage';
import AppHmMinePage from '../pages/app/AppHmMinePage';

// ============ 药师端页面 ============
import PharmacistWorkbenchPage from '../pages/medical/pharmacist/PharmacistWorkbenchPage';
import PharmacistAuditPage from '../pages/medical/pharmacist/PharmacistAuditPage';
import AppPharmacistMinePage from '../pages/medical/pharmacist/AppPharmacistMinePage';

// ============ 认证守卫 ============
const RequireMedicalAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const init = useAppAuthStore(s => s.init);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!medicalUser) init();
  }, []);

  useEffect(() => {
    if (!medicalUser) {
      navigate('/medical/login', { replace: true, state: { from: location.pathname } });
    }
  }, [medicalUser, navigate, location]);

  if (!medicalUser) return null;
  return <>{children}</>;
};

// ============ 角色配置 ============
const ROLE_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  DOCTOR: { color: '#fff', label: '医生', bg: 'linear-gradient(135deg, #0f4c81, #1a8fe3)' },
  PHARMACIST: { color: '#fff', label: '药师', bg: 'linear-gradient(135deg, #0d9488, #14b8a6)' },
  NUTRITIONIST: { color: '#fff', label: '营养师', bg: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  HEALTH_MANAGER: { color: '#fff', label: '健康管理师', bg: 'linear-gradient(135deg, #ea580c, #f97316)' },
};

// ============ 医管APP Header ============
const MedicalHeader: React.FC = () => {
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const medicalLogout = useAppAuthStore(s => s.medicalLogout);
  const config = medicalUser?.role ? ROLE_CONFIG[medicalUser.role] : ROLE_CONFIG.DOCTOR;

  const items = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => { medicalLogout(); window.location.href = '/medical/login'; } },
  ];

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', background: config.bg, color: '#fff', flexShrink: 0,
    }}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>SugarMate</div>
      <Dropdown menu={{ items }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>{config.label}</span>
          <Avatar size={28} icon={<UserOutlined />} />
          <span style={{ fontSize: 13 }}>{medicalUser?.name || '--'}</span>
        </div>
      </Dropdown>
    </div>
  );
};

// ============ 医管APP 底部TabBar ============
const MedicalTabBar: React.FC<{ currentPath: string; role: string }> = ({ currentPath, role }) => {
  const navigate = useNavigate();
  const base = `/medical/${String(role).toLowerCase()}`;

  const doctorTabs = [
    { key: `${base}/workbench`, label: '工作台', icon: '📊' },
    { key: `${base}/consult`, label: '问诊', icon: '💬' },
    { key: `${base}/patients`, label: '患者', icon: '👥' },
    { key: `${base}/live`, label: '直播', icon: '📺' },
    { key: `${base}/mine`, label: '我的', icon: '👤' },
  ];

  const nutritionistTabs = [
    { key: `${base}/workbench`, label: '工作台', icon: '📊' },
    { key: `${base}/patients`, label: '患者', icon: '👥' },
    { key: `${base}/diet`, label: '饮食方案', icon: '🍽️' },
    { key: `${base}/live`, label: '直播', icon: '📺' },
    { key: `${base}/mine`, label: '我的', icon: '👤' },
  ];

  const hmTabs = [
    { key: `${base}/workbench`, label: '工作台', icon: '📊' },
    { key: `${base}/patients`, label: '患者', icon: '👥' },
    { key: `${base}/visit`, label: '随访', icon: '📋' },
    { key: `${base}/mine`, label: '我的', icon: '👤' },
  ];

  const pharmacistTabs = [
    { key: `${base}/workbench`, label: '工作台', icon: '📊' },
    { key: `${base}/audit`, label: '审核', icon: '🔍' },
    { key: `${base}/mine`, label: '我的', icon: '👤' },
  ];

  const tabs = role === 'NUTRITIONIST' ? nutritionistTabs :
    role === 'HEALTH_MANAGER' ? hmTabs :
    role === 'PHARMACIST' ? pharmacistTabs : doctorTabs;

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
            color: currentPath === tab.key ? '#0f4c81' : '#8c8c8c',
          }}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, marginTop: 2 }}>{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

// ============ 医生路由 ============
const DoctorRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Navigate to="workbench" replace />} />
    <Route path="workbench" element={<AppDoctorWorkbenchPage />} />
    <Route path="consult" element={<DoctorConsultPanel />} />
    <Route path="consult/list" element={<DoctorConsultListPage />} />
    <Route path="consult/chat/:orderId" element={<DoctorConsultationChatPage />} />
    <Route path="consult/detail/:orderId" element={<DoctorConsultDetailPage />} />
    <Route path="patients" element={<AppDoctorPatientsPage />} />
    <Route path="live" element={<AppDoctorLivePage />} />
    <Route path="mine" element={<AppDoctorMinePage />} />
    <Route path="patient/:id" element={<DoctorPatientDetailPage />} />
    <Route path="diagnosis/:id" element={<DiagnosisWritePage />} />
    <Route path="prescription" element={<DoctorPrescriptionPage />} />
    <Route path="prescribe" element={<DoctorPrescriptionPage />} />
    <Route path="mine/income" element={<DoctorIncomeDetailPage />} />
    <Route path="mine/reviews" element={<ReviewManagePage />} />
    <Route path="mine/profile" element={<ProfileEditPage />} />
    <Route path="mine/credentials" element={<CredentialsPage />} />
  </Routes>
);

// ============ 营养师路由 ============
const NutritionistRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Navigate to="workbench" replace />} />
    <Route path="workbench" element={<AppNutritionistWorkbenchPage />} />
    <Route path="patients" element={<AppNutritionistPatientsPage />} />
    <Route path="diet" element={<AppNutritionistDietPage />} />
    <Route path="live" element={<AppNutritionistLivePage />} />
    <Route path="mine" element={<AppNutritionistMinePage />} />
    <Route path="diet/templates" element={<DietTemplatesPage />} />
    <Route path="diet/tracking/:id" element={<DietTrackingPage />} />
    <Route path="mine/income" element={<NutritionistIncomeDetailPage />} />
  </Routes>
);

// ============ 健康管理师路由 ============
const HmRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Navigate to="workbench" replace />} />
    <Route path="workbench" element={<AppHmWorkbenchPage />} />
    <Route path="patients" element={<AppHmPatientsPage />} />
    <Route path="visit" element={<AppHmVisitPage />} />
    <Route path="mine" element={<AppHmMinePage />} />
  </Routes>
);

// ============ 药师路由 ============
const PharmacistRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Navigate to="workbench" replace />} />
    <Route path="workbench" element={<PharmacistWorkbenchPage />} />
    <Route path="audit" element={<Navigate to="/medical/pharmacist/workbench" replace />} />
    <Route path="audit/:prescriptionId" element={<PharmacistAuditPage />} />
    <Route path="mine" element={<AppPharmacistMinePage />} />
  </Routes>
);

// ============ 医管APP 整体壳 ============
const MedicalApp: React.FC = () => {
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const location = useLocation();

  // 按角色路由分发
  const roleRoutes: Record<string, React.ReactNode> = {
    DOCTOR: <DoctorRoutes />,
    PHARMACIST: <PharmacistRoutes />,
    NUTRITIONIST: <NutritionistRoutes />,
    HEALTH_MANAGER: <HmRoutes />,
  };

  // 判断是否全屏页面
  const isFullScreen = location.pathname.includes('/consult/chat/');

  // 计算当前tab
  const getTabRoute = () => {
    const p = location.pathname;
    const base = `/medical/${String(medicalUser?.role || '').toLowerCase()}`;
    if (p.startsWith(`${base}/consult`)) return `${base}/consult`;
    if (p.startsWith(`${base}/patients`)) return `${base}/patients`;
    if (p.startsWith(`${base}/diet`)) return `${base}/diet`;
    if (p.startsWith(`${base}/live`)) return `${base}/live`;
    if (p.startsWith(`${base}/visit`)) return `${base}/visit`;
    if (p.startsWith(`${base}/audit`)) return `${base}/audit`;
    if (p.startsWith(`${base}/mine`)) return `${base}/mine`;
    return `${base}/workbench`;
  };

  return (
    <RequireMedicalAuth>
      <div style={{
        width: 390, height: '100vh', margin: '0 auto',
        display: 'flex', flexDirection: 'column', background: '#f5f5f5',
        boxShadow: '0 0 30px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {!isFullScreen && <MedicalHeader />}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="doctor/*" element={medicalUser?.role === 'DOCTOR' ? roleRoutes.DOCTOR : <Navigate to={`/medical/${String(medicalUser?.role || 'doctor').toLowerCase()}`} replace />} />
            <Route path="nutritionist/*" element={medicalUser?.role === 'NUTRITIONIST' ? roleRoutes.NUTRITIONIST : <Navigate to={`/medical/${String(medicalUser?.role || 'doctor').toLowerCase()}`} replace />} />
            <Route path="health-manager/*" element={medicalUser?.role === 'HEALTH_MANAGER' ? roleRoutes.HEALTH_MANAGER : <Navigate to={`/medical/${String(medicalUser?.role || 'doctor').toLowerCase()}`} replace />} />
            <Route path="pharmacist/*" element={medicalUser?.role === 'PHARMACIST' ? roleRoutes.PHARMACIST : <Navigate to={`/medical/${String(medicalUser?.role || 'doctor').toLowerCase()}`} replace />} />
            <Route path="*" element={<Navigate to={`/medical/${String(medicalUser?.role || 'doctor').toLowerCase()}`} replace />} />
          </Routes>
        </div>
        {!isFullScreen && medicalUser?.role && (
          <MedicalTabBar currentPath={getTabRoute()} role={medicalUser.role} />
        )}
      </div>
    </RequireMedicalAuth>
  );
};

export default MedicalApp;
