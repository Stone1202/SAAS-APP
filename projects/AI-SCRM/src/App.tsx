import { Routes, Route, Navigate } from 'react-router-dom';
import TenantLayout from './components/Layout/TenantLayout';
import OpsLayout from './components/Layout/OpsLayout';

// 租户后台页面
import Workbench from './pages/tenant/Workbench';
import CustomerList from './pages/tenant/CustomerList';
import CustomerDetail from './pages/tenant/CustomerDetail';
import TagManagement from './pages/tenant/TagManagement';
import UnifiedCommunication from './pages/tenant/UnifiedCommunication';
import CommunicationRecords from './pages/tenant/CommunicationRecords';
import CommunicationDetail from './pages/tenant/CommunicationDetail';
import ScriptLibrary from './pages/tenant/ScriptLibrary';
import TodoCenter from './pages/tenant/TodoCenter';
import FollowCalendar from './pages/tenant/FollowCalendar';
import Customer360 from './pages/tenant/Customer360';
import CustomerSegmentation from './pages/tenant/CustomerSegmentation';
import CommunicationAnalytics from './pages/tenant/CommunicationAnalytics';
import ConversionFunnel from './pages/tenant/ConversionFunnel';
import SystemSettings from './pages/tenant/SystemSettings';
import WeChatAuthManagement from './pages/tenant/WeChatAuthManagement';

// 运营后台页面
import OpsWorkbench from './pages/ops/OpsWorkbench';
import TenantList from './pages/ops/TenantList';
import TenantDetail from './pages/ops/TenantDetail';
import VersionMatrix from './pages/ops/VersionMatrix';
import SubscriptionOrders from './pages/ops/SubscriptionOrders';
import OrderDetail from './pages/ops/OrderDetail';
import AiUsageStats from './pages/ops/AiUsageStats';
import RevenueAnalytics from './pages/ops/RevenueAnalytics';

function App() {
  return (
    <Routes>
      {/* 默认跳转 */}
      <Route path="/" element={<Navigate to="/tenant" replace />} />

      {/* 兼容旧系统运营后台路径 /admin/tenant */}
      <Route path="/admin/tenant" element={<Navigate to="/ops/tenants" replace />} />

      {/* 租户后台 */}
      <Route path="/tenant" element={<TenantLayout />}>
        <Route index element={<Navigate to="/tenant/workbench" replace />} />
        <Route path="workbench" element={<Workbench />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="tags" element={<TagManagement />} />
        <Route path="communication" element={<UnifiedCommunication />} />
        <Route path="communication/records" element={<CommunicationRecords />} />
        <Route path="communication/records/:id" element={<CommunicationDetail />} />
        <Route path="scripts" element={<ScriptLibrary />} />
        <Route path="todos" element={<TodoCenter />} />
        <Route path="calendar" element={<FollowCalendar />} />
        <Route path="customer-360" element={<Customer360 />} />
        <Route path="segmentation" element={<CustomerSegmentation />} />
        <Route path="analytics/communication" element={<CommunicationAnalytics />} />
        <Route path="analytics/conversion" element={<ConversionFunnel />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="wechat-auth" element={<WeChatAuthManagement />} />
      </Route>

      {/* 运营后台 */}
      <Route path="/ops" element={<OpsLayout />}>
        <Route index element={<Navigate to="/ops/workbench" replace />} />
        <Route path="workbench" element={<OpsWorkbench />} />
        <Route path="tenants" element={<TenantList />} />
        <Route path="tenants/:id" element={<TenantDetail />} />
        <Route path="version-matrix" element={<VersionMatrix />} />
        <Route path="subscriptions" element={<SubscriptionOrders />} />
        <Route path="subscriptions/orders/:id" element={<OrderDetail />} />
        <Route path="ai-usage" element={<AiUsageStats />} />
        <Route path="revenue" element={<RevenueAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;
