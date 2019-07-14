---
title: 初始化开始
date: 2019-04-09
---
![vuepress](https://img.shields.io/badge/vue-2.5.19-brightgreen.svg)

## 初始化开始

```js
new Vue({
    el: '#app',
    data: {
        test: 1
    }
})
```
还记得/core/instance/index.js
```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```
关于_init，打开/core/instance/init.js
```js
import { mark, measure } from '../util/perf'
// ...省略一堆import
let uid = 0 // 自增id，保证每个实例都有唯一id
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }
    //  ...中间代码暂省

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
  }

```
关于[performance](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)。  主要用于在浏览器开发工具的性能/时间线面板中启用对组件初始化、编译、渲染和打补丁的性能追踪。在config文件，performance属性默认false，如果要开启性能检测，只需配置Vue.config.performance为true即可。

```js
// a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }

```

vm._isVue = true, 标志当前对象是vue实例，用以在之后避免该对象被响应系统观测。

据之前的分析此时_isComponent断然是没有的，顾名思义当是与组件挂钩。  此时走else代码块
```js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```
mergeOptions单开一章


```js
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm)
  } else {
    vm._renderProxy = vm
  }
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')

  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
```
一堆初始化方法。  
