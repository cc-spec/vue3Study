<template>
  <div :style="fontStyle">
    <div class="rate" @mouseout="mouseOut">
      <span @mouseover="mouseOver(num)" v-for="num in 5" :key="num">☆</span>
      <span class="hollow" :style="fontWidth">
        <span @click="onRate(num)" @mouseover="mouseOver(num)" v-for="num in 5" :key="num">★</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

let props = defineProps({
  value: Number,
  theme: {type: String, default: 'orange'}
})
// 定义value的值为number类型

// 箭头函数不加{}自动return箭头后面的值，加了{}需要手动返回
let rate = computed(() => '★★★★★☆☆☆☆☆'.slice(5 - props.value, 10 - props.value)) 

const themObj = {
  'black': '#000',
  'white': '#fff',
  'red': '#f5222d',
  'orange': '#fa541c',
  'yellow': '#fadb14',
  'green': '#73d13d',
  'blue': '#40a9ff',
}

// 星星颜色
const fontStyle = computed(() => {
  return `color: ${themObj[props.theme]}`
})

let width = ref(props.value)

// 进入节点
function mouseOver(i) {
  width.value = i
}

// 离开节点 
function mouseOut() {
  width.value = props.value
}

const fontWidth = computed(() => `width: ${width.value}em`)

// 评级更改通知父组件
let emits = defineEmits('update-rate')
function onRate(num) {
  emits('update-rate', num)
}
</script>

<style scoped>
.rate {
  position: relative;
  display: inline-block;
}
.rate > span.hollow {
  position: absolute;
  display: inline-block;
  top: 0;
  left: 0;
  width: 0;
  overflow: hidden;
}
</style>