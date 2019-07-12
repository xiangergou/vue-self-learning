---
title: vue源码阅读 -- 构造函数
date: 2019-04-09
---
![vuepress](https://img.shields.io/badge/vue-2.5.19-brightgreen.svg)

## 构造函数Vue的流动路径
```md
src/platforms/web/entry-runtime-with-compiler.js
                ⬇
src/platforms/web/runtime/index
                ⬇
src/core/index.js
                ⬇
src/core/instance/index.js
```

## vue本质
vue本质仍是一个构造函数
以'声明'与'初始化'两个阶段划分

‘声明阶段’只做两件事
  1. 为构造函数Vue添加原型方法，比如$set,$emit
  2. 为Vue添加全局方法, 如 Vue.set,Vue.util等

### 原型方法加入
  ```js
  // ./instance/index.js
  // 从五个文件导入五个方法（不包括 warn）
  import { initMixin } from './init'
  import { stateMixin } from './state'
  import { renderMixin } from './render'
  import { eventsMixin } from './events'
  import { lifecycleMixin } from './lifecycle'
  import { warn } from '../util/index'

  // 定义 Vue 构造函数
  function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
  }

  // 将 Vue 作为参数传递给导入的五个方法
  initMixin(Vue)
  stateMixin(Vue)
  eventsMixin(Vue)
  lifecycleMixin(Vue)
  renderMixin(Vue)

  // 导出 Vue
  export default Vue
  ```
  由 this._init(options) 可看出，当创建vue实例，将执行_init方法，此时整个vue机器将开始运转。
  initMixin(Vue)之后
  ```js
  Vue.prototype.$_init = function(options?: Object) {}
  ```
  具体操作留与实例化再讲。

  stateMixin(Vue)
  ```js
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)
  ```
  快速了解函数作用的一个技巧就是速览函数入参出参、起始收尾。
  最后两行表明，之前的一些列定义无外乎借用defineProperty为Vue原型上定义两个属性，$data、$props。然后根据环境判断，除生产外设其为只读。

  之后又在原型上定义了三个方法，这些将在之后数据响应系统再表。
  ```js
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  )
  ```


  eventsMixin(Vue)
  
  ```js
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {}
  Vue.prototype.$once = function (event: string, fn: Function): Component {}
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {}
  Vue.prototype.$emit = function (event: string): Component {}
```

```js
  // on
  // _events 在实例化后的initEvents方法有声明
  (vm._events[event] || (vm._events[event] = [])).push(fn)
  if (hookRE.test(event)) {
  // 这句做什么用的？
    vm._hasHookEvent = true
  }
  
```
$off、$once实现简单，不做多表。
  

lifecycleMixin(Vue)
```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {}
Vue.prototype.$forceUpdate = function () {}
Vue.prototype.$destroy = function () {}
 ```
 牵扯到声明周期与数据响应

 renderMixin(Vue)
 ```js
 export function installRenderHelpers(target) {
    target._o = markOnce; //实际上，这意味着使用唯一键将节点标记为静态。* 标志 v-once. 指令
    target._n = toNumber; //字符串转数字，如果失败则返回字符串
    target._s = toString; // 将对象或者其他基本数据 变成一个 字符串
    target._l = renderList; //根据value 判断是数字，数组，对象，字符串，循环渲染
    target._t = renderSlot; //用于呈现<slot>的运行时帮助程序 创建虚拟slot vonde
    target._q = looseEqual; //检测a和b的数据类型，是否是不是数组或者对象，对象的key长度一样即可，数组长度一样即可
    target._i = looseIndexOf; //或者 arr数组中的对象，或者对象数组 是否和val 相等
    target._m = renderStatic;//用于呈现静态树的运行时助手。 创建静态虚拟vnode
    target._f = resolveFilter; // 用于解析过滤器的运行时助手
    target._k = checkKeyCodes; // 检查两个key是否相等，如果不想等返回true 如果相等返回false
    target._b = bindObjectProps; //用于将v-bind="object"合并到VNode的数据中的运行时助手。  检查value 是否是对象，并且为value 添加update 事件
    target._v = createTextVNode; //创建一个文本节点 vonde
    target._e = createEmptyVNode;  // 创建一个节点 为注释节点 空的vnode
    target._u = resolveScopedSlots; //  解决范围槽 把对象数组事件分解成 对象
    target._g = bindObjectListeners; //判断value 是否是对象，并且为数据 data.on 合并data和value 的on 事件
  }

  Vue.prototype.$nextTick = function (fn: Function) {}
  Vue.prototype._render = function (): VNode {}
 ```
每个 *Mixin 方法的作用其实就是包装 Vue.prototype，在其上挂载一些属性和方法。


### 全局方法加入

接下来回退到src/core/index.js

```js
// 从 Vue 的出生文件导入 Vue
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

// 将 Vue 构造函数作为参数，传递给 initGlobalAPI 方法，该方法来自 ./global-api/index.js 文件
initGlobalAPI(Vue)

// 在 Vue.prototype 上添加 $isServer 属性，该属性代理了来自 core/util/env.js 文件的 isServerRendering 方法
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

// 在 Vue.prototype 上添加 $ssrContext 属性
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

// Vue.version 存储了当前 Vue 的版本号
Vue.version = '__VERSION__'

// 导出 Vue
export default Vue
```
显而易见，core/index.js又为Vue添加两个只读属性$isServer、$ssrContext以及FunctionalRenderContext属性。

'__VERSION__'此处不能以字符串对待，打开scripts/config.js 文件，genConfig方法有定义__VERSION__: version，事实上此处被rollup插件替换成了当前vue版本。  那么  为什么这么设置呢
？
接下来， initGlobalAPI(Vue)。

打开global-api
```js
 const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)
```
同$data、$props一样，config被设为只读。


接下来
```js
// exposed util methods.
// NOTE: these are not considered part of the public API - avoid relying on
// them unless you are aware of the risk.
Vue.util = {
	warn,
	extend,
	mergeOptions,
	defineReactive
}
```
注意注释，Vue.util被赋予的四个属性都不被在公共属性范围当中，但依然可用，只需注意额外风险。（尚未对风险有理解，先做标记）

```js
Vue.options = Object.create(null)
ASSET_TYPES.forEach(type => {
  Vue.options[type + 's'] = Object.create(null)
})

// this is used to identify the "base" constructor to extend all plain-object
// components with in Weex's multi-instance scenarios.
Vue.options._base = Vue

```

声明了options为空对象，并在之后为其赋值。 ASSET_TYPES的值为
```js
[
  'component',
  'directive',
  'filter'
]
```
最后一句
```js
extend(Vue.options.components, builtInComponents)
```
extend的作用在于将参数后者混入前者，加之builtInComponents来自文件core/components/index.js
```js
// core/components/index.js
import KeepAlive from './keep-alive'

export default {
  KeepAlive
}
```
故而执行完成之后，vue.options将为
```js
Vue.options = {
	components: {
		KeepAlive
	},
	directives: Object.create(null),
	filters: Object.create(null),
	_base: Vue
}
```


再看最后core/global-api/index.js结尾处
```js
initUse(Vue)  // global-api/use.js  为Vue添加use方法
initMixin(Vue) // global-api/mixin.js 为Vue添加mixin方法
initExtend(Vue) // global-api/extend.js 为Vue添加extend方法
initAssetRegisters(Vue) // global-api/assets.js
```
着重看下global-api/assets.js
```js
  export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      // ......
    }
  })
}
```
ASSET_TYPES已知, ['component', 'directive', 'filter'], 故而此处未Vue添加3个全局方法
```js
Vue.component
Vue.directive
Vue.filter
```
至此，src/core/index.js分析完成，其主要功能即为为Vue添加诸多全局属性。

```js
Object.defineProperty(Vue, 'config', configDef) // 监听config设置不可修改
  Vue.component
  Vue.directive
  Vue.filter
  Vue.mixin
  Vue.use
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  Vue.options
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  Vue.extend
```

## Vue 平台化兼容处理

Vue是一个多平台项目(Multi-platform)，不同平台有不同的组件抑或特定功能，故而src/platforms/web/runtime/index文件即为处理跨平台文件.

打开platforms/web/runtime/index.js文件， 一堆import底下首当其冲就是对config的属性覆盖
```js
// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement
```
回头打开config定义的文件core/config.js，可以看到很多地方都有这样一句注释，This is platform-dependent and may be overwritten. 与平台相关的属性或将被覆盖掉。

接下来
```js

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

```
extend作用之前有介绍，即 将参数后者混入前者，此处即为将platformDirectives、platformComponents分别混入Vue.options.directives，Vue.options.components中。
分别打开platformDirectives、platformComponents引用文件
```js
// platformDirectives
import model from './model'
import show from './show'

export default {
  model,
  show
}
```
```js
// platformComponents
platformDirectives = {
  model,
  show
}
```
混入之后，Vue.options就有了如下的变化
```js
Vue.options = {
	components: {
		KeepAlive
	},
	directives: Object.create(null),
	filters: Object.create(null),
	_base: Vue
}
    ⬇️
Vue.options = {
	components: {
		KeepAlive
	},
	directives: {
		model,
		show
	},
	filters: Object.create(null),
	_base: Vue
}
```

紧接着，Vue原型又添加了两个属性
```js
// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
patch和$mount都与vnode有关，之后再做分析，noop为空函数。

收尾部分就是根据当前环境与浏览器以及是否已添加Devtools做出相应提示，根据当前环境与当前productionTip的值判断是否给出开发模式提示，若不想看见当前提示，productionTip设置未false即可。


## Vue编译

打开src/platforms/web/entry-runtime-with-compiler.js

```js
// 导入 运行时 的 Vue
import Vue from './runtime/index'

// 从 ./compiler/index.js 文件导入 compileToFunctions
import { compileToFunctions } from './compiler/index'

// 使用 mount 变量缓存 Vue.prototype.$mount 方法
const mount = Vue.prototype.$mount
// 重写 Vue.prototype.$mount 方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // ... 函数体省略
}

// 在 Vue 上添加一个全局API `Vue.compile` 其值为上面导入进来的 compileToFunctions
Vue.compile = compileToFunctions

// 导出 Vue
export default Vue
```

删繁就简，首先看文件的开始以及结尾，import Vue from './runtime/index'
```js
// 运行时版
import Vue from './runtime/index'

export default Vue
```
可以看出当前文件就是纯粹导出Vue，没做任何操作。
接着看收尾部分
```js
Vue.compile = compileToFunctions
// 导出 Vue
export default Vue
```
加上对$mount方法的改写，可以看到说明当前文件的作用，1为覆盖$mount方法，2为为Vue添加compile全局API

::: tip runtime和full介绍
1. 如果你需要在运行时处理之前编译templates(例如, 有一个template选项，或者挂载到一个元素上，而你又将元素内的DOM元素作为模板来处理，这时候就需要compiler这部分进行完整编译。
2. 如果你打包的时候是用vue-loader 或者 vueify，将`*.vue文件内的templates编译成JavaScript代码， 你就不需要compiler, 可以使用 runtime-only版本编译。
3. 因为仅仅包含运行时编译比完整版少30%的代码体积， 如果你需要使用完整包也是可以的，你需要调整配置，具体调整请参考文章描述。
:::