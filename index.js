/**
 * dsh-persona-shaoxin —— 「烧心体」人格插件
 *
 * 把 2026 年 AI 市井短剧跑出来的那套话术（不烧心文学）注册成系统提示词的一个 section。
 *
 * 机制：读取 ~/.dsh/persona/*.md（全局）与 <项目>/.dsh/persona/*.md（项目级，同名覆盖），
 * 按 files 顺序拼成文本，注册为 section（默认 order: 1，紧跟 harness 身份之后）。
 * 文件改动由 fs.watch 捕获并自动重挂载 —— 改 md 就是改人格，不用重启 dsh。
 *
 * 依赖服务：systemPrompt（@deepseek-ai/dsh-system-prompt 提供）
 * 核心 API：ctx.systemPrompt.section({ name, order, text }) => dispose
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** Cordis 插件名。 */
export const name = 'shaoxin-persona'

/** 依赖声明：framework 等这个服务就绪再跑 apply。 */
export const inject = ['systemPrompt']

/** 默认拼装顺序。LINES.md 是台词库，别删；缺任何文件都静默跳过。 */
const DEFAULT_FILES = ['SOUL.md', 'IDENTITY.md', 'USER.md', 'LINES.md', 'MEMORY.md', 'TOOLS.md']

/** 默认 section 名。不要叫 deployment:persona —— 那是注册表自己的槽位，会冲突报错。 */
const DEFAULT_SECTION = 'deployment:shaoxin'

function personaDirs() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return {
    project: path.join(process.cwd(), '.dsh', 'persona'),
    global: path.join(home, 'persona'),
  }
}

/** 单个文件：项目级优先，找不到回落全局。 */
function resolveFile(file, dirs) {
  for (const dir of [dirs.project, dirs.global]) {
    const p = path.join(dir, file)
    try {
      if (fs.statSync(p).isFile()) return p
    } catch { /* 不存在就继续找 */ }
  }
  return null
}

/** 拼装人格文本。返回空字符串表示「什么都不注入」。 */
function renderPersona(files, maxChars) {
  const dirs = personaDirs()
  const chunks = []
  for (const file of files) {
    const p = resolveFile(file, dirs)
    if (!p) continue
    const body = fs.readFileSync(p, 'utf8').trim()
    if (!body) continue
    chunks.push(`<!-- ${file} -->\n${body}`)
  }
  const text = chunks.join('\n\n')
  if (!text) return ''
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n…(truncated)` : text
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ files?: string[], section?: string, order?: number, maxChars?: number, watch?: boolean }} [config]
 */
export function apply(ctx, config = {}) {
  const opts = {
    files: DEFAULT_FILES,
    section: DEFAULT_SECTION,
    order: 1,
    maxChars: 24000,
    watch: true,
    ...config,
  }

  let dispose = null

  const mount = () => {
    dispose?.()
    dispose = null
    const text = renderPersona(opts.files, opts.maxChars)
    if (!text) return

    // {{…}} 会被渲染层当成提示词变量严格插值，未注册的变量会报错 —— 提前喊一嗓子
    const bad = [...new Set(text.match(/\{\{[^}\n]{1,40}\}\}/g) ?? [])]
    if (bad.length) {
      ctx.logger?.warn?.(`[shaoxin-persona] 检测到模板语法 ${bad.join(' ')}，渲染时会严格插值，确认是变量还是误写`)
    }

    // section() 返回它的 dispose；重复挂载等于替换
    dispose = ctx.systemPrompt.section({
      name: opts.section,
      order: opts.order,
      text,
    })
  }

  // 插件卸载自动清理
  ctx.effect(() => () => dispose?.(), 'shaoxin-persona.cleanup')

  mount()
  ctx.logger?.info?.(`[shaoxin-persona] mounted "${opts.section}" at order ${opts.order}`)

  if (!opts.watch) return

  // 热重载：persona 目录有变化 → 防抖 150ms 重挂载
  const dirs = personaDirs()
  fs.mkdirSync(dirs.global, { recursive: true })

  let timer = null
  const watchers = []
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      mount()
      ctx.logger?.info?.('[shaoxin-persona] persona reloaded')
    }, 150)
  }
  const watchDir = (dir) => {
    try {
      watchers.push(fs.watch(dir, { persistent: false }, schedule))
    } catch { /* 目录不存在就不监听 */ }
  }
  watchDir(dirs.global)
  watchDir(dirs.project)

  ctx.effect(() => () => {
    clearTimeout(timer)
    for (const w of watchers) w.close()
  }, 'shaoxin-persona.watchers')
}
