import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Rate, TextArea, Tag, Toast, Space } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';

const EVAL_TAGS = ['专业负责', '回复详细', '耐心温柔', '推荐精准', '响应迅速', '态度好'];

const EvaluationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { submitEvaluation } = useConsultationStore();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['专业负责']);
  const isDispute = searchParams.get('dispute') === '1';

  const handleSubmit = async () => {
    if (!orderId) return;
    await submitEvaluation(orderId, rating, content, selectedTags);
    Toast.show({ icon: 'success', content: '评价成功' });
    navigate('/app/consultation', { replace: true });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <AppPageFrame title={isDispute ? '申诉反馈' : '评价问诊'}>
      <div style={{ padding: 16 }}>
        {!isDispute && (
          <Card style={{ borderRadius: 12, marginBottom: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>为本次问诊评分</div>
            <Rate
              value={rating}
              onChange={v => setRating(v)}
              style={{ '--star-size': '32px', '--active-color': '#ff4d4f' } as any}
            />
            <div style={{ fontSize: 13, color: '#999', marginTop: 8 }}>
              {rating >= 5 ? '非常满意' : rating >= 4 ? '满意' : rating >= 3 ? '一般' : '不满意'}
            </div>
            <div style={{ marginTop: 12, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>选择评价标签</div>
              <Space wrap>
                {EVAL_TAGS.map(tag => (
                  <Tag
                    key={tag}
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    fill={selectedTags.includes(tag) ? 'solid' : 'outline'}
                    onClick={() => toggleTag(tag)}
                    style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 16, fontSize: 12 }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Card>
        )}

        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            {isDispute ? '请描述您的问题' : '补充评价内容（可选）'}
          </div>
          <TextArea
            placeholder={isDispute ? '请详细描述您对本次问诊的问题...' : '分享您的问诊体验...'}
            rows={4}
            value={content}
            onChange={setContent}
            style={{ borderRadius: 10, background: '#fafafa' }}
          />
        </Card>

        <Button
          color="primary"
          block
          size="large"
          onClick={handleSubmit}
          style={{ borderRadius: 24, marginTop: 12 }}
        >
          {isDispute ? '提交申诉' : '提交评价'}
        </Button>
        {!isDispute && (
          <Button
            color="default"
            fill="none"
            block
            onClick={() => navigate('/app/consultation')}
            style={{ marginTop: 8 }}
          >
            稍后再说
          </Button>
        )}
      </div>
    </AppPageFrame>
  );
};

export default EvaluationPage;
