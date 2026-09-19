# -*- coding: utf-8 -*-
"""把 flow.py 的投标流程导出成符合 flow.schema.json 的 JSON，供工作台（workbench/）当示例数据。

flow.py 是示例数据的单一来源；这个脚本只做两件事：
  1. 形状归一：flow.py 的 children 是 {nodes, edges}，schema 要 children[] + childEdges[]
  2. 去掉 N() 给每个节点铺的默认空值（"" / 0 / 非人节点的 notify），让 JSON 可读

用法：python3 design/workbench/export_flow_json.py [输出路径]
默认写到 workbench/sample/投标流程.json
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import flow  # noqa: E402

VERSION = "0.1.0"
# 值等于这些就不写进 JSON（schema 里全是可选字段，默认值没有信息量）
EMPTY = ("", 0)
# 只对人节点有意义的字段
HUMAN_ONLY = ("owner", "sla", "notify", "irreversible")
# 只对数据节点有意义的字段
DATA_ONLY = ("method", "dir")


def clean_node(n):
    out = {}
    for k, v in n.items():
        if k == "children":
            continue
        if k in HUMAN_ONLY and n["kind"] != "human":
            continue
        if k in DATA_ONLY and n["kind"] != "data":
            continue
        if k in ("id", "kind", "name", "x", "y"):   # 必留
            out[k] = v
            continue
        if v in EMPTY or v is False:
            continue
        out[k] = v
    kids = n.get("children")
    if kids:
        out["children"] = [clean_node(c) for c in kids["nodes"]]
        out["childEdges"] = [dict(e) for e in kids["edges"]]
    return out


def clean_edge(e):
    return {k: v for k, v in e.items() if k in ("id", "from", "to", "kind") or v not in EMPTY}


def build():
    return {
        "name": flow.FLOW_NAME,
        "essence": flow.ESSENCE,
        "version": VERSION,
        "lanes": {"mode": "role"},
        "nodes": [clean_node(n) for n in flow.NODES],
        "edges": [clean_edge(e) for e in flow.EDGE_OBJS],
    }


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    default = os.path.join(here, "..", "..", "workbench", "sample", "投标流程.json")
    path = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else default)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = build()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    kids = sum(len(n.get("children", [])) for n in data["nodes"])
    print(f"{path}: {len(data['nodes'])} 节点（含子图 {kids}）· {len(data['edges'])} 条线")
