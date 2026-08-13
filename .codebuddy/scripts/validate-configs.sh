#!/bin/bash
echo "🔍 校验所有 YML 配置..."

# 优先使用 PyYAML；若未安装则使用内置 JSON 回退解析器
python3 - <<'PYEOF'
import sys, os, re, json

try:
    import yaml
    HAVE_YAML = True
except ImportError:
    HAVE_YAML = False

def load_yaml(path):
    with open(path, 'r') as f:
        text = f.read()
    if HAVE_YAML:
        return yaml.safe_load(text)
    # 极简回退解析：仅提取顶层 agent.id/name/role 与 workflow.id/name
    root = {}
    # 找到顶层键
    m = re.search(r'^agent:\s*$', text, re.M)
    if m:
        block = text[m.start():]
        d = {}
        for key in ('id', 'name', 'role'):
            mm = re.search(r'^\s{2}' + key + r':\s*"?([^"\n]+)"?\s*$', block, re.M)
            if mm:
                d[key] = mm.group(1).strip()
        root['agent'] = d
    m2 = re.search(r'^workflow:\s*$', text, re.M)
    if m2:
        block = text[m2.start():]
        d = {}
        for key in ('id', 'name'):
            mm = re.search(r'^\s{2}' + key + r':\s*"?([^"\n]+)"?\s*$', block, re.M)
            if mm:
                d[key] = mm.group(1).strip()
        root['workflow'] = d
    return root

errors = []

# 校验 Agent 配置
agents_dir = ".codebuddy/configs/agents"
if os.path.isdir(agents_dir):
    for fn in sorted(os.listdir(agents_dir)):
        if not fn.endswith('.yml'):
            continue
        path = os.path.join(agents_dir, fn)
        print(f"  校验: {path}")
        try:
            data = load_yaml(path)
            agent = data.get('agent', {})
            assert agent.get('id'), '缺少 id'
            assert agent.get('name'), '缺少 name'
            assert agent.get('role'), '缺少 role'
            print('  ✅ 通过')
        except Exception as e:
            print(f'  ❌ 失败: {e}')
            errors.append(str(e))
else:
    print(f"  ⚠️  目录不存在: {agents_dir}")

# 校验工作流配置
wf_dir = ".codebuddy/configs/workflows"
if os.path.isdir(wf_dir):
    for fn in sorted(os.listdir(wf_dir)):
        if not fn.endswith('.yml'):
            continue
        path = os.path.join(wf_dir, fn)
        print(f"  校验: {path}")
        try:
            data = load_yaml(path)
            wf = data.get('workflow', {})
            assert wf.get('id'), '缺少 id'
            assert wf.get('name'), '缺少 name'
            print('  ✅ 通过')
        except Exception as e:
            print(f'  ❌ 失败: {e}')
            errors.append(str(e))
else:
    print(f"  ⚠️  目录不存在: {wf_dir}")

if errors:
    print(f"\n❌ 校验发现 {len(errors)} 个问题")
    sys.exit(1)
print("\n✅ 全部校验完成")
PYEOF
