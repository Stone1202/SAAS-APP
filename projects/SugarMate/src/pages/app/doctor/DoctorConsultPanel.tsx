/**
 * DoctorConsultPanel - 医生接诊面板 V2.0.0
 * 对接业务后台 merchantStore：读取在线医生数据，替代旧硬编码 MOCK_DOCTORS
 * 医生查看待接诊订单 + 管理活跃问诊
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Badge, Tabs, Toast } from 'antd-mobile';
import AppPageFrame from '../../../components/AppPageFrame';
import { useConsultationStore } from '../../../stores/consultationStore';
import { useMerchantStore } from '../../../stores/merchantStore';
import { useAppAuthStore } from '../../../stores/appAuthStore';

const DoctorConsultPanel: React.FC = () => {
  const navigate = useNavigate();
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const merchants = useMerchantStore(s => s.merchants);
  const { orders, loadOrders, acceptConsultation, loadMessages, init } = useConsultationStore();
  const [pending, setPending] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);

  // 当前登录医生 = merchantStore 中匹配手机号的在线医生（用于页面展示）
  const onlineDoctors = useMemo(
    () => merchants.filter(m => m.role === 'DOCTOR' && m.lifecycleStatus === 'ONLINE'),
    [merchants]
  );

  const merchantDoctor = useMemo(() => {
    if (medicalUser?.phone) {
      const matched = onlineDoctors.find(d => d.phone === medicalUser.phone);
      if (matched) return matched;
    }
    return onlineDoctors[0] || null;
  }, [onlineDoctors, medicalUser]);

  // V2.2.1：通过 consultationStore 的 phone→doctor_id 映射，解析问诊医生的 consultation ID
  const [consultDoctorId, setConsultDoctorId] = useState<string>('');

  useEffect(() => {
    if (!medicalUser?.phone && !medicalUser?.name) return;

    init().then(() => {
      const storeState = useConsultationStore.getState();
      const resolved = storeState.resolveDoctorConsultId(medicalUser.phone, medicalUser.name);

      if (resolved) {
        setConsultDoctorId(resolved);
        loadOrders(undefined, resolved);
      } else {
        // 映射失败兜底：全量加载，客户端侧过滤
        console.warn('[DOCTOR-PANEL] 无法将当前医生映射到问诊医生ID，使用全量加载', {
          phone: medicalUser.phone,
          name: medicalUser.name,
          doctorsCount: storeState.doctors.length,
        });
        loadOrders(undefined); // 加载全部订单
      }
    });
  }, [medicalUser?.phone, medicalUser?.name]);

  useEffect(() => {
    setPending(orders.filter(o => o.status === 'PENDING_ACCEPT'));
    setActive(orders.filter(o =>
      ['ACCEPTED', 'IN_CONSULT', 'PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED',
       'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'RX_AWAITING_PATIENT',
       'RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED', 'PRESCRIPTION_FLOWING',
       'WAITING_PATIENT_CONFIRM'].includes(o.status)
    ));
  }, [orders]);

  const handleAccept = async (order: any) => {
    await acceptConsultation(order.id, order.doctor_id);
    Toast.show({ icon: 'success', content: '已接诊' });
    await loadMessages(order.id);
    navigate(`/app/doctor/consult/chat/${order.id}`);
  };

  const getUrgencyColor = (urgency: string) =>
    urgency === 'SOS' ? 'danger' : urgency === 'URGENT' ? 'warning' : 'primary';

  // 如果没有匹配到在线医生，显示轻量级警告但不阻断订单展示（医生可能在其他终端上线）
  const showMerchantWarning = !merchantDoctor && medicalUser?.phone;

  return (
    <AppPageFrame title="问诊管理">
      {/* 当前接诊医生信息 */}
      <Card style={{ margin: 12, borderRadius: 12, background: showMerchantWarning ? '#fffbe6' : undefined }} bodyStyle={{ padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          当前接诊医生
          {showMerchantWarning && <Tag color="warning" style={{ marginLeft: 8, fontSize: 10 }}>未匹配在线医生</Tag>}
        </div>
        {merchantDoctor ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 21, background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff' }}>
              {merchantDoctor.name?.[0] || 'D'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{merchantDoctor.name || '--'}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {merchantDoctor.title} · {merchantDoctor.company} · {merchantDoctor.department}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#ad6800' }}>
            ⚠️ 未在商户后台匹配到「已上线」状态的医生，请确认医生已在后台管理中上线。
            <br />若医生在其他终端已上线，可忽略此提示。
          </div>
        )}
      </Card>

      <Tabs style={{ '--title-font-size': '15px' } as any}>
        <Tabs.Tab title={`待接诊 (${pending.length})`} key="pending">
          <div style={{ padding: 12 }}>
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无待接诊订单
                <div style={{ fontSize: 12, marginTop: 8 }}>患者端选择「{merchantDoctor?.name || (medicalUser?.name) || '医生'}」下单后，将出现在这里</div>
              </div>
            ) : (
              pending.map(order => (
                <Card key={order.id} style={{ borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge content={order.urgency === 'SOS' ? 'SOS' : ''} color="#ff4d4f">
                        <div style={{ width: 40, height: 40, borderRadius: 20, background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#1677ff' }}>
                          P
                        </div>
                      </Badge>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>患者 {order.patient_id}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {new Date(order.created_at).toLocaleString()} · ¥{order.paid_amount / 100}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Tag color={getUrgencyColor(order.urgency)}>{order.urgency === 'SOS' ? 'SOS' : order.urgency === 'URGENT' ? '紧急' : '普通'}</Tag>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    block
                    style={{ borderRadius: 20 }}
                    onClick={() => handleAccept(order)}
                  >
                    立即接诊
                  </Button>
                </Card>
              ))
            )}
          </div>
        </Tabs.Tab>

        <Tabs.Tab title={`问诊中 (${active.length})`} key="active">
          <div style={{ padding: 12 }}>
            {active.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无进行中的问诊</div>
            ) : (
              active.map(order => (
                <Card
                  key={order.id}
                  style={{ borderRadius: 12, marginBottom: 12, cursor: 'pointer' }}
                  onClick={() => navigate(`/app/doctor/consult/chat/${order.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>患者 {order.patient_id}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {new Date(order.created_at).toLocaleString()} · ¥{order.paid_amount / 100}
                      </div>
                    </div>
                    <Tag color={
                      order.status === 'IN_CONSULT' ? 'success' :
                      order.status.includes('PRESCRIPTION') || order.status.includes('RX') ? 'warning' :
                      'default'
                    }>
                      {useConsultationStore.getState().getStateLabel(order.status)}
                    </Tag>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs.Tab>
      </Tabs>
    </AppPageFrame>
  );
};

export default DoctorConsultPanel;
