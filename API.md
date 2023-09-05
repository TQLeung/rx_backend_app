
# 饪芯云接口文档(设备端)

- 版本: 2023.06.14
- 访问域名: https://api-test.renxin-robot.com

### 用户登录

请求:

- URL: /api/v1/device-side/user/login

- Method: POST  

- Content-Type: application/json  

- Body:

| 字段 | 类型 | 是否必需 | 描述 |
| --- | --- | --- | --- |
| name | String | 是 | 登录名称 | 
| password | String | 是 | 登录密码 |
| sn | String | 是 | 设备 SN 编号 |

  
响应:  

- 客户帐号成功返回 Response 示例:

```json
{
    "data": {
        "id": 12,
        "name": "客户测试帐号",
        "phone": "13316930800",
        "type": "user",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsIm5hbWUiOiLlrqLmiLfmtYvor5XluJDlj7ciLCJwaG9uZSI6IjEzMzE2OTMwODAwIiwic24iOiJBQTAxIiwidHlwZSI6InVzZXIiLCJpYXQiOjE2ODY2Mzk3MTAsImV4cCI6MTY4NjY5NzMxMH0.UO6fSX-glwAY0O_6oXRVdIxckLQ140b-F2RPwMO22WU"
    }
}
```

- 员工帐号成功返回 Response 示例:

```json
{
    "data": {
        "id": 1,
        "name": "Pony Ma",
        "role": "店长",
        "type": "employee",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlBvbnkgTWEiLCJyb2xlIjoi5bqX6ZW_Iiwic24iOiJBQTAxIiwidHlwZSI6ImVtcGxveWVlIiwiaWF0IjoxNjg2NjM5NTU5LCJleHAiOjE2ODY2OTcxNTl9.MX8a4iJLiZmzyXi5S4Cw6CPbXxHmZVOjl1Kz0ShLD74"
    }
}
```

- 管理员帐号成功返回 Response 示例:

```json
{
    "data": {
        "id": 1,
        "name": "renxin",
        "type": "admin",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InJlbnhpbiIsInNuIjoiQUEwMSIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTY4NjYzOTc3MSwiZXhwIjoxNjg2Njk3MzcxfQ.4qFX1iR_bF_ToK7-wPRqBXUL5LDBznrG7UWDwhgjlpc"
    }
}
```

失败响应示例:  


- 参数失败返回示例 Response:

```json
{
    "code": 400, // bad request
    "message": "sn fails"
}
```


- 验证失败返回示例 Response:

```json
{
    "code": 401, // unauthorized
    "message": "用户名或密码不正确"
}
```

其他接口类似，下文不再赘述


测试帐号:

* 客户帐号  
    name: 13316930800    
    password: 123456


### 获取设备租赁信息

请求:

- URL: /api/v1/device-side/device/rent-info

- Method: GET  

- Query:

| 字段 | 类型 | 是否必需 | 描述 |
| --- | --- | --- | --- |
| sn | String | 是 | 设备 SN 编号 |

**注意!** sn 是放在查询字符串中, 即  
`/api/v1/device-side/device/rent-info?sn=AB0000AMZ2302683491`
  
响应:  

- 成功返回 Response 示例:

```json
{
    "data": {
        "store": {
            "name": "小龙坎-壹海城-测试" // 门店名称
        },
        "sn": "AB0000AMZ2302683491",
        "order": {
            "commission_plan_type": "quarter", // 佣金方案, 其中 月付 monthly，季付 quarter，半年付 semiannual，年付 annual
            "months": 3 // 计费周期
        },
        "service_begin": "2023-06-14T07:11:42.000Z", // 服务开始时间
        "service_end": "2023-09-14T07:11:42.000Z", // 服务结束时间
        "now": "2023-06-14T08:25:18.454Z" // 网络当前时间，可用来校准本地时间
    }
}
```
