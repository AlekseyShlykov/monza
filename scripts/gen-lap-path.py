#!/usr/bin/env python3
"""
Regenerate src/assets/lap-path.txt from monza.svg embedded PNG.

Same pixels as the map image: road mask → Zhang–Suen skeleton → strip side branches
(graph 2-core) → one ordered lap along that center loop (no greedy walk, no bridges).
At junctions, pick the neighbor deepest inside the road (max BFS distance to road edge).
Light Chaikin + subsample for SVG size.
"""
import base64
import re
import sys
from collections import Counter, deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "monza.svg"
OUT = ROOT / "src" / "assets" / "lap-path.txt"


def zhang_suen_thinning(g, w, h):
    def neighbors(y, x):
        return [
            g[y - 1][x],
            g[y - 1][x + 1],
            g[y][x + 1],
            g[y + 1][x + 1],
            g[y + 1][x],
            g[y + 1][x - 1],
            g[y][x - 1],
            g[y - 1][x - 1],
        ]

    def transitions(p):
        c = p + p[:1]
        return sum(1 for i in range(8) if c[i] == 0 and c[i + 1] == 1)

    def iter_pass(sub_iter):
        to_remove = []
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if g[y][x] != 1:
                    continue
                p = neighbors(y, x)
                n = sum(p)
                if n < 2 or n > 6:
                    continue
                if transitions(p) != 1:
                    continue
                if sub_iter == 1:
                    if p[0] * p[2] * p[4] != 0:
                        continue
                    if p[2] * p[4] * p[6] != 0:
                        continue
                else:
                    if p[0] * p[2] * p[6] != 0:
                        continue
                    if p[0] * p[4] * p[6] != 0:
                        continue
                to_remove.append((y, x))
        for y, x in to_remove:
            g[y][x] = 0
        return bool(to_remove)

    while True:
        a = iter_pass(1)
        b = iter_pass(2)
        if not a and not b:
            break


def bfs_edge_distance(road, w, h):
    INF = 10**9
    dist = [[INF] * w for _ in range(h)]
    q = deque()
    for y in range(h):
        for x in range(w):
            if not road[y][x]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or not road[ny][nx]:
                    dist[y][x] = 0
                    q.append((x, y))
                    break
    while q:
        x, y = q.popleft()
        d0 = dist[y][x]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx >= w or ny >= h or not road[ny][nx]:
                continue
            if dist[ny][nx] > d0 + 1:
                dist[ny][nx] = d0 + 1
                q.append((nx, ny))
    return dist


def neighbors_in_set(p, comp):
    x, y = p
    out = []
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            if dx == dy == 0:
                continue
            t = (x + dx, y + dy)
            if t in comp:
                out.append(t)
    return out


def largest_component(comp):
    comp = set(comp)
    best = set()
    remaining = set(comp)
    while remaining:
        seed = remaining.pop()
        stack = [seed]
        cur = {seed}
        while stack:
            p = stack.pop()
            for q in neighbors_in_set(p, comp):
                if q in remaining:
                    remaining.remove(q)
                    stack.append(q)
                    cur.add(q)
        if len(cur) > len(best):
            best = cur
    return best


def skeleton_two_core(comp, neighbors_fn):
    """Remove spur branches (degree-1 chain) until only loops / junctions remain."""
    s = set(comp)
    while True:
        rem = []
        for p in s:
            deg = sum(1 for q in neighbors_fn(p) if q in s)
            if deg < 2:
                rem.append(p)
        if not rem:
            break
        for p in rem:
            s.discard(p)
    return s


def bfs_nearest_in_set(start, target_set, neighbors_fn):
    if start in target_set:
        return start
    q = deque([start])
    seen = {start}
    while q:
        p = q.popleft()
        for nb in neighbors_fn(p):
            if nb in seen:
                continue
            seen.add(nb)
            if nb in target_set:
                return nb
            q.append(nb)
    return None


def walk_center_loop(loop_set, entry, dist, neighbors_full):
    """Trace one lap on a 2-regular (or almost) loop; close when returning to entry."""
    INF = 10**9

    def d_at(p):
        x, y = p
        v = dist[y][x]
        return 0 if v >= INF else v

    def nb_loop(p):
        return [q for q in neighbors_full(p) if q in loop_set]

    order = [entry]
    prev = None
    cur = entry
    cap = len(loop_set) * 2 + 16

    for _ in range(cap):
        cands = [q for q in nb_loop(cur) if q != prev]
        if not cands:
            return []
        if len(cands) == 1:
            nxt = cands[0]
        else:
            nxt = max(cands, key=d_at)
        if nxt == entry and len(order) >= 3:
            break
        order.append(nxt)
        prev, cur = cur, nxt
    else:
        return []

    if len(order) < 3:
        return []
    if entry not in neighbors_in_set(order[-1], loop_set):
        return []
    return order


