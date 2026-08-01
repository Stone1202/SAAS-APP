#!/usr/bin/env python3
"""
Generate member and admin operation manuals as PDFs.
V1.5.0 - Updated for --goal unified parameter and goal-isolated version chains.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── Fonts ──
TITLE_FONT = '/System/Library/Fonts/STHeiti Medium.ttc'
BODY_FONT = '/System/Library/Fonts/STHeiti Light.ttc'
pdfmetrics.registerFont(TTFont('HeitiM', TITLE_FONT))
pdfmetrics.registerFont(TTFont('HeitiL', BODY_FONT))

# ── Colors ──
BRAND = HexColor('#1a56db')
ACCENT = HexColor('#3b82f6')
DARK = HexColor('#1e293b')
GRAY = HexColor('#64748b')
LIGHT_BG = HexColor('#f1f5f9')
BORDER = HexColor('#e2e8f0')
CODE_BG = HexColor('#f8fafc')
RED = HexColor('#dc2626')
RED_BG = HexColor('#fef2f2')
WIDTH, HEIGHT = A4

# ── Styles ──
def make_style(name, font='HeitiL', size=10.5, leading=17, color=DARK,
               align=TA_LEFT, space_before=1, space_after=2, **kw):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading,
                          textColor=color, alignment=align,
                          spaceBefore=space_before*mm, spaceAfter=space_after*mm, **kw)

S_COVER_TITLE = make_style('CT', 'HeitiM', 28, 38, BRAND, TA_CENTER, 0, 6)
S_COVER_SUB = make_style('CS', 'HeitiL', 14, 20, GRAY, TA_CENTER, 0, 3)
S_COVER_VER = make_style('CV', 'HeitiL', 11, 16, GRAY, TA_CENTER)
S_COVER_FOOT = make_style('CF', 'HeitiL', 9, 13, GRAY, TA_CENTER)

S_H1 = make_style('H1', 'HeitiM', 18, 26, DARK, space_before=10, space_after=4)
S_H2 = make_style('H2', 'HeitiM', 14, 20, BRAND, space_before=7, space_after=3)
S_H3 = make_style('H3', 'HeitiM', 12, 17, DARK, space_before=5, space_after=2)
S_BODY = make_style('Body', 'HeitiL', 10.5, 17, DARK, TA_JUSTIFY)
S_BULLET = make_style('Bul', 'HeitiL', 10.5, 17, DARK, TA_LEFT, leftIndent=12*mm, bulletIndent=6*mm)
S_CODE = make_style('Code', 'HeitiL', 9.5, 15, DARK, TA_LEFT,
                    backColor=CODE_BG, borderPadding=6, space_before=2, space_after=3,
                    leftIndent=6*mm, rightIndent=6*mm)
S_NOTE = make_style('Note', 'HeitiL', 10, 15, ACCENT, TA_LEFT,
                    leftIndent=4*mm, borderColor=ACCENT, borderWidth=1,
                    borderPadding=6, backColor=LIGHT_BG, space_before=3, space_after=3)
S_WARN = make_style('Warn', 'HeitiM', 10, 15, RED, TA_LEFT,
                    leftIndent=4*mm, borderColor=RED, borderWidth=1,
                    borderPadding=6, backColor=RED_BG, space_before=3, space_after=3)
S_TOC = make_style('TOC', 'HeitiL', 11, 22, DARK, TA_LEFT, leftIndent=8*mm)
S_TH = make_style('TH', 'HeitiM', 10, 14, white, TA_CENTER)
S_TD = make_style('TD', 'HeitiL', 10, 14, DARK)
S_FOOT = make_style('Foot', 'HeitiL', 8, 10, GRAY, TA_CENTER)


def cover_story(title, subtitle, version, date, audience, extra=None):
    story = [Spacer(1, 35*mm),
             Paragraph(title, S_COVER_TITLE),
             Spacer(1, 8*mm),
             HRFlowable(width='60%', thickness=1, color=BRAND, spaceAfter=8*mm),
             Paragraph(subtitle, S_COVER_SUB),
             Spacer(1, 6*mm),
             Paragraph('版本：' + version, S_COVER_VER),
             Paragraph('更新日期：' + date, S_COVER_VER),
             Spacer(1, 3*mm),
             Paragraph('适用范围：' + audience, S_COVER_VER)]
    if extra:
        for e in extra:
            story.append(Paragraph(e, S_COVER_VER))
    story.append(Spacer(1, 30*mm))
    story.append(HRFlowable(width='40%', thickness=0.5, color=BORDER, spaceAfter=6*mm))
    story.append(Paragraph('九天科技 \u00b7 AI-SCRM 协作平台 \u00b7 内部文档', S_COVER_FOOT))
    story.append(PageBreak())
    return story


def toc_story(items):
    story = [Paragraph('目 录', S_H1), Spacer(1, 5*mm)]
    for item in items:
        story.append(Paragraph(item, S_TOC))
    story.append(PageBreak())
    return story


def make_table(headers, rows, col_widths=None):
    data = [[Paragraph(h, S_TH) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), S_TD) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('HeitiL', 8)
    canvas.setFillColor(GRAY)
    canvas.drawCentredString(WIDTH/2, 15*mm, '- ' + str(doc.page) + ' -')
    canvas.restoreState()


def build_pdf(path, story, title='PDF'):
    doc = SimpleDocTemplate(path, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=20*mm, bottomMargin=25*mm,
                            title=title, author='九天科技')
    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)


# ════════════════════════════════════════════════════════
#  MEMBER MANUAL V1.5.0
# ════════════════════════════════════════════════════════
def build_member_manual():
    s = []

    # Cover
    s += cover_story('成员操作手册', 'AI-SCRM 协作平台',
                     'V1.5.0', '2026-07-29', '项目成员')

    # TOC
    s += toc_story([
        '一、平台简介',
        '二、环境准备',
        '    2.1 安装 Git',
        '    2.2 设置 Gitee 账号',
        '    2.3 克隆仓库',
        '    2.4 安装 Node.js 与依赖',
        '三、日常开发流程',
        '    3.1 拉取最新代码',
        '    3.2 创建功能分支',
        '    3.3 与 AI 协作开发',
        '    3.4 提交代码',
        '    3.5 推送并创建 Pull Request',
        '四、POM 命令速查',
        '    4.1 脑暴（/brainstorm）',
        '    4.2 初始化项目（/init）',
        '    4.3 变更需求（/change）',
        '    4.4 修复缺陷（/fix）',
        '    4.5 部署到预览环境（/deploy）',
        '    4.6 关闭版本（/close）',
        '    4.7 Goal 参数说明',
        '五、预览部署与访问',
        '六、常用链接',
        '七、常见问题',
        '八、版本历史',
    ])

    # ── 1. Platform intro ──
    s.append(Paragraph('一、平台简介', S_H1))
    s.append(Paragraph(
        'AI-SCRM 协作平台是九天科技内部使用的 AI 驱动型产品研发协作平台。'
        '平台基于 POM（Product-Oriented Methodology）方法论，'
        '通过 AI Agent 辅助完成需求分析、设计、开发、测试、部署等全流程。',
        S_BODY))
    s.append(Paragraph(
        '平台采用「代码驱动 + AI 协作」的工作方式。成员在本地 IDE 中通过自然语言命令与 AI 交互，'
        'AI 自动完成代码生成、文档编写、原型搭建等工作。',
        S_BODY))
    s.append(Paragraph(
        '<b>[提示]</b> 当前平台版本：POM V5.3.2+ &nbsp;|&nbsp; '
        '部署域名：prototype.jycao.cn &nbsp;|&nbsp; 代码仓库：Gitee',
        S_NOTE))
    s.append(Paragraph('当前成员', S_H3))
    s.append(Paragraph('目前平台注册成员如下：', S_BODY))
    s.append(Paragraph('\u00b7 Jojo（管理员）\u2014\u2014 可访问 AI-SCRM、SAAS、百货商城、群管易', S_BULLET))
    s.append(Paragraph('\u00b7 李政（成员）\u2014\u2014 可访问 AI-SCRM、SAAS', S_BULLET))

    # ── 2. Setup ──
    s.append(Paragraph('二、环境准备', S_H1))

    s.append(Paragraph('2.1 安装 Git', S_H2))
    s.append(Paragraph('macOS 系统通常已内置 Git。在终端中运行以下命令确认：', S_BODY))
    s.append(Paragraph('git --version', S_CODE))
    s.append(Paragraph('如果未安装，请访问 https://git-scm.com 下载安装。', S_BODY))

    s.append(Paragraph('2.2 设置 Gitee 账号', S_H2))
    s.append(Paragraph(
        '在使用之前，需要确认管理员已在 Gitee 仓库中将你添加为项目成员。'
        '如果你还没有 Gitee 账号，请先注册（https://gitee.com），然后将用户名告知管理员。',
        S_BODY))
    s.append(Paragraph(
        '<b>[注意] 重要：如果管理员未在 Gitee 仓库中添加你为成员，你将无法克隆代码和推送提交。</b>',
        S_WARN))

    s.append(Paragraph('2.3 克隆仓库', S_H2))
    s.append(Paragraph('打开终端，进入你的工作目录：', S_BODY))
    s.append(Paragraph(
        'cd ~/Desktop/原型设计/九天科技<br/>'
        '# 克隆仓库<br/>'
        'git clone https://gitee.com/jojo180712/pom-workspace.git AI-SCRM<br/>'
        'cd AI-SCRM', S_CODE))

    s.append(Paragraph('2.4 安装 Node.js 与依赖', S_H2))
    s.append(Paragraph('确保 Node.js &gt;= 18 已安装：', S_BODY))
    s.append(Paragraph(
        'node --version<br/>'
        '# 如果未安装，从 https://nodejs.org 下载<br/>'
        '# 安装项目依赖<br/>'
        'cd projects/AI-SCRM<br/>'
        'npm install', S_CODE))

    # ── 3. Daily workflow ──
    s.append(Paragraph('三、日常开发流程', S_H1))

    s.append(Paragraph('3.1 拉取最新代码', S_H2))
    s.append(Paragraph('每天开始工作前，先拉取仓库最新代码：', S_BODY))
    s.append(Paragraph('git checkout main<br/>git pull origin main', S_CODE))

    s.append(Paragraph('3.2 创建功能分支', S_H2))
    s.append(Paragraph(
        '为每个功能创建独立分支，命名格式：<b>feature/{成员名}/{goal}-{描述}</b>',
        S_BODY))
    s.append(Paragraph(
        '<b>V1.5.0 更新：</b>分支命名中的 {goal} 即 --goal 参数（如 live-audit）。',
        S_NOTE))
    s.append(Paragraph('git checkout -b feature/eltonliz/content-audit-init', S_CODE))

    s.append(Paragraph('3.3 与 AI 协作开发', S_H2))
    s.append(Paragraph(
        '在你的 IDE（如 VS Code + CodeBuddy 插件）中打开项目，使用自然语言与 AI 交互。'
        'AI 会理解你的需求并辅助完成编码、文档等任务。',
        S_BODY))
    s.append(Paragraph(
        '核心原则：你是需求决策者，AI 是执行辅助者。所有关键决策（技术选型、架构设计、视觉方案等）需要你来确认。',
        S_BODY))

    s.append(Paragraph('3.4 提交代码', S_H2))
    s.append(Paragraph('完成功能开发后提交代码：', S_BODY))
    s.append(Paragraph(
        'git add .<br/>'
        'git commit -m "feat: 内容审查模块初始化"<br/>'
        'git push origin feature/eltonliz/content-audit-init', S_CODE))

    s.append(Paragraph('3.5 推送并创建 Pull Request', S_H2))
    s.append(Paragraph(
        '在 Gitee 仓库页面中创建 Pull Request（PR），将你的分支合并到 main。'
        'PR 需要至少一位 CODEOWNERS 审批通过后才能合并。',
        S_BODY))
    s.append(Paragraph(
        '<b>[注意] main 分支受保护，无法直接推送。所有变更必须通过 Pull Request + 审查流程。</b>',
        S_WARN))

    # ── 4. POM Commands ──
    s.append(Paragraph('四、POM 命令速查', S_H1))
    s.append(Paragraph(
        '以下命令在 IDE 的 AI 对话窗口中使用，AI 会根据命令自动执行相应流程。',
        S_BODY))

    s.append(Paragraph('4.1 脑暴（需求讨论）', S_H2))
    s.append(Paragraph('在开始一个新功能之前，先进行脑暴讨论：', S_BODY))
    s.append(Paragraph(
        '/brainstorm --project=SAAS --goal=live-content-audit --brainstorm-type=regular',
        S_CODE))
    s.append(Paragraph('<b>参数说明：</b>', S_BODY))
    s.append(Paragraph(
        '\u00b7 <b>--project</b>：项目名称（如 SAAS、AI-SCRM）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--goal</b>：业务目标标识（必填，英文短横线命名，如 live-audit）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--goal-title</b>：业务目标中文标题（可选，如「直播内容审查系统」）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--brainstorm-type</b>：脑暴类型（strategic/planning/regular），不填默认为 regular', S_BULLET))
    s.append(Paragraph(
        '脑暴过程：AI 会以多专家视角与你讨论需求，产出确认的需求文档（BR-脑暴文档-确认稿）。',
        S_BODY))

    s.append(Paragraph('4.2 初始化项目版本', S_H2))
    s.append(Paragraph('脑暴确认后，初始化一个正式版本：', S_BODY))
    s.append(Paragraph(
        '/init --project=SAAS --goal=live-content-audit --type=新增 --desc=实现直播内容自动审查功能',
        S_CODE))
    s.append(Paragraph('<b>参数说明：</b>', S_BODY))
    s.append(Paragraph('\u00b7 <b>--project</b>：项目名称', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--goal</b>：业务目标标识（必填，须与 /brainstorm --goal 一致以关联脑暴产物）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--goal-title</b>：业务目标中文标题（可选，用于门户展示）', S_BULLET))
    s.append(Paragraph('\u00b7 <b>--type</b>：需求类型（新增/迭代/变更/修复）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--desc</b>：需求描述（自然语言，简要说明即可）', S_BULLET))
    s.append(Paragraph('\u00b7 <b>--priority</b>：优先级（P0/P1/P2/P3，可选）', S_BULLET))
    s.append(Paragraph(
        '<b>V1.5.0 要点：</b>一个项目可以有多个 goal（如 SAAS 项目下有 live-audit、'
        'refund-flow 等），每个 goal 拥有独立的版本线（v1.0.0 \u2192 v1.1.0 \u2192 ...），'
        '多人可在不同 goal 上并行开发互不干扰。',
        S_NOTE))

    s.append(Paragraph('4.3 变更需求', S_H2))
    s.append(Paragraph('开发过程中需要变更需求时：', S_BODY))
    s.append(Paragraph(
        '/change --project=SAAS --goal=live-content-audit --desc=审查规则增加敏感词屏蔽 --priority=P1',
        S_CODE))
    s.append(Paragraph('可选参数：', S_BODY))
    s.append(Paragraph(
        '\u00b7 <b>--module</b>：变更的模块（可选，AI 自动识别）', S_BULLET))
    s.append(Paragraph('\u00b7 <b>--file</b>：变更文档路径（可选）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--platform</b>：影响终端逗号分隔（可选，如 pc,app）', S_BULLET))

    s.append(Paragraph('4.4 修复缺陷', S_H2))
    s.append(Paragraph('发现 Bug 需要修复时：', S_BODY))
    s.append(Paragraph(
        '/fix --project=SAAS --goal=live-content-audit --desc=审查结果未保存到数据库 --priority=P0',
        S_CODE))
    s.append(Paragraph('可选参数：', S_BODY))
    s.append(Paragraph('\u00b7 <b>--module</b>：Bug 所在模块（可选）', S_BULLET))
    s.append(Paragraph('\u00b7 <b>--bug-id</b>：Bug 编号（可选）', S_BULLET))
    s.append(Paragraph('\u00b7 <b>--platform</b>：影响终端（可选，如 pc）', S_BULLET))

    s.append(Paragraph('4.5 部署到预览环境', S_H2))
    s.append(Paragraph('功能完成后，将原型部署到 EdgeOne Pages 预览环境：', S_BODY))
    s.append(Paragraph('/deploy --project=SAAS --goal=live-content-audit', S_CODE))
    s.append(Paragraph('参数说明：', S_BODY))
    s.append(Paragraph(
        '\u00b7 <b>--goal</b>：要部署的业务目标（可选，不填则部署所有 goal 的最新版本）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--version</b>：指定部署版本（可选，不填则部署最新版本）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--retry</b>：重新部署（可选，用于修复部署失败）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>--status</b>：查看部署状态（可选）', S_BULLET))

    s.append(Paragraph('4.6 关闭版本', S_H2))
    s.append(Paragraph('当某个 goal 的当前版本开发和验收完成后，执行版本关闭：', S_BODY))
    s.append(Paragraph('/close --project=SAAS --goal=live-content-audit', S_CODE))
    s.append(Paragraph(
        '/close 会自动执行：版本沉淀（总结经验教训）\u2192 部署到 EdgeOne Pages '
        '\u2192 Git 自动提交推送。完成后无需手动 git 操作。',
        S_BODY))

    s.append(Paragraph('4.7 Goal 参数说明（V1.5.0 重点）', S_H2))
    s.append(Paragraph(
        '<b>--goal</b> 是 V4.1.0 统一命名的业务目标参数，替代旧的 --topic 和 --scope。'
        '它在所有命令中含义一致，唯一确定一条业务目标线。',
        S_BODY))
    s.append(Paragraph('核心概念：', S_H3))
    s.append(Paragraph(
        '\u00b7 <b>一个项目可以有多个 goal：</b>如 SAAS 项目下有 live-audit（直播审查）、'
        'refund-flow（退款流程）、customer-tag（客户标签）等', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>每个 goal 独立版本链：</b>live-audit 的 v1.0.0 和 refund-flow 的 v1.0.0 '
        '互不影响', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>多人并行开发：</b>张三在 live-audit 上开发，李四在 refund-flow 上开发，不冲突', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>goal 关联脑暴产物：</b>/brainstorm 和 /init 使用相同的 --goal 即可自动关联'
        '脑暴确认文档', S_BULLET))
    s.append(Paragraph('Goal vs 旧参数对照：', S_H3))
    s.append(make_table(
        ['旧参数', '新参数', '说明'],
        [['--topic（脑暴）', '--goal', 'V4.1.0 统一命名，所有命令通用'],
         ['--scope（/init）', '--goal', '已废弃，--goal 完全替代']],
        col_widths=[60*mm, 40*mm, 70*mm]))
    s.append(Spacer(1, 3*mm))
    s.append(Paragraph(
        '<b>[提示]</b> 旧的 --topic 参数仍可继续使用（向后兼容），但新功能推荐使用 --goal。',
        S_NOTE))

    # ── 5. Preview & Deploy ──
    s.append(Paragraph('五、预览部署与访问', S_H1))
    s.append(Paragraph('访问原型预览：', S_BODY))
    s.append(Paragraph('<b>主域名：</b>https://prototype.jycao.cn', S_BODY))
    s.append(Paragraph('通过主域名可访问所有项目和成员的最新预览版本。', S_BODY))
    s.append(Paragraph(
        '<b>V1.5.0 更新：</b>部署路由格式为 <b>/{成员}/{项目}/{goal}/{版本}/</b>，'
        '例如 https://prototype.jycao.cn/jojo/SAAS/live-audit/v1.0.0/',
        S_NOTE))
    s.append(Paragraph(
        '主分支聚合版本路由：/{成员}/{项目}/main/{版本}/，展示所有 goal 合并后的效果。',
        S_BODY))

    # ── 6. Links ──
    s.append(Paragraph('六、常用链接', S_H1))
    s.append(make_table(
        ['名称', '链接'],
        [['原型预览', 'https://prototype.jycao.cn'],
         ['代码仓库（Gitee）', 'https://gitee.com/jojo180712/pom-workspace']],
        col_widths=[50*mm, 120*mm]))

    # ── 7. FAQ ──
    s.append(Paragraph('七、常见问题', S_H1))

    s.append(Paragraph('Q1：我该用 --goal 还是 --topic？', S_H3))
    s.append(Paragraph(
        '推荐使用 --goal。--topic 已废弃但保留向后兼容，新功能统一使用 --goal。', S_BODY))

    s.append(Paragraph('Q2：忘记 --goal 是什么了怎么办？', S_H3))
    s.append(Paragraph(
        '可以执行 /deploy --project=X --status 查看当前项目下所有活跃的 goal 及其版本。'
        '或者让 AI 帮你列出。', S_BODY))

    s.append(Paragraph('Q3：多人同时开发会冲突吗？', S_H3))
    s.append(Paragraph(
        '不会。只要使用不同的 --goal，每个人的工作都在独立的版本线上进行。'
        '合并到 main 分支时会自动聚合。', S_BODY))

    s.append(Paragraph('Q4：部署后看不到最新内容？', S_H3))
    s.append(Paragraph(
        '原因：EdgeOne CDN 缓存。等待 2-5 分钟让缓存刷新，或通过隐私模式访问。'
        '也可清除本地 DNS 缓存：sudo dscacheutil -flushcache &amp;&amp; '
        'sudo killall -HUP mDNSResponder', S_BODY))

    s.append(Paragraph('Q5：push 代码被拒绝？', S_H3))
    s.append(Paragraph(
        'main 分支受保护，不允许直接推送。请创建功能分支，通过 Pull Request 提交代码。',
        S_BODY))

    # ── 8. Version History ──
    s.append(Paragraph('八、版本历史', S_H1))
    s.append(make_table(
        ['版本', '日期', '变更说明'],
        [['V1.0.0', '2026-07-20', '初始版本'],
         ['V1.1.0', '2026-07-21', '新增环境准备和基础流程说明'],
         ['V1.2.0', '2026-07-22', '新增 POM 命令速查章节'],
         ['V1.3.0', '2026-07-23', '新增预览部署与常用链接'],
         ['V1.4.0', '2026-07-24', '域名更换为 prototype.jycao.cn；新增李政成员；补充 Gitee 流程'],
         ['V1.5.0', '2026-07-29',
          '<b>重大更新：</b>--topic \u2192 --goal 统一参数；新增 --goal-title；'
          '新增 /change 和 /fix 命令说明；新增 Goal 隔离版本链概念；更新部署路由格式']],
        col_widths=[30*mm, 35*mm, 105*mm]))

    out = os.path.join(os.path.dirname(__file__), '..', '成员操作手册.pdf')
    build_pdf(out, s, '成员操作手册 V1.5.0')
    print('Done: 成员操作手册.pdf')


# ════════════════════════════════════════════════════════
#  ADMIN MANUAL V1.5.0
# ════════════════════════════════════════════════════════
def build_admin_manual():
    s = []

    # Cover
    s += cover_story('管理员操作手册', 'AI-SCRM 协作平台',
                     'V1.5.0', '2026-07-29', '平台管理员',
                     extra=['本文档为管理员专属',
                            '包含项目配置、成员管理、部署运维、Goal 管理等内容'])

    # TOC
    s += toc_story([
        '一、管理员职责概述',
        '二、成员管理',
        '    2.1 注册新成员',
        '    2.2 成员权限配置',
        '    2.3 成员项目分配',
        '三、项目管理',
        '    3.1 项目清单',
        '    3.2 新建项目',
        '    3.3 项目配置与端口分配',
        '四、Goal 管理与版本隔离（V1.5.0 新增）',
        '    4.1 Goal 概念',
        '    4.2 版本隔离机制',
        '    4.3 主分支聚合版本',
        '    4.4 部署产物结构',
        '五、部署运维',
        '    5.1 部署架构说明',
        '    5.2 手动部署检查',
        '    5.3 DNS 与域名管理',
        '六、常用操作命令',
        '七、故障排查',
        '八、版本历史',
    ])

    # ── 1. Overview ──
    s.append(Paragraph('一、管理员职责概述', S_H1))
    s.append(Paragraph(
        '管理员负责 AI-SCRM 协作平台的日常运维，包括：成员注册与权限管理、项目创建与配置、'
        '部署监控与故障排查、以及版本发布管理。',
        S_BODY))
    s.append(Paragraph('<b>当前管理员：</b>Jojo', S_BODY))
    s.append(Paragraph(
        '<b>V1.5.0 新增职责：</b>了解 Goal 隔离版本机制，协助成员理解并使用 --goal 参数进行并行开发。',
        S_NOTE))

    # ── 2. Member Management ──
    s.append(Paragraph('二、成员管理', S_H1))

    s.append(Paragraph('2.1 注册新成员', S_H2))
    s.append(Paragraph('管理员通过以下步骤注册新成员：', S_BODY))
    s.append(Paragraph('<b>第一步：在 Gitee 仓库中添加成员</b>', S_BODY))
    s.append(Paragraph(
        '1. 登录 Gitee \u2192 进入仓库「管理 \u2192 仓库成员管理」', S_BULLET))
    s.append(Paragraph(
        '2. 点击「添加成员」\u2192 输入成员的 Gitee 用户名 \u2192 选择角色「开发者」', S_BULLET))
    s.append(Paragraph('3. 通知成员克隆仓库并开始开发', S_BULLET))
    s.append(Paragraph('<b>第二步：在 IDE 中注册成员</b>', S_BODY))
    s.append(Paragraph('在 CodeBuddy IDE 的 AI 对话窗口中执行：', S_BODY))
    s.append(Paragraph('/register-member --project=AI-SCRM', S_CODE))
    s.append(Paragraph(
        '系统会自动：更新访问控制配置、分配端口、更新项目索引、创建项目骨架。', S_BODY))

    s.append(Paragraph('2.2 成员权限配置', S_H2))
    s.append(Paragraph(
        '成员权限由 .access-control.yml 文件管理。管理员可直接编辑该文件：', S_BODY))
    s.append(Paragraph(
        '\u00b7 <b>role: admin</b> \u2014 平台管理员，拥有所有项目访问权限', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>role: developer</b> \u2014 开发者，只能访问分配的项目', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>projects:</b> 列出该成员可访问的项目名称列表', S_BULLET))

    s.append(Paragraph('2.3 成员项目分配', S_H2))
    s.append(Paragraph(
        '在 .access-control.yml 中为成员的 projects 列表添加或移除项目名称即可。'
        '修改后需要提交到 Git 仓库（main 分支）使其生效。',
        S_BODY))
    s.append(Paragraph('当前成员与项目分配：', S_BODY))
    s.append(make_table(
        ['成员', '角色', '可访问项目'],
        [['Jojo', 'admin', 'AI-SCRM, SAAS, 百货商城, 群管易'],
         ['李政', 'developer', 'AI-SCRM, SAAS']],
        col_widths=[30*mm, 30*mm, 110*mm]))

    # ── 3. Project Management ──
    s.append(Paragraph('三、项目管理', S_H1))

    s.append(Paragraph('3.1 项目清单', S_H2))
    s.append(make_table(
        ['项目名', '端口', '描述', '活跃 Goal'],
        [['AI-SCRM', '5173', 'AI-SCRM 主项目', 'subscription-migration'],
         ['SAAS', '5174', 'SAAS 直播平台', 'live-audit 等'],
         ['百货商城', '5175', '百货商城小程序', '-'],
         ['群管易', '5176', '社群管理工具', '-']],
        col_widths=[35*mm, 20*mm, 55*mm, 60*mm]))

    s.append(Paragraph('3.2 新建项目', S_H2))
    s.append(Paragraph(
        '项目骨架由 ensure-project.sh 脚本自动创建，通常通过 /init 命令触发。', S_BODY))
    s.append(Paragraph('如需手动创建项目骨架：', S_BODY))
    s.append(Paragraph('bash scripts/ensure-project.sh {项目名}', S_CODE))
    s.append(Paragraph(
        '该脚本自动创建：state.json、pom/、package.json、journal/、docs/、src/ 等标准目录和文件。',
        S_BODY))

    s.append(Paragraph('3.3 项目配置与端口分配', S_H2))
    s.append(Paragraph(
        '每个项目分配一个本地开发端口。端口池配置在 .codebuddy/config.yml 的 port_pool 段中。',
        S_BODY))
    s.append(Paragraph(
        '<b>[注意]</b> 修改端口配置后需重新启动本地开发服务器。端口冲突时可通过 config.yml 调整。'
        '新成员注册时会自动从端口池分配未使用的端口。',
        S_NOTE))

    # ── 4. Goal Management ──
    s.append(Paragraph('四、Goal 管理与版本隔离（V1.5.0 新增）', S_H1))
    s.append(Paragraph(
        'V4.1.0 架构重新设计后，--goal 成为所有命令的统一业务目标参数。'
        '管理员需要理解 Goal 隔离版本机制，以便更好地管理多业务线并行开发的场景。',
        S_BODY))

    s.append(Paragraph('4.1 Goal 概念', S_H2))
    s.append(Paragraph(
        '<b>Goal（业务目标）</b>是唯一确定一条业务功能线的标识符。', S_BODY))
    s.append(Paragraph('关键特性：', S_BODY))
    s.append(Paragraph(
        '\u00b7 <b>英文短横线命名：</b>如 live-audit、refund-flow、customer-tag', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>跨命令统一：</b>/brainstorm、/init、/change、/fix、/close、/deploy 使用同一个 --goal', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>关联脑暴产物：</b>同 --goal 的 /brainstorm 和 /init 自动关联'
        '（脑暴确认文档路径：00-brainstorm/{goal}/confirmed/）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>可选的 --goal-title：</b>中文标题用于门户展示和文档目录命名', S_BULLET))

    s.append(Paragraph('一个项目多个 Goal 的示例：', S_H3))
    s.append(make_table(
        ['Goal', '中文标题', '当前版本', '负责人'],
        [['live-audit', '直播内容审查系统', 'v1.2.0', '李政'],
         ['refund-flow', '退款流程优化', 'v1.0.0', 'Jojo'],
         ['customer-tag', '客户标签管理', 'v1.0.0', '-']],
        col_widths=[40*mm, 50*mm, 30*mm, 50*mm]))

    s.append(Paragraph('4.2 版本隔离机制', S_H2))
    s.append(Paragraph(
        '每个 Goal 拥有<b>独立的版本线</b>，版本号格式为 v{MAJOR}.{MINOR}.{PATCH}。',
        S_BODY))
    s.append(Paragraph(
        '\u00b7 <b>新 goal 首次 /init：</b>版本从 v1.0.0 开始', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>同 goal 再次 /init：</b>版本自动递增（patch+1 或 minor+1）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>版本互不影响：</b>live-audit 的 v1.2.0 和 refund-flow 的 v1.0.0 完全独立', S_BULLET))
    s.append(Paragraph(
        '\u00b7 <b>state.json 隔离：</b>每个 goal 有独立的 state.json stream 条目，通过 goal 字段区分', S_BULLET))
    s.append(Paragraph(
        '<b>[提示]</b> 版本隔离使得多人可以在不同 goal 上并行开发，互不干扰。'
        '管理员无需协调版本号冲突。',
        S_NOTE))

    s.append(Paragraph('4.3 主分支聚合版本', S_H2))
    s.append(Paragraph(
        '当成员完成 goal 开发并执行 /close 后，代码合并到 main 分支。'
        'main 分支会<b>自动聚合</b>所有 goal：',
        S_BODY))
    s.append(Paragraph(
        '\u00b7 已有 goal 合并：main 版本自动 patch+1', S_BULLET))
    s.append(Paragraph(
        '\u00b7 新 goal 首次合并：main 版本自动 minor+1', S_BULLET))
    s.append(Paragraph(
        '\u00b7 主分支部署路由：/{成员}/{项目}/main/{版本}/，展示所有 goal 合并效果', S_BULLET))

    s.append(Paragraph('4.4 部署产物结构', S_H2))
    s.append(Paragraph('部署产物按 Goal 隔离组织：', S_BODY))
    s.append(Paragraph(
        'deploy/artifacts/<br/>'
        '\u251c\u2500\u2500 {成员}/<br/>'
        '\u2502   \u2514\u2500\u2500 {项目}/<br/>'
        '\u2502       \u251c\u2500\u2500 {goal1}/<br/>'
        '\u2502       \u2502   \u251c\u2500\u2500 v1.0.0/<br/>'
        '\u2502       \u2502   \u2514\u2500\u2500 v1.1.0/<br/>'
        '\u2502       \u251c\u2500\u2500 {goal2}/<br/>'
        '\u2502       \u2502   \u2514\u2500\u2500 v1.0.0/<br/>'
        '\u2502       \u2514\u2500\u2500 main/<br/>'
        '\u2502           \u2514\u2500\u2500 v2.3.1/    \u2190 聚合版本',
        S_CODE))
    s.append(Paragraph(
        '门户首页（https://prototype.jycao.cn）自动聚合所有 goal 和 main 版本的入口链接。'
        '管理员可通过部署状态查看各 goal 的构建结果。',
        S_BODY))

    # ── 5. Deploy Ops ──
    s.append(Paragraph('五、部署运维', S_H1))

    s.append(Paragraph('5.1 部署架构说明', S_H2))
    s.append(Paragraph('部署采用 EdgeOne Pages 全量聚合模式：', S_BODY))
    s.append(Paragraph(
        '1. 成员执行 /deploy 或 /close 命令触发部署', S_BULLET))
    s.append(Paragraph(
        '2. deploy-manager Skill 扫描 deploy/artifacts/{成员}/{项目}/{goal}/{版本}/ 下所有产物', S_BULLET))
    s.append(Paragraph(
        '3. 生成访问门户首页（index.html），包含所有成员/项目/goal/版本的导航', S_BULLET))
    s.append(Paragraph('4. 全量上传到 EdgeOne Pages 项目 ai-scrm-pages', S_BULLET))
    s.append(Paragraph(
        '5. 部署完成后自动更新门户，所有成员可通过 https://prototype.jycao.cn 访问', S_BULLET))
    s.append(Paragraph(
        '<b>V1.5.0 更新：</b>部署路由格式从 /{成员}/{项目}/{话题}/{版本}/ '
        '\u2192 <b>/{成员}/{项目}/{goal}/{版本}/</b>',
        S_NOTE))

    s.append(Paragraph('5.2 手动部署检查', S_H2))
    s.append(Paragraph('如果自动部署出现问题，可进行以下手动检查：', S_BODY))
    s.append(Paragraph(
        '\u00b7 检查 deploy/artifacts/ 是否生成了正确的产物结构（注意最新的 goal 目录层级）', S_BULLET))
    s.append(Paragraph(
        '\u00b7 检查 deploy/access-portal/index.html 是否正确聚合了所有项目和 goal', S_BULLET))
    s.append(Paragraph(
        '\u00b7 登录 EdgeOne Pages 控制台确认最新部署状态', S_BULLET))
    s.append(Paragraph(
        '\u00b7 检查 DNS 解析：dig prototype.jycao.cn CNAME +short', S_BULLET))
    s.append(Paragraph(
        '\u00b7 清除本地 DNS 缓存：sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder', S_BULLET))

    s.append(Paragraph('5.3 DNS 与域名管理', S_H2))
    s.append(Paragraph('<b>当前域名：</b>prototype.jycao.cn', S_BODY))
    s.append(Paragraph(
        '<b>DNS 记录类型：</b>CNAME \u2192 edgeone-pages 目标域名', S_BODY))
    s.append(Paragraph(
        '域名变更时需同步更新：deploy/access-portal/index.html 中的域名引用、'
        'EdgeOne Pages 自定义域名配置。',
        S_BODY))

    # ── 6. Common Commands ──
    s.append(Paragraph('六、常用操作命令', S_H1))

    s.append(Paragraph('Git 操作', S_H2))
    s.append(Paragraph(
        '# 查看仓库状态<br/>git status<br/><br/>'
        '# 查看远程地址<br/>git remote -v<br/><br/>'
        '# 拉取最新代码<br/>git pull origin main<br/><br/>'
        '# 提交并推送<br/>git add .<br/>'
        'git commit -m "docs: 更新管理员操作手册"<br/>'
        'git push origin main', S_CODE))

    s.append(Paragraph('DNS 诊断', S_H2))
    s.append(Paragraph(
        '# 检查 DNS 解析<br/>dig prototype.jycao.cn CNAME +short<br/><br/>'
        '# 刷新本地 DNS 缓存（macOS）<br/>sudo dscacheutil -flushcache<br/>'
        'sudo killall -HUP mDNSResponder<br/><br/>'
        '# 测试 HTTPS 连通性<br/>curl -sI https://prototype.jycao.cn', S_CODE))

    s.append(Paragraph('部署诊断', S_H2))
    s.append(Paragraph(
        '# 检查产物目录<br/>ls -la deploy/artifacts/<br/><br/>'
        '# 检查特定 goal 的产物<br/>'
        'ls -la deploy/artifacts/jojo/AI-SCRM/live-audit/<br/><br/>'
        '# 检查门户文件<br/>cat deploy/access-portal/index.html | head -50<br/><br/>'
        '# 检查 EdgeOne Pages 配置<br/>cat deploy/edgeone-pages.json', S_CODE))

    s.append(Paragraph('Goal 管理', S_H2))
    s.append(Paragraph(
        '# 查看项目活跃 goal（通过 state.json）<br/>'
        'cat projects/SAAS/pom/state.json | python3 -c "import sys,json; '
        'd=json.load(sys.stdin); [print(s.get(chr(39)+chr(39)goalchr(39)+chr(39),chr(39)+chr(39)unknownchr(39)+chr(39)), s.get(chr(39)+chr(39)versionchr(39)+chr(39),chr(39)+chr(39)-chr(39)+chr(39))) for s in d.get(chr(39)+chr(39)streamschr(39)+chr(39),[])]"<br/><br/>'
        '# 查看项目下所有 goal 的脑暴产物<br/>'
        'ls -la projects/SAAS/docs/00-brainstorm/', S_CODE))

    # ── 7. Troubleshooting ──
    s.append(Paragraph('七、故障排查', S_H1))

    s.append(Paragraph('问题 1：成员无法访问 prototype.jycao.cn', S_H3))
    s.append(Paragraph('原因：本地 DNS 缓存未更新，或 DNS 解析未生效。', S_BODY))
    s.append(Paragraph(
        '解决：让成员执行 sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder。'
        '备选：让成员临时切换 DNS 服务器为 8.8.8.8 或 223.5.5.5 测试。', S_BODY))

    s.append(Paragraph('问题 2：成员无法 clone 仓库', S_H3))
    s.append(Paragraph('原因：管理员未在 Gitee 仓库中添加成员。', S_BODY))
    s.append(Paragraph(
        '解决：在 Gitee 仓库「管理 \u2192 仓库成员管理」中添加该用户为「开发者」。', S_BODY))

    s.append(Paragraph('问题 3：成员 push 被拒绝', S_H3))
    s.append(Paragraph(
        '原因：main 分支受保护，不允许直接推送。', S_BODY))
    s.append(Paragraph('解决：让成员创建功能分支，通过 Pull Request 提交。', S_BODY))

    s.append(Paragraph('问题 4：部署后内容未更新', S_H3))
    s.append(Paragraph('原因：EdgeOne Pages 部署未完成或 CDN 缓存。', S_BODY))
    s.append(Paragraph(
        '\u00b7 检查 EdgeOne Pages 控制台的部署日志', S_BULLET))
    s.append(Paragraph('\u00b7 等待 2-5 分钟让 CDN 缓存刷新生效', S_BULLET))
    s.append(Paragraph(
        '\u00b7 使用 curl -sI https://prototype.jycao.cn 查看响应头确认最新部署时间', S_BULLET))

    s.append(Paragraph('问题 5：新成员的产物未出现在门户', S_H3))
    s.append(Paragraph(
        '原因：成员尚未执行 /deploy 或 /close，或者 deploy/artifacts/ 目录为空。', S_BODY))
    s.append(Paragraph(
        '\u00b7 确认 deploy/artifacts/{成员名}/ 目录下有产物', S_BULLET))
    s.append(Paragraph('\u00b7 让成员重新执行 /deploy 触发全量部署', S_BULLET))
    s.append(Paragraph(
        '\u00b7 检查 deploy/access-portal/index.html 是否包含该成员的导航链接', S_BULLET))

    s.append(Paragraph('问题 6：Goal 版本混乱（V1.5.0 新增）', S_H3))
    s.append(Paragraph(
        '原因：成员使用了不同的 --goal 参数（如 --goal=live-audit 和 --goal=live_audit），'
        '导致同一个业务目标被识别为两个不同的 goal。', S_BODY))
    s.append(Paragraph(
        '解决：统一 --goal 命名规范（英文小写 + 短横线分隔），通知成员使用一致的值。'
        '可通过项目文档中明确列出各 goal 的标准名称。', S_BODY))

    # ── 8. Version History ──
    s.append(Paragraph('八、版本历史', S_H1))
    s.append(make_table(
        ['版本', '日期', '变更说明'],
        [['V1.0.0', '2026-07-20', '初始版本，包含基础设施和成员管理基本说明'],
         ['V1.1.0', '2026-07-21', '新增项目配置和端口分配说明'],
         ['V1.2.0', '2026-07-22', '更新 EdgeOne Pages 配置和部署流程'],
         ['V1.3.0', '2026-07-23', '更新 URL 路由、成员清单和故障排查'],
         ['V1.4.0', '2026-07-24',
          '域名更换为 prototype.jycao.cn；新增 DNS CNAME 记录说明；'
          '新增李政成员；补充 Gitee 仓库权限配置流程'],
         ['V1.5.0', '2026-07-29',
          '<b>重大更新：</b>--topic \u2192 --goal 统一参数；'
          '新增第四章「Goal 管理与版本隔离」；'
          '更新所有部署路由为 {goal} 格式；'
          '新增 Goal 管理命令和 Goal 版本混乱故障排查']],
        col_widths=[30*mm, 35*mm, 105*mm]))

    out = os.path.join(os.path.dirname(__file__), '..', '管理员操作手册.pdf')
    build_pdf(out, s, '管理员操作手册 V1.5.0')
    print('Done: 管理员操作手册.pdf')


if __name__ == '__main__':
    build_member_manual()
    build_admin_manual()
    print('\nAll done!')
