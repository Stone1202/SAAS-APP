/**
 * MpRiskAssessmentPage — PG-SUG-MP-003 风险评估问卷
 */
import React, { useState } from 'react';
import { Typography, Radio, Button, Progress, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import MpPageFrame from '../../components/MpPageFrame';

const { Title, Text } = Typography;

type Answer = 'A' | 'B' | 'C' | null;

interface Question { id: number; text: string; options: { value: Answer; label: string; score: number }[] }

const QUESTIONS: Question[] = [
  { id: 1, text: '您的年龄在哪个范围？', options: [{ value: 'A', label: '45岁以下', score: 0 }, { value: 'B', label: '45-55岁', score: 1 }, { value: 'C', label: '55岁以上', score: 2 }] },
  { id: 2, text: '您的BMI指数大约是多少？', options: [{ value: 'A', label: '<24（正常）', score: 0 }, { value: 'B', label: '24-28（超重）', score: 1 }, { value: 'C', label: '>28（肥胖）', score: 2 }] },
  { id: 3, text: '直系亲属中是否有糖尿病患者？', options: [{ value: 'A', label: '没有', score: 0 }, { value: 'B', label: '有一个', score: 1 }, { value: 'C', label: '有多个', score: 2 }] },
  { id: 4, text: '您的运动频率如何？', options: [{ value: 'A', label: '每周3次以上', score: 0 }, { value: 'B', label: '每周1-2次', score: 1 }, { value: 'C', label: '很少运动', score: 2 }] },
  { id: 5, text: '您是否有以下症状？（多选）', options: [{ value: 'A', label: '无明显症状', score: 0 }, { value: 'B', label: '偶尔口渴/乏力', score: 1 }, { value: 'C', label: '经常口渴/多尿/体重下降', score: 2 }] },
];

const MpRiskAssessmentPage: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const navigate = useNavigate();
  const currentQ = (Object.keys(answers).length);
  const progress = Math.round((currentQ / QUESTIONS.length) * 100);
  const allAnswered = currentQ >= QUESTIONS.length;

  const setAnswer = (qId: number, val: Answer) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = () => {
    const total = QUESTIONS.reduce((sum, q) => sum + (q.options.find(o => o.value === answers[q.id])?.score || 0), 0);
    navigate('/mp/assessment/result', { state: { score: total } });
  };

  const q = QUESTIONS[currentQ];

  return (
    <MpPageFrame title="风险评估">
      <div style={{ padding: 16, background: '#fff', minHeight: '100%' }}>
        <Title level={5} style={{ textAlign: 'center', marginBottom: 4 }}>糖尿病风险评估</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12, marginBottom: 12 }}>
          回答以下问题，了解您的糖尿病风险等级
        </Text>
        <Progress percent={progress} size="small" style={{ marginBottom: 16 }} />
        {q && (
          <Card style={{ borderRadius: 10 }}>
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 16 }}>
              {q.id}. {q.text}
            </Text>
            <Radio.Group onChange={e => setAnswer(q.id, e.target.value)} value={answers[q.id]} style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {q.options.map(opt => (
                  <Radio key={opt.value} value={opt.value} style={{ display: 'block', padding: '8px 0', fontSize: 14 }}>
                    {opt.label}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        )}
        {allAnswered && (
          <Button type="primary" block size="large" onClick={handleSubmit} style={{ marginTop: 20, borderRadius: 10 }}>
            查看评估结果
          </Button>
        )}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>{currentQ}/{QUESTIONS.length} 题</Text>
        </div>
      </div>
    </MpPageFrame>
  );
};
export default MpRiskAssessmentPage;
