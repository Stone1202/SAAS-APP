/**
 * SugarMate 门户网站 — V1.0.0
 *
 * 功能：
 * - 未登录用户看到的门户首页
 * - 登录入口 → /login
 * - 入驻申请入口 → /onboarding/apply
 */
import React from 'react';
import { Button, Layout, Typography, Space, Card, Row, Col, Divider } from 'antd';
import { LoginOutlined, FormOutlined, MedicineBoxOutlined, TeamOutlined, SafetyCertificateOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const PortalPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  // 已登录用户访问门户 → 直接跳转后台
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f6ffed 100%)' }}>
      {/* 顶部导航 */}
      <Header style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Space>
          <MedicineBoxOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>SugarMate</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>· 医药健康服务平台</Text>
        </Space>
        <Space>
          <Button
            icon={<SearchOutlined />}
            size="large"
            onClick={() => navigate('/status')}
          >
            审核进度查询
          </Button>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            onClick={() => navigate('/login')}
          >
            登录
          </Button>
          <Button
            icon={<FormOutlined />}
            size="large"
            onClick={() => navigate('/apply')}
          >
            入驻申请
          </Button>
        </Space>
      </Header>

      {/* 主内容 */}
      <Content style={{ padding: '64px 48px' }}>
        {/* Hero 区域 */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 64px' }}>
          <Title level={1} style={{ fontSize: 48, marginBottom: 24, color: '#1a1a2e' }}>
            连接医药健康生态
          </Title>
          <Paragraph style={{ fontSize: 18, color: '#666', lineHeight: 1.8 }}>
            SugarMate 是面向药店、医生、药师、营养师等医药健康从业者的
            <br />
            一站式服务平台，提供入驻管理、商品上架、在线问诊、健康咨询等全链路服务
          </Paragraph>
          <Space size="large" style={{ marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              style={{ height: 48, fontSize: 16, padding: '0 32px' }}
              onClick={() => navigate('/login')}
            >
              立即登录
            </Button>
            <Button
              size="large"
              icon={<FormOutlined />}
              style={{ height: 48, fontSize: 16, padding: '0 32px' }}
              onClick={() => navigate('/apply')}
            >
              申请入驻
            </Button>
          </Space>
        </div>

        <Divider />

        {/* 服务角色 */}
        <div style={{ maxWidth: 1000, margin: '48px auto' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 48 }}>
            平台服务角色
          </Title>
          <Row gutter={[24, 24]}>
            {[
              {
                icon: <MedicineBoxOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
                title: '药店入驻',
                desc: '药品经营许可证、GSP认证药店，在线销售处方药与非处方药',
              },
              {
                icon: <TeamOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
                title: '医生入驻',
                desc: '执业医师资格认证，提供在线问诊、处方开具、健康咨询服务',
              },
              {
                icon: <SafetyCertificateOutlined style={{ fontSize: 40, color: '#722ed1' }} />,
                title: '药师入驻',
                desc: '执业药师资格认证，提供用药指导、处方审核、药品咨询服务',
              },
              {
                icon: <MedicineBoxOutlined style={{ fontSize: 40, color: '#fa8c16' }} />,
                title: '营养师入驻',
                desc: '注册营养师资格认证，提供营养评估、膳食指导、慢病管理服务',
              },
            ].map((item, i) => (
              <Col span={12} key={i}>
                <Card
                  hoverable
                  style={{ height: '100%', borderRadius: 12 }}
                  bodyStyle={{ padding: 32 }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {item.icon}
                    <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                    <Paragraph type="secondary" style={{ margin: 0, lineHeight: 1.6 }}>
                      {item.desc}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Divider />

        {/* 入驻流程 */}
        <div style={{ maxWidth: 800, margin: '48px auto', textAlign: 'center' }}>
          <Title level={3} style={{ marginBottom: 32 }}>入驻流程</Title>
          <Row gutter={16} justify="center">
            {['提交申请', '资质审核', '电子签约', '正式上线'].map((step, i) => (
              <Col key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#1890ff', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 'bold', margin: '0 auto 12px',
                }}>
                  {i + 1}
                </div>
                <Text strong>{step}</Text>
              </Col>
            ))}
          </Row>
          <Button
            type="primary"
            size="large"
            icon={<FormOutlined />}
            style={{ marginTop: 32, height: 48, fontSize: 16, padding: '0 32px' }}
            onClick={() => navigate('/apply')}
          >
            开始入驻申请
          </Button>
        </div>
      </Content>

      {/* 底部 */}
      <Footer style={{ textAlign: 'center', background: '#f5f5f5', color: '#999' }}>
        <Text type="secondary">SugarMate © 2026 · 医药健康服务平台</Text>
      </Footer>
    </Layout>
  );
};

export default PortalPage;
