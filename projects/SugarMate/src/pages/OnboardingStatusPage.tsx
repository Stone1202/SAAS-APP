/**
 * PG-SUG-PC-012 我的入驻申请 V1.0.0
 *
 * 门户端：用户通过手机号查询入驻申请状态
 * - 待审核 → 查看进度
 * - 需补充资料 → 上传补充材料重新提交
 * - 审核不通过 → 查看驳回原因（可重新申请）
 * - 审核通过 → 查看签约状态
 * - 签约中 → 查看/签署电子合同
 * - 已上线 → 提示进入后台
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Form, Input, Button, Typography, Steps, Tag, Space, Descriptions,
  Alert, Result, Upload, Divider, message, List, Timeline, Modal, Spin, Popconfirm, Image,
} from 'antd';
import {
  PhoneOutlined, SearchOutlined, UploadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, FormOutlined, ReloadOutlined,
  MedicineBoxOutlined, FileProtectOutlined,
  ArrowLeftOutlined, EditOutlined, HomeOutlined,
} from '@ant-design/icons';
import { useOnboardingStore, STATUS_LABEL, ONBOARD_STEPS, ROLE_CONFIG, STATUS_STEP_MAP } from '@/stores/onboardingStore';
import type { OnboardRole, OnboardingStatus, Certificate, OnboardingApplication } from '@/stores/onboardingStore';

const { Title, Text, Paragraph } = Typography;

const STATUS_COLOR: Record<OnboardingStatus, string> = {
  DRAFT: 'default', PENDING: 'processing', INFO_APPROVED: 'blue',
  CERT_APPROVED: 'blue', NEED_SUPPLEMENT: 'warning',
  REJECTED: 'error', APPROVED: 'success', SIGNING: 'processing',
  SIGNED: 'success', ONLINE: 'green', FROZEN: 'warning', WITHDRAWN: 'default',
};

const STATUS_ICON: Record<OnboardingStatus, React.ReactNode> = {
  DRAFT: <FormOutlined />, PENDING: <SearchOutlined />,
  INFO_APPROVED: <CheckCircleOutlined />, CERT_APPROVED: <CheckCircleOutlined />,
  NEED_SUPPLEMENT: <ExclamationCircleOutlined />, REJECTED: <CloseCircleOutlined />,
  APPROVED: <CheckCircleOutlined />, SIGNING: <FileTextOutlined />,
  SIGNED: <CheckCircleOutlined />, ONLINE: <CheckCircleOutlined />,
  FROZEN: <CloseCircleOutlined />, WITHDRAWN: <CloseCircleOutlined />,
};

const OnboardingStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phoneFromUrl = searchParams.get('phone') || '';
  const appIdFromUrl = searchParams.get('appId') || '';

  const { getAppByOwner, getAppById, getAppsByStatus, supplementApplication, signContract } = useOnboardingStore();
  const applications = useOnboardingStore(s => s.applications);

  const [phone, setPhone] = useState(phoneFromUrl);
  const [appId, setAppId] = useState<string | null>(appIdFromUrl || null);
  // 从 store 实时派生 app，确保 store 变更后自动更新
  const app = useMemo<OnboardingApplication | null>(
    () => appId ? (applications.find(a => a.id === appId) || null) : null,
    [applications, appId],
  );
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  // allApps 从 store 实时派生，无需本地缓存
  const allApps = applications;
  const [showAll, setShowAll] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [form] = Form.useForm();

  // 通过 subscribe 监听 store 变化判定水合完成，比 onRehydrateStorage 更可靠
  useEffect(() => {
    const unsub = useOnboardingStore.subscribe(() => {
      setHydrated(true);
    });
    // 如果已经水合，立即设置
    if (applications.length > 0) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  // 同时兜底：500ms 后如果仍未水合也放行（避免永久阻塞）
  useEffect(() => {
    const t = setTimeout(() => {
      setHydrated(true);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // URL带appId优先直接定位（比手机号更可靠）
  useEffect(() => {
    if (!hydrated) return;

    if (appIdFromUrl) {
      setLoading(true);
      const found = getAppById(appIdFromUrl);
      if (found) {
        setPhone(found.phone || '');
      }
      setAppId(appIdFromUrl);
      setSearched(true);
      setLoading(false);
    } else if (phoneFromUrl) {
      handleLookup(phoneFromUrl);
    }
  }, [appIdFromUrl, phoneFromUrl, hydrated]);

  const handleLookup = (phoneNumber?: string) => {
    const p = (phoneNumber || phone).trim();
    if (!p || !/^1[3-9]\d{9}$/.test(p)) {
      message.warning('请输入正确的手机号');
      return;
    }
    if (!hydrated) {
      message.warning('正在加载入驻数据，请稍后再试');
      return;
    }
    setLoading(true);
    setShowAll(false);
    // 水合已完成，直接同步查询即可（不再需要 setTimeout hack）
    const found = getAppByOwner(p);
    setAppId(found?.id || null);
    setSearched(true);
    setLoading(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setSearched(true);
  };

  const handleSupplement = (values: any) => {
    if (!app) return;
    const supplements: any = {};
    if (values.name) supplements.name = values.name;
    if (values.company) supplements.company = values.company;
    if (values.address) supplements.address = values.address;
    if (values.idCard) supplements.idCard = values.idCard;
    if (values.phone) supplements.phone = values.phone;

    // 处理证照更新 — 保留已有证照的 URL，只重置为 pending 重新进入审核
    if (values.certificates) {
      const existingCerts = app.certificates || [];
      const certs: Certificate[] = Object.entries(values.certificates).map(([name, _]: [string, any]) => {
        const existing = existingCerts.find(c => c.type === name);
        if (existing) {
          // 保留已有证照的 url、name 等信息，仅重置状态
          return { ...existing, status: 'pending' as const };
        }
        return {
          id: `cert-${Date.now()}-${name}`,
          type: name,
          name: `${name}.jpg`,
          status: 'pending' as const,
        };
      });
      supplements.certificates = certs;
    }

    supplementApplication(app.id, supplements);
    setEditing(false);
    message.success('补充资料已重新提交，请等待审核');
  };

  // 状态卡片渲染
  const renderStatusView = () => {
    if (!app) return null;

    const roleConfig = ROLE_CONFIG[app.role];
    const currentStep = STATUS_STEP_MAP[app.status] ?? 0;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 步骤进度条 */}
        <Card>
          <Steps
            current={currentStep}
            status={app.status === 'REJECTED' ? 'error' : app.status === 'NEED_SUPPLEMENT' ? 'process' : undefined}
            items={ONBOARD_STEPS.map((step, i) => ({
              title: step.title,
              description: i === currentStep && app.status !== 'ONLINE' && app.status !== 'REJECTED'
                ? STATUS_LABEL[app.status] : undefined,
            }))}
          />
        </Card>

        {/* 异常状态：审核不通过 */}
        {app.status === 'REJECTED' && (
          <Alert
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            message="审核不通过"
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>{app.rejectReason || '您的入驻申请未通过审核'}</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    审核时间：{app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : '-'}
                  </Text>
                </div>
              </Space>
            }
            action={
              <Space direction="vertical">
                <Button type="primary" size="small" onClick={() => navigate('/apply')}>
                  重新申请入驻
                </Button>
                <Button size="small" onClick={() => navigate('/')}>
                  返回首页
                </Button>
              </Space>
            }
          />
        )}

        {/* 需补充资料 */}
        {app.status === 'NEED_SUPPLEMENT' && !editing && (
          <Alert
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message="需补充资料"
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>审核意见：</Text>
                <Text>{app.rejectReason || '请补充以下资料后重新提交'}</Text>
                {app.supplementItems && app.supplementItems.length > 0 && (
                  <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Text strong>需补充的资料清单：</Text>
                    <List
                      size="small"
                      dataSource={app.supplementItems}
                      renderItem={(item) => (
                        <List.Item>
                          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                          {item}
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </Space>
            }
            action={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(true);
                  form.setFieldsValue({
                    name: app.name,
                    company: app.company,
                    address: app.address,
                    idCard: app.idCard,
                    phone: app.phone,
                  });
                }}
              >
                立即补充资料
              </Button>
            }
          />
        )}

        {/* 补充资料编辑表单 */}
        {app.status === 'NEED_SUPPLEMENT' && editing && (
          <Card title="补充资料">
            {/* 按真实证书状态派生：只列出被驳回或过期的证书 */}
            {(() => {
              const needResubmit = (app.certificates || []).filter(
                c => c.status === 'invalid' || c.status === 'expired'
              );
              return needResubmit.length > 0 ? (
                <Alert
                  type="warning"
                  showIcon
                  message={`请重新上传以下 ${needResubmit.length} 项被驳回/过期的证照`}
                  description={
                    <Space wrap>
                      {needResubmit.map(c => (
                        <Tag key={c.id} color={c.status === 'expired' ? 'red' : 'orange'}>
                          {c.name || c.type}{c.status === 'expired' ? '（已过期）' : '（已驳回）'}
                        </Tag>
                      ))}
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                />
              ) : null;
            })()}
            <Form form={form} layout="vertical" onFinish={handleSupplement}>
              <Form.Item name="name" label="姓名/机构名称" rules={[{ required: true }]}>
                <Input placeholder="姓名或机构名称" />
              </Form.Item>
              <Form.Item name="company" label="执业机构">
                <Input placeholder="如：广州市第一人民医院" />
              </Form.Item>
              <Form.Item name="idCard" label="身份证号">
                <Input placeholder="18位身份证号" />
              </Form.Item>
              <Form.Item name="phone" label="手机号" rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
                <Input placeholder="手机号" />
              </Form.Item>
              {/* 按真实证书状态渲染：只显示 invalid/expired 的证书 */}
              {(() => {
                const needResubmit = (app.certificates || []).filter(
                  c => c.status === 'invalid' || c.status === 'expired'
                );
                if (needResubmit.length === 0) {
                  return (
                    <Form.Item label="需重新上传的证照">
                      <Text type="secondary">无（管理员未标记需重新上传的证照）</Text>
                    </Form.Item>
                  );
                }
                return (
                  <Form.Item label="需重新上传的证照">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {needResubmit.map(c => (
                        <div key={c.id} style={{
                          padding: '8px 12px',
                          background: '#fff7e6',
                          border: '1px dashed #ffa940',
                          borderRadius: 6,
                        }}>
                          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                              <Text strong>{c.name || c.type}</Text>
                              <Tag color={c.status === 'expired' ? 'red' : 'orange'}>
                                {c.status === 'expired' ? '已过期' : '已驳回'}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                编号：{c.certNo || '-'}
                              </Text>
                            </Space>
                            <Upload
                              maxCount={1}
                              beforeUpload={() => false}
                              onChange={(info) => {
                                // 同步上传的文件到 form values（key 用 cert.type）
                                const fileList = info.fileList;
                                form.setFieldValue(['certificates', c.type], fileList);
                              }}
                            >
                              <Button size="small" icon={<UploadOutlined />}>重新上传</Button>
                            </Upload>
                          </Space>
                        </div>
                      ))}
                    </Space>
                  </Form.Item>
                );
              })()}
              <Space>
                <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                  提交补充资料
                </Button>
                <Button onClick={() => setEditing(false)}>取消</Button>
              </Space>
            </Form>
          </Card>
        )}

        {/* 审核通过/签约/上线 */}
        {['INFO_APPROVED', 'CERT_APPROVED', 'APPROVED', 'SIGNING', 'SIGNED', 'ONLINE'].includes(app.status) && (
          <Alert
            type={app.status === 'ONLINE' ? 'success' : 'info'}
            showIcon
            icon={STATUS_ICON[app.status]}
            message={STATUS_LABEL[app.status]}
            description={
              app.status === 'ONLINE'
                ? '恭喜！您的入驻申请已全部通过，现在可以使用手机号登录后台管理系统'
                : app.status === 'SIGNED'
                  ? '签约已完成，等待运营人员确认上线'
                  : app.status === 'SIGNING'
                    ? '运营方已向您发送电子合同，请尽快签署'
                    : '您的资料已通过审核，请耐心等待后续流程'
            }
            action={
              <Space direction="vertical">
                {app.status === 'SIGNING' && (
                  <>
                    <Button
                      type="default"
                      size="small"
                      icon={<FileTextOutlined />}
                      onClick={() => setPreviewOpen(true)}
                    >
                      预览合同
                    </Button>
                    <Popconfirm
                      title="确认签署电子合同"
                      description={
                        <div>
                          <Text>签署后将无法撤销，请确认合同内容无误</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            合同编号：{app.contract?.contractNo || app.contract?.contractId || '-'}
                          </Text>
                        </div>
                      }
                      onConfirm={() => {
                        setSigning(true);
                        try {
                          signContract(app.id);
                          message.success('签署成功');
                        } catch (err: any) {
                          message.error(err?.message || '签署失败');
                        } finally {
                          setSigning(false);
                        }
                      }}
                      okText="确认签署"
                      cancelText="再想想"
                      placement="topRight"
                    >
                      <Button type="primary" size="small" icon={<FileTextOutlined />} loading={signing}>
                        签署电子合同
                      </Button>
                    </Popconfirm>
                  </>
                )}
                {app.status === 'ONLINE' && (
                  <Button type="primary" size="small" onClick={() => navigate('/login')}>
                    进入后台
                  </Button>
                )}
              </Space>
            }
          />
        )}

        {/* 基本信息卡片 */}
        <Card title="基本信息">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="申请编号">{app.id}</Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag color="blue">{roleConfig.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="姓名/名称">{app.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{app.phone}</Descriptions.Item>
            <Descriptions.Item label="执业机构" span={2}>{app.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={STATUS_COLOR[app.status]}>{STATUS_LABEL[app.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {new Date(app.createdAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 审核进度时间线 */}
        {app.statusHistory && app.statusHistory.length > 0 && (
          <Card title="审核进度">
            <Timeline
              items={app.statusHistory.map((h) => ({
                color: h.to === 'REJECTED' ? 'red' : h.to === 'NEED_SUPPLEMENT' ? 'orange' : h.to === 'ONLINE' ? 'green' : 'blue',
                children: (
                  <Space direction="vertical" size={0}>
                    <Text strong>{STATUS_LABEL[h.to] || h.to}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(h.at).toLocaleString()} · {h.operator}
                    </Text>
                    {h.note && <Text style={{ fontSize: 13 }}>{h.note}</Text>}
                  </Space>
                ),
              }))}
            />
          </Card>
        )}

        {/* SLA */}
        {app.slaDeadline && app.status === 'PENDING' && (
          <Alert
            type="info"
            message={`审核进行中 · 预计 ${Math.ceil((app.slaDeadline - Date.now()) / 86400000)} 个工作日内完成`}
            description={`SLA截止时间：${new Date(app.slaDeadline).toLocaleDateString()}`}
          />
        )}
      </Space>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f6ffed 100%)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* 顶部导航 */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>SugarMate</Title>
          </Space>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回首页</Button>
            <Button type="primary" onClick={() => navigate('/apply')}>申请入驻</Button>
          </Space>
        </div>

        {/* 查询表单 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>我的入驻申请</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            输入您提交入驻申请时使用的手机号，查看审核进度
            {!hydrated && <Spin size="small" style={{ marginLeft: 8 }} />}
          </Text>
          <Space>
            <Form layout="inline" onFinish={() => handleLookup()}>
              <Form.Item
                name="phone"
                rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
                initialValue={phone}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="请输入入驻手机号"
                  style={{ width: 260 }}
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading || !hydrated} disabled={!hydrated}>
                查询进度
              </Button>
            </Form>
          </Space>
          {phoneFromUrl && !app && searched && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                未找到 {phoneFromUrl} 的入驻申请记录，请确认手机号是否正确，或
                <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/apply')}>
                  发起入驻申请
                </Button>
              </Text>
            </div>
          )}
          {appIdFromUrl && !app && searched && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                未找到申请编号 {appIdFromUrl} 对应的记录，该申请可能已被撤回，或
                <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/apply')}>
                  重新发起入驻申请
                </Button>
              </Text>
            </div>
          )}
        </Card>

        {/* 查询结果 */}
        {loading && (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
            <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>查询中...</Text>
          </Card>
        )}
        {/* 查询失败：未找到记录 */}
        {searched && !loading && !app && !showAll && (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <ExclamationCircleOutlined style={{ fontSize: 48, color: '#999' }} />
            <Title level={4} style={{ color: '#999', marginTop: 16 }}>
              未找到入驻申请
            </Title>
            <Text type="secondary">
              未找到该手机号对应的入驻申请记录，请确认手机号是否正确
            </Text>
            <Space direction="vertical" style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => navigate('/apply')}>
                立即入驻申请
              </Button>
              <Button onClick={handleShowAll}>
                查看所有申请记录
              </Button>
            </Space>
          </Card>
        )}

        {/* 显示所有申请记录 */}
        {searched && !loading && showAll && (
          <Card title="所有入驻申请记录">
            {allApps.length === 0 ? (
              <Text type="secondary">暂无申请记录</Text>
            ) : (
              <List
                dataSource={allApps}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="link" onClick={() => {
                        setAppId(item.id);
                        setPhone(item.phone || '');
                        setShowAll(false);
                      }}>
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{ROLE_CONFIG[item.role]?.icon || ''}</span>
                          <span>{item.name || '未命名'}</span>
                          <Tag color={STATUS_COLOR[item.status]}>{STATUS_LABEL[item.status]}</Tag>
                        </Space>
                      }
                      description={
                        <Space size="large">
                          <Text type="secondary">编号：{item.id}</Text>
                          <Text type="secondary">手机号：{item.phone || '—'}</Text>
                          <Text type="secondary">提交时间：{new Date(item.createdAt).toLocaleString()}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button onClick={() => setShowAll(false)}>返回查询</Button>
            </div>
          </Card>
        )}

        {/* 查询成功 */}
        {searched && !loading && app && (
          renderStatusView()
        )}

        {/* P0-3: 合同预览弹窗 */}
        <Modal
          title="电子合同预览"
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          width={680}
          footer={[
            <Button key="cancel" onClick={() => setPreviewOpen(false)}>关闭</Button>,
            app?.status === 'SIGNING' && (
              <Popconfirm
                key="sign"
                title="确认签署电子合同"
                description="签署后将无法撤销，请确认合同内容无误"
                onConfirm={() => {
                  setPreviewOpen(false);
                  setSigning(true);
                  try {
                    signContract(app.id);
                    message.success('签署成功');
                  } catch (err: any) {
                    message.error(err?.message || '签署失败');
                  } finally {
                    setSigning(false);
                  }
                }}
                okText="确认签署"
                cancelText="再想想"
              >
                <Button type="primary" loading={signing}>确认并签署</Button>
              </Popconfirm>
            ),
          ].filter(Boolean)}
        >
          <Card size="small" style={{ background: '#fafafa' }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="合同编号">{app?.contract?.contractNo || app?.contract?.contractId || '-'}</Descriptions.Item>
              <Descriptions.Item label="合同状态">
                <Tag color="processing">待签署</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="甲方（服务商）">SugarMate 健康管理平台</Descriptions.Item>
              <Descriptions.Item label="乙方">{app?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color="blue">{app?.role ? ROLE_CONFIG[app.role]?.label : '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="手机号">{app?.phone || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Divider orientation="left" plain style={{ fontSize: 13 }}>服务协议</Divider>
          <div style={{
            maxHeight: 320,
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: '16px 20px',
            fontSize: 13,
            lineHeight: 2,
            color: '#333',
          }}>
            <Paragraph>
              <Text strong>一、协议总则</Text><br />
              1.1 本协议是乙方（入驻商家/成员）与甲方（SugarMate 健康管理平台）之间就平台入驻、服务使用及合作事宜达成的法律协议。<br />
              1.2 乙方确认已充分阅读、理解并接受本协议的全部条款内容。
            </Paragraph>
            <Paragraph>
              <Text strong>二、入驻条件</Text><br />
              2.1 乙方需为合法注册的医疗机构、药房或持有有效执业资质的医师、药师、营养师。<br />
              2.2 乙方需提供真实、准确、完整的资质证明材料，并承诺材料在有效期内。<br />
              2.3 甲方有权对乙方资质进行审核，审核不通过的，甲方有权拒绝入驻。
            </Paragraph>
            <Paragraph>
              <Text strong>三、服务规范</Text><br />
              3.1 乙方应在执业范围内提供专业健康管理服务，不得超范围提供服务。<br />
              3.2 乙方应保证服务过程中的信息真实、准确，不得发布虚假或误导性信息。<br />
              3.3 乙方应遵守平台的服务标准和质量要求，保障用户权益。
            </Paragraph>
            <Paragraph>
              <Text strong>四、数据与隐私</Text><br />
              4.1 双方应严格遵守《个人信息保护法》等法律法规，保护用户隐私和数据安全。<br />
              4.2 乙方不得将平台用户数据用于本协议约定之外的用途，不得私自留存、复制或传播用户信息。
            </Paragraph>
            <Paragraph>
              <Text strong>五、费用与结算</Text><br />
              5.1 乙方使用平台服务产生的费用按平台公布的标准执行。<br />
              5.2 甲方按月为乙方提供收入结算，结算周期及费用标准以平台最新政策为准。
            </Paragraph>
            <Paragraph>
              <Text strong>六、违约责任</Text><br />
              6.1 任一方违反本协议约定的，应承担相应的违约责任，并赔偿对方因此遭受的损失。<br />
              6.2 甲方有权对乙方违反平台规则的行为采取警告、限制功能、冻结账号、终止合作等措施。
            </Paragraph>
            <Paragraph>
              <Text strong>七、其他</Text><br />
              7.1 本协议自乙方电子签署之日起生效。<br />
              7.2 本协议的最终解释权归甲方所有。
            </Paragraph>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OnboardingStatusPage;
