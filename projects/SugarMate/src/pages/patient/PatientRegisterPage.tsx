/**
 * 患者APP 注册页
 * 填写信息 → 注册 → SCRM客户池自动同步 → 自动登录 → 进入患者端
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Input, Select, DatePicker, Form, message } from 'antd';
import { PhoneOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { useAppAuthStore } from '../../stores/appAuthStore';
import dayjs from 'dayjs';

const DIABETES_OPTIONS = [
  { label: '1型糖尿病', value: 'type1' as const },
  { label: '2型糖尿病', value: 'type2' as const },
  { label: '妊娠期糖尿病', value: 'gestational' as const },
  { label: '糖尿病前期', value: 'prediabetes' as const },
];

const PatientRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registerPatient = useAppAuthStore(s => s.registerPatient);
  const patientUser = useAppAuthStore(s => s.patientUser);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [diabetesType, setDiabetesType] = useState<'type1' | 'type2' | 'gestational' | 'prediabetes'>('type2');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 计算注册后跳转目标：优先还原守卫保存的原始页面，否则回首页
  const redirectTo = (location.state as any)?.from || '/patient/home';

  // 已登录 → 恢复到原始页面
  useEffect(() => {
    if (patientUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [patientUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号');
      return;
    }
    setSendingCode(true);
    await new Promise(r => setTimeout(r, 800));
    setSendingCode(false);
    setCodeSent(true);
    setError('');
    message.success('验证码已发送（模拟码：888888）');
    setCountdown(60);
  };

  const handleRegister = async () => {
    if (!name.trim()) { message.warning('请输入姓名'); return; }
    if (!phone.trim()) { message.warning('请输入手机号'); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { message.warning('请输入正确的手机号'); return; }
    if (!code.trim()) { message.warning('请输入验证码'); return; }

    setLoading(true);
    setError('');
    try {
      await registerPatient({
        name: name.trim(),
        phone: phone.trim(),
        gender,
        birthDate: birthDate || undefined,
        diabetes_type: diabetesType,
      });
      message.success('注册成功，正在进入...');
      navigate(redirectTo, { replace: true });
    } catch (e: any) {
      setError(e.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <div style={{
        width: 420, padding: '40px 32px', background: '#fff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 10px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', fontWeight: 'bold',
          }}>糖</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1a1a2e' }}>注册 SugarMate</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8c8c8c' }}>注册即同步至平台客户池</p>
        </div>

        {/* 姓名 */}
        <div style={{ marginBottom: 16 }}>
          <Input
            size="large"
            placeholder="请输入真实姓名"
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            maxLength={20}
          />
        </div>

        {/* 性别 */}
        <div style={{ marginBottom: 16 }}>
          <Select
            size="large"
            value={gender}
            onChange={v => setGender(v)}
            style={{ width: '100%' }}
            options={[
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
            ]}
          />
        </div>

        {/* 出生日期 */}
        <div style={{ marginBottom: 16 }}>
          <DatePicker
            size="large"
            placeholder="选择出生日期"
            style={{ width: '100%' }}
            value={birthDate ? dayjs(birthDate) : null}
            onChange={d => setBirthDate(d ? d.format('YYYY-MM-DD') : '')}
            disabledDate={d => d?.isAfter(dayjs())}
          />
        </div>

        {/* 糖尿病类型 */}
        <div style={{ marginBottom: 16 }}>
          <Select
            size="large"
            value={diabetesType}
            onChange={v => setDiabetesType(v)}
            style={{ width: '100%' }}
            options={DIABETES_OPTIONS}
          />
        </div>

        {/* 手机号 */}
        <div style={{ marginBottom: 16 }}>
          <Input
            size="large"
            placeholder="请输入手机号"
            prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
            value={phone}
            onChange={e => { setPhone(e.target.value); setError(''); }}
            maxLength={11}
          />
        </div>

        {/* 验证码 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Input
            size="large"
            placeholder="验证码"
            prefix={<SafetyOutlined style={{ color: '#bfbfbf' }} />}
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            style={{ flex: 1 }}
          />
          <Button
            size="large"
            disabled={!phone || countdown > 0}
            loading={sendingCode}
            onClick={sendCode}
            style={{ minWidth: 110 }}
          >
            {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 12px', marginBottom: 16, borderRadius: 8,
            background: '#fff2f0', border: '1px solid #ffccc7',
            color: '#cf1322', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Register Button */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleRegister}
          style={{
            height: 44, borderRadius: 8, fontSize: 16,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
          }}
        >
          注 册
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: '#8c8c8c' }}>
            已有账号？
          </span>
          <Link to="/patient/login" style={{ fontSize: 13, color: '#667eea', marginLeft: 4, fontWeight: 500 }}>
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientRegisterPage;
