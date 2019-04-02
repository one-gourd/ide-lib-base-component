# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.1.9"></a>
## [0.1.9](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.8...v0.1.9) (2019-04-02)


### Features

* **功能新增: 类型声明:** 新增 ValueOf 类型声明 ([165d84d](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/165d84d))
* **功能新增: 路由代理:** 新增 aliasPathProxy、hoistSubRoutes 两个路由重定向功能；新增针对该功能的单元测试用例； ([304af38](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/304af38))



<a name="0.1.8"></a>
## [0.1.8](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.7...v0.1.8) (2019-03-21)


### Bug Fixes

* **injectBehavior 方法:** 当不存在用户自定义函数的时候，也可以使用 solution 中预置的方法 ([ed15a98](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/ed15a98))


### Features

* **功能改善: 属性:** 对 styles、theme 属性进行次级合并，较完整保留默认属性；格式化代码； ([9750a6e](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/9750a6e))
* **功能新增: 函数:** 新增 addModelChangeListener 方法，usePrevious 自定义 hooks ([e5f7453](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/e5f7453))
* **功能新增: 方法:** 新增 getClientFromCtx 方法，用于从 ctx 中提取指定 client 对象 ([82e9451](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/82e9451))



<a name="0.1.7"></a>
## [0.1.7](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.6...v0.1.7) (2019-03-11)


### Bug Fixes

* **重命名:** 将useIndectedEvents更改成useInjectedEvents ([198f32b](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/198f32b))



<a name="0.1.6"></a>
## [0.1.6](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.5...v0.1.6) (2019-03-09)


### Features

* **功能新增：类型声明:** 新增 ElementType 类型定义，方便从数组内容推导出类型合集 ([43c3a64](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/43c3a64))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.4...v0.1.5) (2019-03-08)


### Features

* **功能改进:** ette 响应使用统一的格式；正确给 base component 组件注入默认 props； ([be72457](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/be72457))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.3...v0.1.4) (2019-03-04)


### Bug Fixes

* **类型声明:** 更改过分细致的类型声明 ([efa0f10](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/efa0f10))


### Features

* **ette router:** 提供统一的 response 生成方法 buildNormalResponse ([7d8af81](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/7d8af81))
* **功能增强：sub stores:** 新增用于 sub stores 的工具函数 ([38bd96f](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/38bd96f))
* **功能新增: useIndectedEvents:** 新增 useIndectedEvents 方法，用于给默认属性注入默认的行为操作； ([a44c683](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/a44c683))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.2...v0.1.3) (2019-02-24)


### Bug Fixes

* **类型声明:** 更改 IBaseStyledProps 的声明位置 ([7fa6e41](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/7fa6e41))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/compare/v0.1.1...v0.1.2) (2019-02-24)



<a name="0.1.1"></a>
## 0.1.1 (2019-02-24)


### Features

* **功能初始化:** 从普通组件中提取公共的组件逻辑 ([02adecb](https://github.com/alibaba-paimai-frontend/ide-lib-base-component/commit/02adecb))
