
<template>
  <div>
    <!-- <h1 @click="toggle">这是首页</h1> -->
    <TodoList />
    <Rate :value="score" @update-rate="update" ></Rate>
    <button @click="add">{{count}}</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import TodoList from "../components/TodoList.vue";
// import { useFullScreen } from '@vueuse/core'
import Rate from '../components/Rate.vue'
import { useStore } from '../store/myVuex'
let score = ref(3.5)
function update(num) {
  score.value = num
}

let store = useStore()
let count = computed(() => store.state.count)
function add() {
  store.commit('add')
}
// const { isFullScreen, enter, exit, toggle } = useFullScreen()
</script>