def chaikin_closed(pts, iterations=1):
    if len(pts) < 3:
        out = pts[:]
        if out and out[0] != out[-1]:
            out.append(out[0])
        return out
    if iterations <= 0:
        ring = pts[:]
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        return ring
    ring = pts[:]
    if ring[0] == ring[-1]:
        ring = ring[:-1]
    n = len(ring)
    if n < 3:
        return pts + [pts[0]] if pts[0] != pts[-1] else pts
    for _ in range(iterations):
        new_pts = []
        for i in range(n):
            p = ring[i]
            q = ring[(i + 1) % n]
            new_pts.append((0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]))
            new_pts.append((0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]))
        ring = new_pts
        n = len(ring)
    return ring + [ring[0]]


def main():
    text = SVG.read_text()
    m = re.search(r'data:image/png;base64,([^"]+)', text)
    if not m:
        print("No PNG in SVG", file=sys.stderr)
        sys.exit(1)
    raw = base64.b64decode(m.group(1))
    im = Image.open(__import__("io").BytesIO(raw)).convert("L")
    w0, h0 = im.size

    w = 840
    h = max(2, int(round(h0 * w / w0)))
    imr = im.resize((w, h), Image.Resampling.BILINEAR)
    px = imr.load()

    road = [[0] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            v = px[x, y]
            if 26 < v < 234:
                road[y][x] = 1

    dist = bfs_edge_distance(road, w, h)

    g = [row[:] for row in road]
    zhang_suen_thinning(g, w, h)

    comp = {(x, y) for y in range(h) for x in range(w) if g[y][x]}
    if len(comp) < 200:
        print("Skeleton too small", file=sys.stderr)
        sys.exit(1)

    comp = largest_component(comp)
    if len(comp) < 100:
        print("Skeleton component too small", file=sys.stderr)
        sys.exit(1)

    def neighbors_of(p):
        return neighbors_in_set(p, comp)

    core = skeleton_two_core(comp, neighbors_of)
    if len(core) < 80:
        core = set(comp)

    loop_set = largest_component(core)
    # If the pruned graph is not a single simple cycle for our walk, use full skeleton.
    def deg_stats(nodes, nb_fn):
        return sorted(Counter(sum(1 for q in nb_fn(p) if q in nodes) for p in nodes).items())

    def nb_in(nodes):
        def _nb(p):
            return neighbors_in_set(p, nodes)

        return _nb

    ds = deg_stats(loop_set, nb_in(loop_set))
    if ds and ds[-1][0] > 2:
        loop_set = comp

    def neighbors_loop(p):
        return neighbors_in_set(p, loop_set)

    max_y = max(py for _, py in loop_set)
    band = [p for p in loop_set if p[1] >= max_y - 12]
    cx_track = sum(p[0] for p in band) / max(1, len(band))
    pool = [p for p in band if len(neighbors_loop(p)) >= 2]
    if not pool:
        pool = list(band) if band else list(loop_set)
    start_pref = min(pool, key=lambda p: (abs(p[0] - cx_track), -p[1]))

    entry = start_pref if start_pref in loop_set else bfs_nearest_in_set(start_pref, loop_set, neighbors_of)
    if entry is None:
        print("Could not place start on loop", file=sys.stderr)
        sys.exit(1)

    order = walk_center_loop(loop_set, entry, dist, neighbors_of)
    if len(order) < 10:
        print("Walk failed, loop_len", len(loop_set), file=sys.stderr)
        sys.exit(1)

    def sc(p):
        return (p[0] / w * w0, p[1] / h * h0)

    pts = [sc(p) for p in order]
    pts = chaikin_closed(pts, 1)
    step = max(1, len(pts) // 900)
    pts = pts[::step]

    x0, y0 = pts[0]
    pts[-1] = (x0, y0)

    parts = [f"M {x0:.2f} {y0:.2f}"]
    for x, y in pts[1:]:
        parts.append(f"L {x:.2f} {y:.2f}")
    parts.append("Z")
    OUT.write_text(" ".join(parts))
    print("Wrote", OUT, "verts", len(pts), "walk_len", len(order), "loop", len(loop_set), "skel", len(comp))


if __name__ == "__main__":
    main()
