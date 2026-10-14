# dsh-persona-shaoxin

**给 DeepSeek Harness 挂一个"擦不锈钢桌子的老实摊主"人格——烧心体。改 Markdown 就是改人格，保存即生效。**

[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/MycatQieZi/dsh-persona-shaoxin)

> 详情页在目录下一轮刷新后生效；在那之前点徽章会 404，属正常。

## 装完有什么变化

同一件事，两种说法：

| 普通写法 | 挂上之后 |
|---|---|
| 我们的定价稍高，主要是因为选用了品质更好的原材料 | 贵是贵点。但吃了不烧心。 |
| 面对同行的低价策略，我们会坚持品质定位 | 怕亏钱吗？怕。**但更怕坏规矩。** |
| 我们对这批不合格产品进行了报废处理 | 剩下怎么办？**倒掉。** |

每条回答走六幕节奏：钩子 → 打压 → 升级 → 反击 → 留钩子，**绝不给圆满结局**。单句不超过 15 个字。

## 特性

- **文件驱动**：人格写在 md 里，不在代码里。六件套 `SOUL / IDENTITY / USER / LINES / MEMORY / TOOLS`。
- **改完即生效**：`fs.watch` 防抖 150ms 自动重挂载，不用重启 dsh。
- **台词库**：`LINES.md` 是一整套可被直接调用的素材——招牌句、四大句式填空模板、万能替换词表、二字段、反例对照。换【货】就长出一部新剧。
- **项目级覆盖**：`<项目根>/.dsh/persona/*.md` 同名覆盖全局，没放的仍读全局。
- **零构建**：纯 JS ESM，无 TypeScript、无 `prepare` 脚本 → 自动安装，**不会触发 `--allow-build` 授权**。
- **安全兜底**：挂载时扫描 `{{…}}` 模板语法并告警，防止提示词变量严格插值把 session 干掉。

## 安装

```bash
dsh plugin --profile web add github:MycatQieZi/dsh-persona-shaoxin
```

支持的 profile：`web`（其他 profile 需自行验证 `systemPrompt` 服务是否可用）。安装后重启 dsh web 生效。

## 用法（最小示例）

**1. 放人设文件**

```bash
mkdir -p ~/.dsh/persona
cp persona/*.md ~/.dsh/persona/
```

**2. 改你想改的那句**

```
~/.dsh/persona/LINES.md
  贵是贵点，但用了不烧心。
```

保存，150ms 后自动生效。发下一条消息就是新人格。

**3. 让它写剧本**

> 写一个 45 秒的烧心体短剧，卖的东西是纳鞋底。

它会给你进场钩子、压迫感、反转、以及一句能截图的收尾。

## 目录结构

```
dsh-persona-shaoxin/
├── index.js            插件入口：apply(ctx, config)
├── cordis.patch.yml    安装时贡献的配置层
├── package.json        dsh.bundle 声明
├── persona/            人设本体（改这里）
│   ├── SOUL.md         行为准则：三条铁律、四大句式、六幕节奏、禁止清单
│   ├── IDENTITY.md     身份：擦不锈钢桌子的老实摊主
│   ├── USER.md         用户：写短剧的人，要能直接用的台词
│   ├── LINES.md        台词库（核心资产）
│   ├── MEMORY.md       长期记忆
│   └── TOOLS.md        环境备忘
└── samples/
    └── before-after.md  六种场景的普通写法 vs 烧心体对照
```

## 配置

改 `cordis.patch.yml` 里那一行的 `config`：

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `order` | `1` | 落位。官方档位：harness 身份 −1000 / persona 前缀 0 / 计划 500 / 工具指导 1000–3000 / 结构化输出 9900 / persona 后缀 10200 |
| `section` | `deployment:shaoxin` | 别改成 `deployment:persona`，那是 prompt 注册表自己的槽位，同名 loud-fail |
| `files` | 六件套 | 想调淡删掉 `LINES.md`；想调浓把它排到 `SOUL.md` 前面 |
| `maxChars` | `24000` | 截断上限 |
| `watch` | `true` | 关掉就是纯静态，只在加载时读一次 |

## 它是怎么工作的

DSH 在每个模型步骤前由 `dsh-system-prompt` 按 order 拼装系统提示词。插件只要：

```js
export const inject = ['systemPrompt']
const dispose = ctx.systemPrompt.section({ name, order, text })
```

就往提示词里插了一段。`text` 是模板 —— `{{cwd}}` / `{{model}}` 会严格插值，**未注册的变量会报错**，所以本插件在挂载时会把它扫出来告警（用【】做占位符，别用 `{{ }}`）。

## 权限与隐私

| 项 | 说明 |
|---|---|
| 磁盘读取 | 仅读 `<cwd>/.dsh/persona/` 与 `$DSH_HOME/persona/` 下的 md 文件 |
| 磁盘写入 | 无。（首次运行会 `mkdir` 全局 persona 目录） |
| 网络 | 无任何出站请求，无 telemetry |
| 执行的命令 | 无 |
| 挂载面 | 只注册一个 system-prompt section，不注册工具、不改模型路由、不碰沙箱与审批策略 |

## 兼容性

- **目标 DSH 版本**：0.1.0 系列；依赖 `@deepseek-ai/cordis` ≥ 4.0.4 与 `systemPrompt` 服务契约。
- **状态**：作者尚未在真机 dsh 上完成端到端挂载验证（本机未安装 dsh）。已完成的是**假 ctx 逻辑冒烟**——六文件拼装 4128 字符、section 落位正确、`{{cwd}}` 误写告警如期触发。首个真机反馈欢迎开 Issue。
- DSH 尚在开发者预览期，上游 API 可能 breaking，README 会跟进标注适用区间。

## 梗从哪来

2026 年 AI 市井短剧跑出来的热梗：良心摊主用好料被迫提价 → 隔壁低价黑心同行抢客 → 被嘲笑"不会做生意" → 擦锃亮不锈钢桌甩一句"怕亏钱，但更怕坏规矩" → 黑心店翻车 → 顾客回流一句"贵是贵点，但吃了不烧心"。同一模板换汤不换药，观众从"看剧"变成"背剧"，把它玩成了梗。抖音 #不烧心# 播放超 20 亿。

保留[LINES.md](persona/LINES.md)里的替换词表，下次换梗改三列就行，骨架不用动。

## 许可证

[MIT](LICENSE) © 2026 MycatQieZi
