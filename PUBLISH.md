# 发布到 SkillHub Plugin 广场

SkillHub 的 `/plugins` 广场与 DSH Plugin 目录（dsh-plugin.org / DSH Plugin Hub）**同源**。
收录不是应用商店式的人工上架，而是**自动扫描发现**：公开 GitHub 仓库 + `dsh-plugin` topic → 生成列表页。

## 两个提交站，两条不同的路

| 站 | 提交方式 | 机制 |
|---|---|---|
| deepseekplugin.org/submit | 粘贴仓库 URL 表单 | 解析元数据 → DSH 识别检查 → **即时发布**，详情页 `/plugins/[slug]` |
| dsh-plugin.org/submit | **没有表单**。页面给的是固定 issue 模板，点按钮去开 GitHub Issue | 开 issue → 等待一个刷新周期被扫描收录 → 详情页 `/plugins/[owner]/[slug]` |

**dsh-plugin.org 额外有一条硬要求**：仓库根目录必须有 `package.json`（hub 读它识别包名并校验对应 npm 包），没有就过不了自动扫描 —— 此项已满足。

## 当前状态

| 站 | 状态 |
|---|---|
| deepseekplugin.org | 已提交 |
| dsh-plugin.org | 已开收录 issue：https://github.com/dshplugin/dsh-plugin-hub/issues/181 |

## 六项预检清单（目录在做 DSH 识别检查时认这些）

| # | 项 | 状态 |
|---|---|---|
| 1 | 仓库是 GitHub **公开**仓库 | ✅ https://github.com/MycatQieZi/dsh-persona-shaoxin |
| 2 | Topics 含 **`dsh-plugin`** | ✅ 已加（唯一主要识别信号，漏了必不收录） |
| 3 | `package.json` 有 `name` 和 `description` | ✅ |
| 4 | README 说清做什么 + 怎么装 + 最小示例 | ✅ |
| 5 | `cordis.yml` 或 patch 配置已提交 | ✅ cordis.patch.yml |
| 6 | 有 `LICENSE` | ✅ MIT（GitHub 已识别） |

外加一条硬要求：插件必须导出 `apply(ctx)` —— ✅。

## dsh-plugin.org 的手工提交模板（已用此模板开 issue）

issue 标题固定为 `[Plugin submission] <owner>/<repo> — <一句话价值>`，正文：

```
### Repository
<仓库 URL>

### One-line value
<装完有什么变化，一句话>

### Category
<11 选一：UI & Experience / Sessions & Messages / Memory & Context / Tools & Capabilities /
Skills & Agents / Workflow & Automation / Integrations & Connections / Models & Reasoning /
Development & Operations / Data & Knowledge / Entertainment>

### Install command
<完整 CLI，如 dsh plugin --profile web add github:owner/repo>

### Compatibility
<目标 DSH 版本 / profile / 运行时；不确定就留空>

### License
### Screenshots / demo
### Notes
<权限、外部服务、已知限制>

### Pre-submission checklist
- [x] Repository is public
- [x] GitHub topic `dsh-plugin` added
- [x] README includes the install command
- [x] Plugin exports an `apply(ctx)` module
- [x] Repository root includes a `package.json`
```

本插件选的分类是 **Skills & Agents**（注册的是 agent 的身份与话术，不是工具能力）。

## 上架后

- 列表页上线后，把 README 顶部的占位换成 /submit 页给的徽章代码：
  `[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/MycatQieZi/dsh-persona-shaoxin)`

## 步骤

```bash
cd dsh-persona-shaoxin

# 1. 建公开仓库并推首次提交（仓库名 = package.json 的 name）
git init && git add -A && git commit -m "feat: 烧心体人格插件 v0.1.0"
gh repo create MycatQieZi/dsh-persona-shaoxin --public --source=. --push

> **本机 push 会踩的坑**（2026-10-13 实测）：`~/.gitconfig` 里有
> `url.git@github.com:.insteadOf https://github.com/`（把 https 重写成 ssh）+
> `http.https://github.com.proxy=http://127.0.0.1:7890`，而本机 22 端口不通、7890 代理也没开，
> 于是 push 直接失败。不改全局配置的绕法：
>
> ```bash
> # remote 写成带用户名前缀，避开 insteadOf 的匹配前缀（https://github.com/ 不匹配 https://git@github.com/）
> git remote set-url origin https://git@github.com/MycatQieZi/dsh-persona-shaoxin.git
>
> # push：直连不走代理 + 用 gh token 免交互
> printf '#!/bin/sh\ncase "$1" in\n  *Username*) echo "$GH_USERNAME" ;;\n  *Password*) echo "$GH_TOKEN" ;;\nesac\n' > /tmp/git-askpass.sh
> chmod +x /tmp/git-askpass.sh
> GIT_ASKPASS=/tmp/git-askpass.sh GH_USERNAME=MycatQieZi GH_TOKEN="$(gh auth token)" \
>   env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY \
>   git -c 'http.https://github.com.proxy=' -c 'http.proxy=' push
> ```

# 2. 加 topic —— 这一步漏了就不会被收录
#    注意：多次 --add-topic 是替换而非追加，用 gh api 一次 PUT 整份列表
gh api -X PUT repos/MycatQieZi/dsh-persona-shaoxin/topics \
  -f 'names[]=dsh-plugin' -f 'names[]=persona' \
  -f 'names[]=system-prompt' -f 'names[]=deepseek-harness' --jq '.names'

# 3. 核验可见性与 topic
gh repo view MycatQieZi/dsh-persona-shaoxin --json visibility,repositoryTopics

# 4. 到目录提交页粘贴仓库 URL（免费，无需账号）
#    https://dsh-plugin.org/submit
#    https://deepseekplugin.org/submit
```

## 提交之后

| 环节 | 说明 |
|---|---|
| 审核 | 无人工排队。粘贴 → 解析元数据 → DSH 识别检查 → 即时发布，详情页 `/plugins/[slug]` |
| 初态 | 每个新收录插件都是 **unconfirmed**（已自动发现、未人工核实兼容性），人工核实后转 verified。README 质量与仓库活跃度显著影响转正速度 |
| 同步 | star / fork / 更新时间 / README / 版本自动同步，不用重复提交 |
| 常见不收录 | 四个原因：仓库非公开、缺 topic、README 没安装命令、没导出 `apply(ctx)` |

## 上架后要做的三件事

1. 用 `/submit` 页给的徽章代码替换 README 顶部占位。
2. 补真实截图/终端输出（放在 README「装完有什么变化」小节）。
3. 收割反馈 → 迭代 → 打 GitHub Release，目录会跟着刷新。

## 另一条路：走 SkillHub「发布 Skill」通道

`https://skillhub.cn/dashboard/publish` 发布的是 **SKILL.md 形态的技能**（给 WorkBuddy / Claude Code 一类 Agent 用），跟 dsh 插件不是一回事。要走那条路需要：

- 实名认证（腾讯云人脸核身）
- 用 `skillhub` CLI：`login --key skh_xxx --host https://api.skillhub.cn` → `publish --dry-run` → `publish --changelog "..."`
- 上线前过三线并行安全审核（内容合规过滤 / 科恩实验室漏洞扫描 / 云鼎实验室模型安全评估）
- 图标不能用 CLI 上传，须在详情页手动设 `iconUrl`

本插件是纯 dsh 插件，走上面的 GitHub + topic 通道即可。
