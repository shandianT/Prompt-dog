import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// 流程图契约的单一来源在仓库的 design/workbench/flow.schema.json——不拷贝一份进来，
// 直接从上一级 import，所以 dev server 要放行仓库根目录。
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { fs: { allow: [repoRoot] } },
})
