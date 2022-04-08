# Getting Started

本文将主要介绍 OpenTreeHole 网页(vue)前端项目开发中可能需要知道的一些技术（如如何配置环境、应当事先学习哪些库的用法、如何部署等），不过由于篇幅所限，本文仅对这些技术的用途做简要介绍，详情还请分别阅读其**官方文档**。

## 关于开发环境

本项目推荐使用 yarn 作为包管理器。

```shell
# Clone the repository
git clone https://www.github.com/OpenTreeHole/vue.git # 推荐使用SSH！
cd vue
# Install Dependencies
yarn
```

经过以上几步，即可基本部署完成开发环境。此时如果运行```yarn serve```就应已经可以在localhost:8080（具体端口号会在终端显示）看到部署完成的测试服务器了。不过为开发的效率与规范起见，您还应了解以下几点：

1. 在每次commit代码之前均应运行```eslint --fix```或```yarn lint```（由于 package.json 中的配置，两者应是完全等价的）。此条命令能自动规范化你的代码样式，如删除多余空行/空格，将双引号替换为单引号等。如使用WebStorm进行开发，推荐在 **设置-工具-保存时的操作** 中勾选 **运行 eslint --fix** ，这会让你不必每次手动运行```eslint --fix```。另外，有时 自动格式化代码（WebStorm中默认为 Ctrl+Alt+L）会与 eslint 产生冲突（如 自动格式化代码 会将函数名与括号间的空格删去而 eslint 会添上这一空格），请以 eslint 为准。
2. 可以安装一个 Chrome 的插件：Vue DevTools。这会让你调试时能直接监控到 data、props、以及 Vuex 中的数据的变化（可能有点延迟）。Vue DevTools 只能监控 development 模式（即 ```yarn serve```），无法监控 production 模式（即 ```yarn build```）。
3. 在提交代码时，应提交到新的分支或 dev 分支，切勿提交到 master 分支（事实上，由于 master 分支已经设置了保护，你也无法做到这一点）。dev 分支的代码会直接部署到测试服务器（目前即为该项目的 Github Page，即 https://opentreehole.github.io/ ），而 master 分支的代码会直接部署到运行环境中。所以，master分支的改动均应通过 Pull Request 提交，并经过至少一名项目管理者 Review 后才可完成。提交到 master 分支的代码应更改 package.json 中的版本号，以免由于用户浏览器缓存而无法获取新版。

## 关于重要的库

本项目主要使用 Vue2 + Vuetify + Typescript 进行开发。计划在 Vuetify 完成向 Vue3 的迁移之后也迁移到 Vue3。

### Vue2

无论如何，整个项目都是用 Vue 写的，对于 Vue 你必须拥有基本的认识。详情参见文档，在此不再赘述。

Vue2 官方中文文档： https://cn.vuejs.org/v2/guide/

### Vuetify

