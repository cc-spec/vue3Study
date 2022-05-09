
<template>
  <h1>这是关于页面</h1>
  <span>{{x}}, {{y}}</span>
  <button @click="toggle">显示</button>
  <transition name="fade">
    <h1 v-if="showTitle">你好 Vue3</h1>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import {useMouse} from '../utils/useMouse'

let {x, y} = useMouse()
let showTitle = ref(true)

function toggle() {
  showTitle.value = !showTitle.value
}
</script>


<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>