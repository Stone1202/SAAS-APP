/**
 * APP营养师饮食方案页
 */
import React from 'react';
import { Card, Tag, Button, Timeline } from 'antd';
import { EditOutlined, CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import MobileFrame, { APP_NUTRITIONIST_TABS } from '@/components/MobileFrame';

const AppNutritionistDietPage: React.FC = () => {
  return (
    <MobileFrame title="饮食方案" tabs={APP_NUTRITIONIST_TABS} basePath="/app/nutritionist">
      <div style={{ padding: 12 }}>
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>当前方案 · 张先生</span>}
          extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontSize: 11 }}>调整</Button>}>
          <div style={{ fontSize: 12, lineHeight: 1.8 }}>
            <div><Tag color="blue">目标</Tag> 日热量 1800kcal · 碳水45% · 蛋白20% · 脂肪35%</div>
            <div style={{ marginTop: 8 }}>
              <Tag color="green">早餐</Tag> 全麦面包2片 + 鸡蛋1个 + 脱脂奶200ml
            </div>
            <div><Tag color="orange">午餐</Tag> 糙米饭150g + 清蒸鱼100g + 西兰花200g</div>
            <div><Tag color="purple">晚餐</Tag> 杂粮粥 + 鸡胸肉100g + 凉拌黄瓜</div>
            <div><Tag color="cyan">加餐</Tag> 坚果15g / 苹果半个</div>
          </div>
        </Card>

        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>执行情况</span>}>
          <Timeline items={[
            { color: 'green', children: <><b>07-28</b> 全天达标 ✅ · 餐后血糖6.2</> },
            { color: 'orange', children: <><b>07-27</b> 晚餐超标 ⚠️ · 餐后血糖7.8 · 外出聚餐</> },
            { color: 'green', children: <><b>07-26</b> 全天达标 ✅ · 餐后血糖5.9</> },
          ]} />
        </Card>

        <Button type="primary" block icon={<PlayCircleOutlined />} style={{ borderRadius: 10 }}>
          直播·饮食指导
        </Button>
      </div>
    </MobileFrame>
  );
};

export default AppNutritionistDietPage;
