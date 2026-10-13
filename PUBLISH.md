# 发布到 SkillHub Plugin 广场

SkillHub 的 `/plugins` 广场与 DSH Plugin 目录（dsh-plugin.org / DSH Plugin Hub）**同源**。
收录不是人工表单投稿，而是**自动发现**：公开 GitHub 仓库 + `dsh-plugin` topic → 被扫描收录。

## 六项预检清单（目录在做 DSH 识别检查时认这些）

| # | 项 | 状态 |
|---|---|---|
| 1 | 仓库是 GitHub **公开**仓库 | 待执行 |
| 2 | Topics 含 **`dsh-plugin`** | 待执行（唯一主要识别信号，漏了必不收录） |
| 3 | `package.json` 有 `name` 和 `description` | 已就绪 |
| 4 | README 说清做什么 + 怎么装 + 最小示例 | 已就绪 |
| 5 | `cordis.yml` 或 patch 配置已提交 | 已就绪（cordis.patch.yml） |
| 6 | 有 `LICENSE` | 已就绪（MIT） |

外加一条硬要求：插件必须导出 `apply(ctx)` —— 已就绪。

## 步骤

```bash
cd dsh-persona-shaoxin

# 1. 建公开仓库并推首次提交（仓库名 = package.json 的 name）
git init && git add -A && git commit -m "feat: 烧心体人格插件 v0.1.0"
gh repo create MycatQieZi/dsh-persona-shaoxin --public --source=. --push

# 2. 加 topic —— 这一步漏了就不会被收录
gh repo edit MycatQieZi/dsh-persona-shaoxin --add-topic dsh-plugin
gh repo edit MycatQieZi/dsh-persona-shaoxin --add-topic persona
gh repo edit MycatQieZi/dsh-persona-shaoxin --add-topic system-prompt
gh repo edit MycatQieZi/dsh-persona-shaoxin --add-topic deepseek-harness

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
