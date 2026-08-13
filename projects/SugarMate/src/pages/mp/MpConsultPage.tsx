/**
 * 小程序 - 轻问诊首页
 * 
 * 改造：对接PC后台医生和服务数据，不再硬编码
 * 医生来源：merchantStore（PC后台医生管理）
 * 服务来源：consultationServiceStore（PC后台服务管理）
 * 数据闭环：admin CRUD → store → MP消费
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchBar, Card, List, Avatar, Tag, Space,
  Skeleton, Tabs, NavBar,
} from 'antd-mobile';
import {
  SearchOutline, MessageOutline, AudioOutline,
  VideoOutline, StarFill, RightOutline,
} from 'antd-mobile-icons';
import { useMerchantStore } from '@/stores/merchantStore';
import { useConsultationServiceStore, type ConsultMode } from '@/stores/consultationServiceStore';

// ==================== 模式标签 ====================

const MODE_TAG: Record<ConsultMode, { label: string; color: string }> = {
  text: { label: '图文', color: '#1890ff' },
  voice: { label: '语音', color: '#52c41a' },
  video: { label: '视频', color: '#722ed1' },
  phone: { label: '电话', color: '#fa8c16' },
};

// ==================== 组件 ====================

const MpConsultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState('all');

  // 从PC后台获取数据
  const doctors = useMerchantStore(s => s.doctors.filter(d => d.status === 'active' || d.status === 'online'));
  const { services, loadServices } = useConsultationServiceStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadServices(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // 搜索筛选
  const filteredDoctors = useMemo(() => {
    let list = doctors;
    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(kw) ||
        (d.department || '').toLowerCase().includes(kw) ||
        (d.specializations || []).some(s => s.toLowerCase().includes(kw))
      );
    }
    if (activeDept !== 'all') {
      list = list.filter(d => d.department === activeDept);
    }
    return list;
  }, [doctors, searchText, activeDept]);

  // 科室列表
  const departments = useMemo(
    () => ['all', ...Array.from(new Set(doctors.map(d => d.department).filter(Boolean) as string[]))],
    [doctors]
  );

  // 医生服务数
  const getDoctorServiceCount = (doctorId: string) =>
    services.filter(s => s.doctorId === doctorId && s.status === 'published').length;

  if (loading) {
    return <div style={{ padding: 16 }}><Skeleton.Title animated /><Skeleton.Paragraph lineCount={5} animated /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar>在线问诊</NavBar>

      {/* 搜索 */}
      <div style={{ padding: '0 12px 8px' }}>
        <SearchBar
          placeholder="搜索医生、科室、擅长领域"
          value={searchText}
          onChange={setSearchText}
          showCancelButton
        />
      </div>

      {/* 科室筛选 */}
      <div style={{ padding: '0 12px 12px' }}>
        <Tabs
          activeKey={activeDept}
          onChange={setActiveDept}
          style={{ '--title-font-size': '13px' } as React.CSSProperties}
        >
          {departments.map(dept => (
            <Tabs.Tab title={dept === 'all' ? '全部' : dept} key={dept} />
          ))}
        </Tabs>
      </div>

      {/* 医生列表 */}
      <div style={{ padding: '0 12px' }}>
        {filteredDoctors.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40 }}>
            <span style={{ color: "##999" }}>未找到匹配的医生</span>
          </Card>
        ) : (
          <List>
            {filteredDoctors.map((doc) => {
              const svcCount = getDoctorServiceCount(doc.id);
              const docServices = services.filter(s => s.doctorId === doc.id && s.status === 'published');
              return (
                <List.Item
                  key={doc.id}
                  clickable
                  onClick={() => navigate(`/mp/doctor/${doc.id}`)}
                  prefix={
                    <Avatar
                      src={doc.avatar}
                      style={{ '--size': '48px', borderRadius: 8 } as React.CSSProperties}
                    >
                      {doc.name?.[0]}
                    </Avatar>
                  }
                  extra={<RightOutline />}
                  description={
                    <Space direction="vertical" size={2}>
                      <span style={{ fontSize: 13, color: '#666' }}>
                        {doc.hospital || doc.shopName || ''} · {doc.title || doc.department || ''}
                      </span>
                      <Space wrap size={[0, 4]}>
                        {docServices.slice(0, 3).map(s => (
                          <Tag
                            key={s.id}
                            color={MODE_TAG[s.mode]?.color}
                            style={{ fontSize: 10, padding: '0 4px' }}
                          >
                            {MODE_TAG[s.mode]?.label} ¥{s.price}
                          </Tag>
                        ))}
                        {docServices.length > 3 && (
                          <span style={{ fontSize: 11, color: '#999' }}>+{docServices.length - 3}</span>
                        )}
                      </Space>
                      <span style={{ fontSize: 11, color: '#bbb' }}>
                        从业{doc.experienceYears || '—'}年 · 擅长{(doc.specializations || []).slice(0, 3).join('、')}
                      </span>
                    </Space>
                  }
                >
                  <Space>
                    <span style={{ fontSize: 15 }}>{doc.name}</span>
                    {doc.rating && (
                      <Space size={2}>
                        <StarFill style={{ color: '#faad14', fontSize: 12 }} />
                        <span style={{ color: '#faad14', fontSize: 12 }}>{doc.rating}</span>
                      </Space>
                    )}
                  </Space>
                </List.Item>
              );
            })}
          </List>
        )}
      </div>
    </div>
  );
};

export default MpConsultPage;
