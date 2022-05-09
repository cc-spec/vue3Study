<template>
  <component :is="comp" />
</template>

<script setup>
import { useRouter } from './index';
import { computed } from 'vue';

const router = useRouter()

const comp = computed(() => {
  const route = router.routes.find(
    route => route.path === router.current.value
  )
  return route ? route.component : null
})

</script>