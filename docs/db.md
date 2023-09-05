## admin 

**后台管理员用户表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||user id|
|name||STRING|false||名称|
|password||STRING|false||密码|
 

## channel 

**渠道表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||user id|
|name||STRING|false||渠道名称|
|company||STRING|false||公司名称|
|code||STRING|true||编号|
|tax_number||STRING|false||企业税号|
|phone||STRING|false||手机号码|
|contact||STRING|false||联系人|
|operation_mode||STRING|false|agent|运营模式|
|payment_account||STRING|true||打款账户|
|remark||STRING|true||备注|
 

## channel_admin 

**渠道管理帐号表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||user id|
|channel_id||INTEGER|false||agent id|
|name||STRING|false||名称|
|phone||STRING|false||手机号码|
|password||STRING|false||密码|
 

## channel_area 

**渠道地区分管表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|province||STRING|false||省|
|province_code||STRING|false|||
|city||STRING|false||市|
|city_code||STRING|false||市级编号|
|area||STRING|false||区|
|area_code||STRING|false||区编号|
|channel_id||INTEGER|false||渠道 id|
 

## commission_plan 

**佣金方案表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||user id|
|name||STRING|false||名称|
|type||STRING|false||类型, 月付 monthly, 季付 quarter, 半年付 semiannual, 年付 annual|
|discount||INTEGER|false|0|折扣，百分比|
|renxin_amount||INTEGER|false||饪芯金额，单位分|
|agent_amount||INTEGER|false||代理商金额，单位分|
|settlement_day||INTEGER|false|10|结算日|
|remark||STRING|true||备注|
 

## device_approval 

**设备审批表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|code||STRING|false||审批编号|
|device_id||INTEGER|false||device id|
|device_code||STRING|false||设备编号|
|channel_id||INTEGER|true||channel id|
|user_id||INTEGER|true||user id|
|store_id||INTEGER|true||store id|
|type||STRING|false||类型|
|status||STRING|false||状态|
|journal_status||STRING|false|在库|save device journal status|
|remark||STRING|true||备注|
|author||STRING|false||提交人|
|author_id||INTEGER|false||提交人id|
|author_type||STRING|false||提交人类型|
|operator||STRING|true||操作人|
|operator_id||INTEGER|true||操作人 id|
|operator_type||STRING|true||操作人类型|
|operator_remark||STRING|true||操作备注|
|operate_at||DATE|true||操作时间|
 

## device_category 

**设备分类表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|name||STRING|false||分类名称|
|code||STRING|false||分类编号|
|remark||STRING|false||备注|
|operator_id||INTEGER|true||操作者id|
|operator_name||STRING|true||操作者名称|
 

## device_code 

**设备编码表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|code||STRING|false||设备编号|
|screen_code||STRING|false||屏编号|
|is_used||INTEGER|false|0|是否使用, 0 未使用, 1 使用|
|operator_id||INTEGER|true||操作者id|
|operator_name||STRING|true||操作者名称|
 

## device_factory 

**设备工厂表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|name||STRING|false||名称|
|code||STRING|false||编号|
|address||STRING|false||地址|
|telphone||STRING|true||电话|
|operator_id||INTEGER|true||操作者id|
|operator_name||STRING|true||操作者名称|
 

## device_info 

**设备信息表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|name||STRING|false||产品名称|
|category||STRING|false||设备分类名称|
|category_code||STRING|false||设备分类编码|
|type||STRING|false||设备类型名称，设备分类的二级|
|type_code||STRING|false||设备类型编码|
|version||STRING|false||迭代版本名称|
|version_code||STRING|false||迭代版本编码|
|standard||STRING|true||执行标准|
|voltage||STRING|true||电压|
|electric_current||STRING|true||电流|
|rate||STRING|true||频率|
|power||STRING|true||功率|
|net_weight||STRING|true||净重|
|remark||STRING|true||备注|
|operator_id||INTEGER|true||操作者id|
|operator_name||STRING|true||操作者名称|
 

## device_journal 

**设备台帐表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|device_id||INTEGER|false||device id|
|device_code||STRING|false||设备编号|
|channel_id||INTEGER|true||channel id|
|user_id||INTEGER|true||user id|
|store_id||INTEGER|true||store id|
|status||STRING|true||设备状态|
|rent_status||STRING|false|current|租赁状态|
|service_begin||DATE|true||服务开始时间|
|service_end||DATE|true||服务结束时间|
|activated_at||DATE|true||激活时间|
 

## device_login_log 

**设备登录日志表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|device_code||STRING|false||设备编码|
|user_id||INTEGER|false||用户 id|
|user_name||STRING|false||登录用户名|
|user_type||STRING|false||用户类型|
|device_journal_id||INTEGER|false||device journal id|
 

## device_recipe 

**设备菜谱表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|no||STRING|false||菜谱编号|
|name||STRING|false||名称|
|weight||INTEGER|false|0|规格|
|quantity||INTEGER|false|1|份数|
|user_id||INTEGER|true||user id|
 

## device_recipe_file 

