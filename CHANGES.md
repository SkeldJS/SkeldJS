# SkeldJS 合并项目改动清单（CHANGES）

> 说明：本目录是 **临时合并**（`SkeldJS-main` + `Waterway-master`）用于测试。
> **两个原始项目（`../SkeldJS-main`、`../Waterway-master`）完全未修改**。
> 所有改动只在本目录内。要拆分回去时：直接丢弃本目录即可，原始项目保持原样；
> 若想保留某项改动，按下方清单把对应文件改动移植回原始项目。

## 变更拓扑（先看这个）

```
SkeldJS/                     ← 临时合并项目（全部改动都在这里）
├─ package.json / tsconfig.json / .yarnrc.yml / README / .gitignore    ← 根配置（仅合并需要）
├─ packages/*                ← = SkeldJS-main/packages 的拷贝，★未改动★
└─ waterway/*                ← = Waterway-master 的拷贝 + ★全部服务端改动★
```

---

## A. 根目录（仅合并需要，拆分时无需带回去）

| 文件 | 说明 |
| --- | --- |
| `package.json` | 根包 `skeldjs`，workspaces = `["packages/*", "waterway"]` |
| `tsconfig.json` | 根 TS 配置（库包 `extends ../../tsconfig.json` 依赖它，缺失无法编译） |
| `.yarnrc.yml` / `.yarn/releases/yarn-4.10.3.cjs` | Yarn 4.10.3 |
| `.gitignore` / `README.md` | 新增 |
| `compare.ps1` / `run-build.ps1` | 临时辅助脚本（可删） |

## B. waterway 服务端改动（按"是否值得移植回原始项目"分类）

### B1. 自包含 / 网络健壮性（建议保留）
- `bin/bootstrap.ts`
  - 删除对 Waterway GitHub 仓库的更新检查/拉取（`raw.githubusercontent.com/SkeldJS/Waterway`、`git pull origin master`）。
  - 网络健壮性：`makeHttpRequest` 补 `req.on("error")`；`getInternalIp` 加 `try/catch`；外网 IP 失败回退内网 IP。
- `src/WaterwayServer.ts`：UDP `_listenPort` 加 `error` 处理（端口占用时清晰报错退出，不再堆栈崩溃）。
- `bin/createDefaultConfig.ts`：`checkForUpdates: false`。

### B2. 动态端口匹配（Empostor 风格，测试核心，看是否要保留）
- `src/PortPoolService.ts`（新增）：端口池 available → leased → draining → recycled。
- `src/AuthCache.ts`：重写为**纯按端口索引**（删除全部 IP/用户名匹配方法）。
- `src/WaterwayServer.ts`：每端口一个 delta 监听器（`startDeltaListener`/`stopDeltaListener`/`returnDeltaPort`）；`handleMessage`/`handleHello` 只按端口匹配；断开时归还端口。
- `src/Connection.ts`：新增 `deltaPort` 字段。
- `src/Matchmaker.ts`：分配端口、响应令牌加 `Port` 字段、**池耗尽 → HTTP 503 拒绝**（无 IP 回退）。
- `bin/createDefaultConfig.ts` / `misc/config.schema.json` / `config.json`：`socket.deltaPortRange: [22224, 22524]`。
- 已规避两个竞态：await 监听器 bind 后再返回响应；端口先 draining、socket 释放后才回池。

### B3. 模组 RPC 转发（建议保留）
- `src/Room.ts`：未知 RPC 转发逻辑，日志按 `acceptUnknownGameData` 分级。
- `config.json`：`socket.acceptUnknownGameData: true`（默认改为开启）。

### B4. 事件去重（建议保留）
- `src/api/events/player/{LevelChanged,MurderFail,TaskProgress,TaskStarted}.ts`：改为 **re-export `@skeldjs/au-core`** 的同名事件（不再重复实现）。
- `src/Room.ts`：`RoomEvents` 用 `<Room>` 泛型。

### B5. 角色逻辑统一到核心库（方案 A）
- `src/game/roles/BaseRole.ts`：`extends @skeldjs/au-core` 的 `BaseRole<Room>`（角色基类/契约在核心库）。
- `src/game/roles/*Role.ts`（9 个）：改用 `static roleMetadata`。
- `src/game/roles/RoleManager.ts`：`assignRoles()` → `syncRolesFromCore()`（从核心分配结果同步行为实例，去掉二次分配）。
- `src/Room.ts`：`onTaskComplete` 统一为核心库 `(taskIdx)` 签名；`roleManager.syncRolesFromCore()`。

---

## 拆分回去的操作建议

1. **不要动原始项目**，本目录是独立测试副本。
2. 测试满意后，想保留的改动按 B1–B5 逐文件移植回 `Waterway-master`（都是文件级、自包含的）。
3. 库包（`packages/*`）和原始 `SkeldJS-main` 无需任何改动（本测试里库包从未被修改）。
