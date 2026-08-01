/**
 * 医管APP 登录页（医生 / 药师 / 营养师 / 健康管理师）
 * 手机号验证 → 匹配商家人员库 → 校验 lifecycleStatus=ONLINE → 按角色进入对应工作台
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAppAuthStore } from '../../stores/appAuthStore';

const ROLE_MAP: Record<string, { label: string; homePath: string }> = {
  DOCTOR: { label: '医生', homePath: '/medical/doctor' },
  PHARMACIST: { label: '药师', homePath: '/medical/pharmacist' },
  NUTRITIONIST: { label: '营养师', homePath: '/medical/nutritionist' },
  HEALTH_MANAGER: { label: '健康管理师', homePath: '/medical/health-manager' },
};

const MedicalLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const medicalLogin = useAppAuthStore(s => s.medicalLogin);
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 已登录 → 按角色跳转
  useEffect(() => {
    if (medicalUser) {
      const path = ROLE_MAP[medicalUser.role]?.homePath || '/medical/doctor';
      navigate(path, { replace: true });
    }
  }, [medicalUser, navigate]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号');
      return;
    }
    setSendingCode(true);
    await new Promise(r => setTimeout(r, 800));
    setSendingCode(false);
    setCodeSent(true);
    message.success('验证码已发送（模拟码：888888）');
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!phone.trim()) { message.warning('请输入手机号'); return; }
    if (!code.trim()) { message.warning('请输入验证码'); return; }
    setLoading(true);
    setError('');
    try {
      const s = await medicalLogin(phone.trim());
      const path = ROLE_MAP[s.role]?.homePath || '/medical/doctor';
      message.success(`欢迎，${s.name}${ROLE_MAP[s.role] ? `（${ROLE_MAP[s.role].label}）` : ''}`);
      navigate(path, { replace: true });
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f4c81 0%, #1a8fe3 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <div style={{
        width: 380, padding: '40px 32px', background: '#fff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #0f4c81, #1a8fe3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', fontWeight: 'bold',
          }}>医</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#1a1a2e' }}>SugarMate 医管端</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8c8c8c' }}>医生 · 药师 · 营养师 · 健康管理师</p>
        </div>

        {/* Phone */}
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

        {/* Code */}
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

        {/* Login Button */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleLogin}
          style={{
            height: 44, borderRadius: 8, fontSize: 16,
            background: 'linear-gradient(135deg, #0f4c81, #1a8fe3)',
            border: 'none',
          }}
        >
          登 录
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: '#8c8c8c' }}>
            仅支持已上线人员登录 · 账号问题请联系管理员
          </span>
        </div>
      </div>
    </div>
  );
};

export default MedicalLoginPage;
