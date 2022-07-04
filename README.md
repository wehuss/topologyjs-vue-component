# topologyjs-vue-component
在topology.js中使用Vue组件,本项目仅支持vue3



### 快速开始

1.安装本插件

```shell
npm i topologyjs-vue-component
```

或者

```shell
yarn add topologyjs-vue-component
```



2.注册Vue组件后即可使用

```typescript
import { registerVueComponents } from "topologyjs-vue-component";
import VueComponent1 from './vue-component1.vue'
import VueComponent2 from './vue-component2.vue'

registerVueComponents({
    VueComponent1,
    VueComponent2
})
```



### 在Vue组件内使用画笔事件

需要导出一个名为penEvents的对象，其中包括与画笔事件对于的事件函数

```vue
// 组合式api
<script lang="ts" setup>
    import { VuePenEvents } from "topologyjs-vue-component";
    const penEvents:VuePenEvents={
        onMove(pen){
            console.log('move~~~',pen)
        }
    }
    
    defineExpose({
        penEvents
    })
</script>

// 选项式api
<script lang="ts">
    import { defineComponent } from "vue"
    import { VuePenEvents } from "topologyjs-vue-component";
    
    export default defineComponent({
        data(){
            const penEvents:VuePenEvents={
                onMove(pen){
                    console.log('move~~~',pen)
                }
            }
            
            return {
                penEvents
            }
        }
    })
</script>
```



### 在Vue组件内通过props获取画笔数据

```vue
// 组合式api
<script lang="ts" setup>
    import { onMounted } from "vue";
    import { VuePen } from "topologyjs-vue-component";
    
    const props=defineProps<{
        pen:VuePen
    }>()
    onMounted(()=>{
        console.log('pen',props.pen)
    })
</script>

// 选项式api
<script lang="ts">
    import { defineComponent, PropType } from "vue"
    import { VuePen } from "topologyjs-vue-component";
    
    export default defineComponent({
        props:{
            pen:{
                type:Object as PropType<VuePen>,
                default:()=>({})
            }
        },
    })
</script>
```