**设备菜谱文件表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|recipe_id||INTEGER|false||菜谱 id|
|recipe_no||STRING|false||菜谱编号|
|no||STRING|false||菜谱内容编号|
|content||JSON|false||菜谱内容|
|device_id||INTEGER|false||设备id|
|device_code||STRING|false||设备编号|
|device_journal_id||INTEGER|false||device journal id|
|status||STRING|false|pending|状态|
 

## iot_log 

**iot日志表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|device_code||STRING|false||设备编号|
|type||STRING|true||类型|
|content||TEXT|true||内容|
 

## order 

**订单表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|code||STRING|false||订单编号|
|device_id||INTEGER|false||device id|
|device_code||STRING|false||设备编号|
|device_journal_id||INTEGER|false||设备台帐 id|
|user_id||INTEGER|false||user id|
|channel_id||INTEGER|false||channel id|
|status||STRING|false||状态|
|commission_plan_name||STRING|true||佣金方案名称|
|commission_plan_type||STRING|true||佣金方案类型|
|commission_plan_renxin_amount||INTEGER|true||饪芯金额, 单位分|
|commission_plan_agent_amount||INTEGER|true||代理商金额, 单位分|
|months||INTEGER|false|1|购买月份数量|
|price||INTEGER|false||价格|
|total_amount||INTEGER|false||订单总金额, 单位: 分|
|payment_method||STRING|true||支付方式|
|payment_status||STRING|true||支付状态, pending 待支付, paid 支付完成, expired 支付超时|
|pay_at||DATE|true||支付时间|
|closed_at||DATE|true||订单关闭时间|
|cancel_at||DATE|true||订单取消时间|
|remark||STRING|true||备注|
|operator||STRING|true||操作人|
|operator_id||INTEGER|true||操作人 id|
|operator_type||STRING|true||操作人类型|
|from||STRING|false|mini-program|订单来源|
|type||STRING|false|common|订单类型|
|trial_begin||DATE|true||试用开始时间|
|trial_end||DATE|true||试用结束时间|
|trial_reason||STRING|true||试用原因|
|is_calculated||INTEGER|true|0|是否计算|
 

## order_payment 

**订单支付表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|user_id||INTEGER|false||user id|
|order_id||INTEGER|false||订单id|
|order_no||STRING|false||订单编号|
|transaction_id||STRING|false||微信支付订单号|
|pay_type||STRING|false||支付方式|
|order_amount||INTEGER|false||订单金额|
|pay_amount||INTEGER|false||订单实际支付金额|
|pay_at||DATE|false||支付时间|
|openid||STRING|true||支付者 openid|
|pay_account||STRING|true||支付账号|
 

## resource 

**资源表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||resource id|
|name||STRING|false||名称|
|parent_id||INTEGER|false|0|父级资源id|
 

## role 

**角色表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||role id|
|name||STRING|false||名称|
|remark||STRING|true||备注|
 

## role_permission 

**角色资源表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|resource_id||INTEGER|false||resource id|
|role_id||INTEGER|false||role id|
 

## store_employee 

**员工表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|store_id||INTEGER|false||user id|
|name||STRING|false||员工名称|
|role||STRING|false||员工角色|
|password||STRING|false||密码|
 

## user 

**用户表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||user id|
|channel_id||INTEGER|false||渠道 id|
|name||STRING|false||名称|
|type||STRING|false||用户性质, 企业或个人|
|code||STRING|true||编号|
|status||STRING|false|normal|用户状态，正常、暂停、欠费|
|contact||STRING|false||联系人|
|phone||STRING|false||联系人电话|
|company||STRING|true||公司名称|
|tax_number||STRING|true||企业税号|
|payment_account||STRING|true||打款账户|
|remark||STRING|true||备注|
|province||STRING|true||省|
|province_code||STRING|true|||
|city||STRING|true||市|
|city_code||STRING|true||市级编号|
|area||STRING|true||区|
|area_code||STRING|true||区编号|
 

## user_admin 

**用户管理帐号表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||user id|
|user_id||INTEGER|false||user id|
|name||STRING|false||名称|
|phone||STRING|false||手机号码|
|password||STRING|false||密码|
 

## user_channel 

**用户渠道表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|user_id||INTEGER|false||user id|
|channel_id||INTEGER|false|0|channel id|
 

## user_role 

**用户角色表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|user_id||INTEGER|false||user id|
|user_type||STRING|false||用户类型, admin or user or channel|
|role_id||INTEGER|false|0|role id|
 

## user_store 

**客户门店表** 

|Field|PK|Type|Allow Null|Default Value|Comment|
|:--|:--|:--|:--|:--|:--|
|id|true|INTEGER|false||id|
|user_id||INTEGER|false||user id|
|name||STRING|false||门店名称|
|code||STRING|false||编码|
|province||STRING|true||省|
|province_code||STRING|true|||
|city||STRING|true||市|
|city_code||STRING|true||市级编号|
|area||STRING|true||区|
|area_code||STRING|true||区编号|
|town||STRING|true||乡、街道|
|town_code||STRING|true||乡、街道编码|
|address_detail||STRING|true||详细地址|
|service||STRING|false||门店业态|
 

