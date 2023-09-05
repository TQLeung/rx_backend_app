
# IoT 设备应用数据包协议

- 版本: 2023.07.06
- 详情可参考步科 IoT [开放文档](https://da.m-iot.net/doc/docs/open-api/#%E5%BA%94%E7%94%A8%E6%95%B0%E6%8D%AE)

### 用户登录

- 设备上报至 IoT 平台的应用数据包结构


```json
{
    "mach_no": "AA0004ASZ2305123457", // 设备 sn 编号
    "mach_app": {
      "topic": "login", // 数据包主题
      "name": "13316930800", // 登录用户名或手机号
      "password": "123456"    // 登录密码
    },
    "ts": 1686888169139 // 时间戳
}
```

对应的设备与 iot 的数据交互格式

```json
  {
      "ts":{ts}, 
      "dn":"{dn}", 
      "app": "rx",
      "topic": "login",
      "name": "Jack",
      "password": "123456",
  }
```

- 下发至设备的应用数据包结构

```json
{
  "mach_app": {
    "topic": "login", // 数据包主题
    "code": 1, // 登录状态, 0 为失败, 1 为成功, 2 为 帐号与 sn 编号不匹配 3 为未付费
    "id": 12,
    "name": "客户测试帐号", // 用户名称
    "phone": "13316930800", // 手机号
    "type": 2, // 登录帐号类型, 1 为管理员, 2 为客户, 3 为员工
    "role": 0, // 员工角色, 1 为店长, 2 为厨师, 3 为操作员
    "store_name": "小龙坎-壹海城-测试", // 门店名称
    "first_active_flag": 0, // 是否首次激活, 1 为是, 0 为否
    "commission_plan_type": "annual", // 佣金方案: annual 年度付、semiannual 半年付、quarter 季度付
    "months": 12, // 计费周期
    "now": 1688608568, // 当前网络时间，可用于本地时间校准
    "order_type": 1, // 订单类型, 1 为付费订单, 2 为试用订单
    "service_begin": 1686901600, // 租期开始时间
    "service_begin_str": "2023.06.16",
    "service_end": 1718524000, // 租期结束时间
    "service_end_str": "2024.06.16",
    "lock": 0, // 是否锁机, 1 为锁机, 0 为否
    "within_seven": 0, // 是否 7 天内, 1 为是, 0 为否
  },
  "mach_no": "AA0004ASZ2305123457",
  "ts": 1686902988770
}
```

对应的设备与 iot 的数据交互格式

```json
{
  "topic": "login", // 数据包主题
  "code": 1, // 登录状态, 0 为失败, 1 为成功, 2 为 帐号与 sn 编号不匹配
  "id": 12,
  "name": "客户测试帐号", // 用户名称
  "phone": "13316930800", // 手机号
  "type": 2, // 登录帐号类型, 1 为管理员, 2 为客户, 3 为员工
  "role": 0, // 员工角色, 1 为店长, 2 为厨师, 3 为操作员
  "store_name": "小龙坎-壹海城-测试", // 门店名称
  "first_active_flag": 0, // 是否首次激活, 1 为是, 0 为否
  "commission_plan_type": "annual", // 佣金方案: annual 年度付、semiannual 半年付、quarter 季度付
  "months": 12, // 计费周期
  "now": 1688608568, // 当前网络时间，可用于本地时间校准
  "order_type": 1, // 订单类型, 1 为付费订单, 2 为试用订单
  "service_begin": 1686901600, // 租期开始时间
  "service_begin_str": "2023.06.16",
  "service_end": 1718524000, // 租期结束时间
  "service_end_str": "2024.06.16",
  "lock": 0, // 是否锁机, 1 为锁机, 0 为否
  "within_seven": 0, // 是否 7 天内, 1 为是, 0 为否
}
```


登录失败，下发的应用数据包结构

```json
{
  "mach_app": {
    "topic": "login",
    "code": 0,
    "message": "用户名或密码不正确"
  },
  "mach_no": "AA0004ASZ2305123457",
  "ts": 1686903000351
}
```

对应的设备与 iot 的数据交互格式

```json
{
  "topic": "login",
  "code": 0,
  "message": "用户名或密码不正确"
}
```

测试帐号:

- 客户帐号  
  name: 13316930800    
  password: 123456

- 管理员帐号  
  name: renxin  
  password: robot

- 员工帐号(店长)  
  name: dianzhang  
  password: 123456

- 员工帐号(厨师)  
  name: chushi  
  password: 123456

- 员工帐号(操作员)  
  name: caozuoyuan  
  password: 123456

---

**以后的应用数据包也将遵循此结构**

```json
{
    "mach_no": "AA0004ASZ2305123457", // 设备 sn 编号
    "mach_app": {
      "topic": "login", // 数据包主题
      // 业务的平铺 kv 数据
    },
    "ts": 1686888169139 // 时间戳
}
```