Vuetify 是 Vue 最常用的 UI 框架。它提供了较多的基于 [Material Design](https://material.io/) 规范的常用 UI 组件，同时也包装了一些常用的 css。

Vuetify 源码中几乎没有使用（可能就是一点没用）template实现，而是重写了 render 方法，是一个比较优美、层次清晰的架构。有兴趣去可以了解一下。

Vuetify 官方中文文档：https://vuetifyjs.com/zh-Hans/getting-started/ （中文看不明白的换英文看）

### Typescript

Typescript 可以看作是一个 Javascript 的超集。它将 Javascript 强类型化，即需要你声明每个变量的类型，以使代码有更高的可读性，同时减少了运行时因类型产生的一些错误。使用时需要将```<script>```改为```<script lang='ts'>```。

需要注意的是，Typescript 可以看作是 Javascript 的上级语言，即它经过一次编译会转化为 Javascript （这个编译过程不需要手动执行，包含在 serve 和 build 的过程中）。这意味着 interface 等类型定义在运行时是不存在的，即你无法在运行时直接地判断一个变量是否是某一 interface 的实例，只能通过该变量是否拥有某些字段来间接判断。不过，class 是 Javascript 本身即有的语法，故可以判断某变量是否是某 class 的实例。

另外，在导入某些库时，tslint（即 Typescript 的语法检查器）会提示你 ```TS7016: Could not find a declaration file for module``` 。这是由于该模块使用纯 Javascript 实现，Typescript 并不知道其导出的变量/方法的类型。这时一般有两种解决方案：

1. 尝试```yarn add @types/<package-name>```（其中 <package-name> 是你要安装的包名）。如果你想要导入的库提供了另外的 Typescript 支持就可以解决此问题。（有时需要重新启动 WebStorm 才能生效）
2. 自己写一份额外的 .d.ts 文件来提供类型定义。一般该文件叫 shims-<package-name>.d.ts 。声明文件使用说明：https://ts.xcatliu.com/basics/declaration-files.html

Typescript 中文文档（非官方）：https://typescript.bootcss.com/

Typescript 官方文档：https://www.typescriptlang.org/docs/

### Vue Class-Style Component

Vue Class-Style Component 可以将 Vue 的一个单文件组件改为 class 的形式。除了让代码变得稍微好看一点（符合 Java 习惯）以及产生一堆奇怪的bug之外没什么用。只是开发者的个人癖好。

需要注意的是，Vue Class-Style Component 重载父类方法有点问题，不能访问 super 方法（而且 vue-class-component 的开发者似乎不认为这是个问题），所以尽量不要使用。

Vue Class-Style Component 文档：

1. vue-class-component：https://class-component.vuejs.org/
2. vue-property-decorator：https://github.com/kaorun343/vue-property-decorator （提供了@Prop @Ref 等实用注解）

### Vuex

Vuex 是一个为 Vue 的**状态管理模式 + 库**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

本项目中，Vuex 也使用了类似 Vue Class-Style Component 的解决方案：Vuex Module Decorators。它将 Vuex 的模块变为 class 的形式。

Vuex 官方中文文档：https://vuex.vuejs.org/zh/

Vuex Module Decorators 官方文档（没有中文，但应该没有什么阅读障碍）：https://championswimmer.in/vuex-module-decorators/

### Vue Router

Vue Router 是一个管理 Vue 组件间的路由的工具。

所有路由信息都写在 router.ts 中。可以看见，RouteConfig 提供了一个 meta 字段用来储存关于此路由的额外信息，本项目中主要用此字段来确定该路由是否有权限被访问，以及是否要显示在导航栏中。

Vue Router 官方中文文档：https://router.vuejs.org/zh/introduction.html

## 关于不那么重要的库

以下库可以等需要使用时再稍微了解。

### Lodash.js

一个 Javascript 的工具库，提供了很多非常有用的方法，如 cloneDeep（深度复制一个变量），remove（删除数组中的一个元素），debounce（防抖动，延迟调用）等。

Lodash.js 官方中文文档：https://www.lodashjs.com/

### GSAP

一个 Javascript 动画库，简单复杂的动画都可以实现。

GSAP 官方文档（没中文）：https://greensock.com/docs/

### RxJS

RxJS 是使用 Observables 的响应式编程的库，它使编写异步或基于回调的代码更容易。这个项目是 [Reactive-Extensions/RxJS](https://github.com/Reactive-Extensions/RxJS)(RxJS 4) 的重写，具有更好的性能、更好的模块性、更好的可调试调用堆栈，同时保持大部分向后兼容，只有一些破坏性的变更(breaking changes)是为了减少外层的 API 。（以上描述摘自官网，因为我也不知道怎么描述它。我就把它当一个 Event Bus 用）

RxJS 中文文档：https://cn.rx.js.org/

RxJS 官方文档：https://rxjs.dev/guide/overview

### Scss

Scss 不能算是一个库，暂且把它列在这里。它可以看作是一个 css 的超集，但包含了嵌套和变量等功能。

使用 Scss 需要将```<style>```改为```<style lang='scss'>```

Scss 官方文档：https://sass-lang.com/

## 关于部署

你或许认为直接运行```yarn build```就可以完成部署。事实上也确实是这样。

但为了规范性和安全性，在运行环境中还是推荐使用 Docker  进行部署。（本地调试的时候不需要这样做！）

可以把 Docker 理解为一个虚拟机，将整个项目放在其中运行。这个虚拟机也仅负责运行这个项目。

Docker 官方文档：https://docs.docker.com/

Docker 入门教程：https://docker-curriculum.com/

