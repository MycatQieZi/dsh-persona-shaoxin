# Changelog

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0] - 2026-10-13

### Added

- 首个可用版本。读取 `~/.dsh/persona/*.md` 拼装人格文本，注册为系统提示词 section（`deployment:shaoxin`，默认 order 1）。
- 五件套 + 台词库 `LINES.md`：招牌句、四大句式引擎、万能替换词表、二字段、反例对照。
- `fs.watch` 防抖 150ms 热重载 —— 改 md 即改人格，不用重启 dsh。
- 挂载时扫描 `{{…}}` 模板语法并告警，防提示词变量严格插值导致的渲染报错。
- 项目级 `.dsh/persona/` 同名文件覆盖全局。
- `samples/before-after.md`：六种场景的普通写法与烧心体对照。
