#!/usr/bin/env python3
"""把 lbs-demo 的多文件页面打包为单文件 HTML（用于 Artifact 预览 / 离线分发）。
用法: python3 bundle.py <lbs-demo dir> <out.html> [--artifact]
--artifact: 去掉 <!DOCTYPE>/<html>/<head>/<body> 外壳（Artifact 发布时由平台包裹）。
"""
import re, sys, os, html

src_dir = sys.argv[1]
out = sys.argv[2]
artifact = '--artifact' in sys.argv
idx = open(os.path.join(src_dir, 'index.html'), encoding='utf-8').read()

def read(p):
    return open(os.path.join(src_dir, p), encoding='utf-8').read()

# 内联 CSS
idx = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>\n' + read(m.group(1)).replace('</style>', '<\\/style>') + '\n</style>', idx)
# 内联 JS（保持顺序）
idx = re.sub(r'<script src="([^"]+)"></script>', lambda m: '<script>\n' + read(m.group(1)).replace('</script>', '<\\/script>') + '\n</script>', idx)
# 需求文档链接：单文件模式下指向同目录 requirements.html（若存在）保持不变

if artifact:
    # 只保留 <head> 内的 title/style 与 <body> 内容
    head = re.search(r'<head>(.*?)</head>', idx, re.S).group(1)
    body = re.search(r'<body>(.*?)</body>', idx, re.S).group(1)
    title = re.search(r'<title>.*?</title>', head, re.S).group(0)
    styles = ''.join(re.findall(r'<style>.*?</style>', head, re.S))
    idx = title + '\n' + styles + '\n' + body

os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(idx)
print('bundled ->', out, len(idx.encode('utf-8')) // 1024, 'KB')
