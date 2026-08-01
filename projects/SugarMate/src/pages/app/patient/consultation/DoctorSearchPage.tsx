import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, Card, Tag, Rate, Space, Tabs } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useMerchantStore } from '../../../../stores/merchantStore';
import { useConsultationServiceStore } from '../../../../stores/consultationServiceStore';

const DEPARTMENTS = ['全部', '内分泌科', '心血管内科', '临床营养科', '眼科', '足病科', '药学科'];

/** 将 merchantStore 的医生数据转换为患者端展示模型 */
const useOnlineDoctorList = () => {
  const merchants = useMerchantStore(s => s.merchants);
  const services = useConsultationServiceStore(s => s.services);
  const loadServices = useConsultationServiceStore(s => s.loadServices);

  useEffect(() => {
    loadServices();
  }, []);

  return useMemo(() => {
    return merchants
      .filter(m => m.role === 'DOCTOR' && m.lifecycleStatus === 'ONLINE')
      .map(m => {
        const doctorServices = services.filter(s => s.doctorId === m.id && s.status === 'published');
        const minPrice = doctorServices.length > 0
          ? Math.min(...doctorServices.map(s => s.price))
          : null;
        return {
          id: m.id,
          name: m.name,
          title: m.title || '',
          hospital: m.company || '',
          department: m.department || '',
          avatar: m.avatar || '',
          specializations: m.specialties || [],
          rating: 5.0,
          orderCount: services.filter(s => s.doctorId === m.id).reduce((sum, s) => sum + s.orderCount, 0),
          services: doctorServices,
          minPrice,
        };
      });
  }, [merchants, services]);
};

const DoctorSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const doctors = useOnlineDoctorList();
  const [keyword, setKeyword] = useState('');
  const [dept, setDept] = useState('全部');

  // 前端过滤（关键词 + 科室）
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      if (dept !== '全部' && d.department !== dept) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        return (
          d.name.toLowerCase().includes(kw) ||
          d.department.toLowerCase().includes(kw) ||
          d.hospital.toLowerCase().includes(kw) ||
          d.specializations.some(s => s.toLowerCase().includes(kw))
        );
      }
      return true;
    });
  }, [doctors, keyword, dept]);

  return (
    <AppPageFrame title="在线问诊">
      <div style={{ padding: 12, background: '#fff' }}>
        <SearchBar
          placeholder="搜索医生、科室、疾病..."
          value={keyword}
          onChange={v => setKeyword(v)}
          onSearch={v => { setKeyword(v); }}
          style={{ '--border-radius': '20px' } as any}
        />
        <Tabs
          activeKey={dept}
          onChange={k => setDept(k)}
          style={{ marginTop: 8, '--title-font-size': '13px' } as any}
        >
          {DEPARTMENTS.map(d => (
            <Tabs.Tab title={d} key={d} />
          ))}
        </Tabs>
      </div>

      <div style={{ padding: '0 12px', paddingBottom: 24 }}>
        {filteredDoctors.map(doctor => (
          <Card
            key={doctor.id}
            onClick={() => navigate(`/app/service/doctor/${doctor.id}`)}
            style={{ marginTop: 12, borderRadius: 12, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#1677ff', flexShrink: 0 }}>
                {doctor.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{doctor.name}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>{doctor.title}</span>
                </div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{doctor.hospital}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{doctor.department}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {doctor.specializations.slice(0, 3).map((s, i) => (
                    <Tag key={i} color="primary" fill="outline" style={{ fontSize: 11, '--border-radius': '12px' } as any}>{s}</Tag>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space>
                    <Rate value={doctor.rating} readOnly style={{ '--star-size': '14px' } as any} />
                    <span style={{ fontSize: 12, color: '#666' }}>{doctor.rating}</span>
                    <span style={{ fontSize: 12, color: '#ccc' }}>| 接诊{doctor.orderCount}</span>
                  </Space>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>
                    {doctor.minPrice !== null ? `¥${doctor.minPrice}起` : '暂无服务'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredDoctors.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无匹配的医生</div>
        )}
      </div>
    </AppPageFrame>
  );
};

export default DoctorSearchPage;
