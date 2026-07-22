"""
SAAS 内容审查域 — Mock后端

基于 Zod Schema（audit-schemas.ts）生成 Mock 路由
V1 用途：Sim模式下前端可在需要时切换到Real模式对接此Mock后端
         提供标准的REST API + WebSocket实时推送

运行：
  pip install fastapi uvicorn
  uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import uuid4
import random
import asyncio
import json

app = FastAPI(title="SAAS Audit Mock Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 数据模型（对齐 Zod Schema）
# ============================================

ViolationLevel = Literal["L1", "L2", "L3", "L4"]
DisposalStatus = Literal["pending", "recorded", "cut_off", "ignored", "timeout", "archived"]
MuteMode = Literal["silent", "beep"]


class AuditSwitchRequest(BaseModel):
    tenant_id: str
    enabled: bool


class DisposalRequest(BaseModel):
    violation_id: str
    disposal_type: str
    reason: str
    operator: str = "运营人员"


class TenantAuditConfig(BaseModel):
    tenant_id: str
    tenant_name: str
    industry: str
    stream_domain: str
    audit_enabled: bool = False
    today_violation_count: int = 0
    mute_mode: MuteMode = "silent"


class ReviewViolation(BaseModel):
    violation_id: str = Field(default_factory=lambda: str(uuid4()))
    stream_id: str = "stream_mock_0001"
    audit_type: str = "audio"
    violation_type: str = "porn"
    violation_level: ViolationLevel = "L2"
    violation_content: str = ""
    violation_time: str = Field(default_factory=lambda: datetime.now().isoformat())
    suggestion: str = "review"
    confidence: int = 80
    keyword: str = ""
    evidence_url: str = ""
    raw_callback: dict = {}
    audio_muted: bool = False
    mute_duration: int = 0
    disposal_status: DisposalStatus = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class AlertStats(BaseModel):
    l1: int = 0
    l2: int = 0
    l3: int = 0
    l4: int = 0
    total: int = 0


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


# ============================================
# 内存数据存储
# ============================================

# 租户审查配置
tenant_config = TenantAuditConfig(
    tenant_id="T-001",
    tenant_name="XX科技",
    industry="电商",
    stream_domain="push.example.com",
    audit_enabled=False,
    today_violation_count=0,
    mute_mode="silent",
)

# 违规列表（按stream_id分组）
violations_db: dict[str, list[ReviewViolation]] = {}

# WebSocket连接管理
ws_connections: list[WebSocket] = []


# ============================================
# REST API
# ============================================

@app.post("/api/audit/switch")
def toggle_audit_switch(req: AuditSwitchRequest):
    """租户审查开关"""
    tenant_config.tenant_id = req.tenant_id
    tenant_config.audit_enabled = req.enabled
    return ApiResponse(
        success=True,
        data=tenant_config.model_dump(),
    )


@app.get("/api/audit/violations/{live_id}")
def get_violations(live_id: str):
    """获取违规列表"""
    violations = violations_db.get(live_id, [])

    stats = AlertStats(
        l1=sum(1 for v in violations if v.violation_level == "L1"),
        l2=sum(1 for v in violations if v.violation_level == "L2"),
        l3=sum(1 for v in violations if v.violation_level == "L3"),
        l4=sum(1 for v in violations if v.violation_level == "L4"),
        total=len(violations),
    )

    return ApiResponse(
        success=True,
        data={
            "violations": [v.model_dump() for v in violations],
            "stats": stats.model_dump(),
            "field_status": "live",
            "callback_lost": False,
        },
    )


@app.post("/api/audit/disposal")
def dispose_violation(req: DisposalRequest):
    """违规处置"""
    for violations in violations_db.values():
        for violation in violations:
            if violation.violation_id == req.violation_id:
                if req.disposal_type == "cut_off":
                    violation.disposal_status = "cut_off"
                elif req.disposal_type == "ignore":
                    violation.disposal_status = "ignored"
                else:
                    violation.disposal_status = "recorded"

                return ApiResponse(
                    success=True,
                    data={
                        "disposal_id": str(uuid4()),
                        "violation_id": req.violation_id,
                        "disposal_type": req.disposal_type,
                        "disposal_reason": req.reason,
                        "operator": req.operator,
                        "operated_at": datetime.now().isoformat(),
                    },
                )

    return ApiResponse(success=False, error="违规记录不存在")


@app.get("/api/audit/replay/{live_id}/mute-status")
def get_mute_status(live_id: str):
    """回放擦音状态"""
    return ApiResponse(
        success=True,
        data={
            "task": None,
            "can_retry": True,
        },
    )


# ============================================
# WebSocket — 实时推送
# ============================================

@app.websocket("/ws/audit")
async def websocket_audit(websocket: WebSocket):
    await websocket.accept()
    ws_connections.append(websocket)

    try:
        # 定时推送模拟违规事件
        while True:
            await asyncio.sleep(random.randint(5, 15))

            event = {
                "type": "violation",
                "payload": {
                    "violation_id": str(uuid4()),
                    "violation_level": random.choice(["L1", "L2", "L3", "L4"]),
                    "violation_type": random.choice(["porn", "violence", "abuse", "ad_law"]),
                    "violation_content": f"模拟违规内容 - {datetime.now().isoformat()}",
                    "violation_time": datetime.now().isoformat(),
                },
                "timestamp": datetime.now().isoformat(),
            }
            await websocket.send_json(event)

    except WebSocketDisconnect:
        ws_connections.remove(websocket)


# ============================================
# 启动
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
