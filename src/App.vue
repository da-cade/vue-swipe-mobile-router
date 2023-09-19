<template>
  <MobileSwiper v-if="mobile" />
</template>


<script>
import { computed } from "vue";
import MobileSwiper from "./components/bundles/MobileSwiper/MobileSwiper.vue";
import { store } from "./store";
export default {
  components: {
    MobileSwiper,
  },
  setup() {
    return { mobile: computed(() => store.state.mobile) };
  },
};
</script>




<style lang="scss" scoped>
</style>