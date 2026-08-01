#!/bin/bash
# 用 mmdc 将 6 张 Mermaid 图渲染为高清 PNG
set -e
OUT="/Users/jojo/Desktop/原型设计/九天科技/AI-SCRM/projects/SAAS/docs/09-versions/v1.0.0/prd-html/screenshots"
MMDC="npx @mermaid-js/mermaid-cli/mmdc"

mkdir -p "$OUT/mermaid-src"
cd "$OUT/mermaid-src"

# 图1：业务流程图
cat > fig01-backend-flow.mmd << 'MERMAID'
flowchart TB
    A[平台运营管理审查开关] --> B{租户审查开关}
    B -->|开启| C[租户直播中控显示内容审查Tab]
    B -->|关闭| C2[主播正常直播无干扰]
    C --> D[主播开始直播/推流模拟]
    C2 --> D
    D --> E[模拟回调数据生成器触发违规事件]
    E --> F{检测到违规?}
    F -->|是| G[直播中控展示违规告警]
    F -->|否| H[正常直播继续]
    G --> I{运营处置}
    I -->|记录| J[记录违规不打断直播]
    I -->|断流| K[切断推流终止直播]
    I -->|忽略| L[标记非违规]
    I -->|30秒超时| J
    G --> M{直播中途关闭审查?}
    M -->|是| M2[违规列表只读+待处理自动归档]
    H --> N[直播结束→回放文件生成]
    J --> N
    K --> N
    L --> N
    N --> O[触发回放擦音模拟]
    O --> P{擦音结果}
    P -->|成功| Q[展示擦音前后对比→待人工核对]
    P -->|超时| Q2[播放器锁定+手动重试]
    P -->|失败| Q3[展示原片+警告标注+可重试]
    Q --> R1{人工核对}
    R1 -->|核对通过| R2[运营确认发布→观众可看回放]
    R1 -->|驳回| R3[重新擦音→回到O]
    E --> S[观众端感知擦音效果]
    S --> T{擦音模式}
    T -->|静音| U["🔇静音2-5秒"]
    T -->|擦音| V["🎧嘀声2-5秒"]
    K --> W["观众端: 直播已结束，因内容违规已终止"]
    M2 --> X[观众端: 擦音效果停止]
MERMAID

# 图2：信息流转图
cat > fig02-info-flow.mmd << 'MERMAID'
flowchart LR
    subgraph 模拟层
        Mock[模拟回调数据生成器]
    end
    subgraph 租户后台
        Ctrl[直播中控审查Tab]
        Disp[处置服务]
    end
    subgraph 观众端
        Viewer[观众直播间]
    end
    subgraph 存储
        DB[(违规记录-Mock)]
    end
    Mock -->|违规事件| Ctrl
    Mock -->|擦音触发| Viewer
    Ctrl -->|处置指令| Disp
    Disp -->|处置记录| DB
    Ctrl -->|擦音模式切换| Viewer
    Viewer -->|静音/擦音效果| Viewer
MERMAID

# 图3：违规处置状态机
cat > fig03-violation-state.mmd << 'MERMAID'
stateDiagram-v2
    [*] --> 待处理: 模拟违规事件触发
    待处理 --> 已记录: 运营选择记录
    待处理 --> 已断流: 运营选择断流
    待处理 --> 已忽略: 运营选择忽略
    待处理 --> 已超时: 30秒未处置
    待处理 --> 已归档: 审查关闭/场次结束
    已超时 --> 已记录: 系统自动记录
    已记录 --> [*]
    已断流 --> [*]
    已忽略 --> [*]
    已归档 --> [*]
MERMAID

# 图4：回放发布状态机
cat > fig04-replay-state.mmd << 'MERMAID'
stateDiagram-v2
    [*] --> 待核对: 擦音完成
    待核对 --> 已核对: 运营核对通过
    待核对 --> 已驳回: 运营驳回
    已核对 --> 已发布: 运营确认发布
    已驳回 --> 待核对: 重新擦音完成
    已发布 --> [*]
MERMAID

# 图5：业务时序图
cat > fig05-business-seq.mmd << 'MERMAID'
sequenceDiagram
    participant Mock as 模拟数据生成器
    participant Ctrl as 直播中控
    participant 运营 as 直播运营
    participant Viewer as 观众端
    participant Playback as 回放擦音模拟
    Mock->>Ctrl: 模拟违规事件（定时触发）
    Ctrl->>Ctrl: 展示告警+违规列表
    Ctrl->>运营: 实时推送告警
    运营->>Ctrl: 处置（记录/断流/忽略）
    Ctrl->>Ctrl: 更新处置状态
    Mock->>Viewer: 模拟擦音触发
    Viewer->>Viewer: 展示静音/擦音效果（2-5秒）
    Note over Mock,Playback: 直播结束
    Mock->>Playback: 模拟回放文件生成
    Playback->>Playback: 擦音处理模拟
    Playback->>Playback: 擦音完成→待核对
    Playback->>运营: 展示擦音前后对比
    运营->>Playback: 核对通过·发布回放
    Playback->>Playback: 发布完成→观众可观看回放
MERMAID

# 图6：三方接口时序图
cat > fig06-api-seq.mmd << 'MERMAID'
sequenceDiagram
    Note over Mock,Viewer: V1纯前端模拟，不对接腾讯云API
    Mock->>Mock: 定时器生成模拟违规事件
    Note right of Mock: "模拟字段: hit_flag/score/label<br/>suggestion/asr_text/duration/seq/stream_id"
    Mock->>Ctrl: 模拟回调推送
    Ctrl->>Ctrl: 签名验证（模拟跳过）
    Ctrl->>Ctrl: 全量存储（Mock数据）
    Ctrl->>Ctrl: 实时展示告警
    Mock->>Viewer: 模拟擦音触发
    Viewer->>Viewer: 静音/擦音效果展示
MERMAID

# 逐个渲染
for fig in fig01-backend-flow fig02-info-flow fig03-violation-state fig04-replay-state fig05-business-seq fig06-api-seq; do
  case $fig in
    fig01-backend-flow) fname="DIAG-01-业务流程图" ;;
    fig02-info-flow) fname="DIAG-02-信息流转图" ;;
    fig03-violation-state) fname="DIAG-03-违规处置状态机" ;;
    fig04-replay-state) fname="DIAG-04-回放发布状态机" ;;
    fig05-business-seq) fname="DIAG-05-业务时序图" ;;
    fig06-api-seq) fname="DIAG-06-三方接口时序图" ;;
  esac
  echo "🖼  渲染: $fname"
  $MMDC -i "${fig}.mmd" -o "$OUT/${fname}.png" \
    -w 2400 -H 1600 \
    --backgroundColor white \
    --configFile /dev/stdin << 'MMDCONFIG'
{
  "theme": "default",
  "flowchart": { "htmlLabels": true },
  "sequence": { "mirrorActors": false }
}
MMDCONFIG
  echo "   ✅ $OUT/${fname}.png"
done

echo ""
echo "🎉 全部完成！"
ls -lh "$OUT"/DIAG-*.png