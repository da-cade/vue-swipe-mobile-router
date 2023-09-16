<template>
  <div class="page">
    <h1 class="text-black">{{ route.title }}</h1>
    <router-view :name="route.routeName" v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>


<script>
export default {
  props: {
    route: {
      type: Object,
      required: true,
    },
  },
  setup() {
    // console.log(props);
    return {};
  },
};
</script>


<style lang="scss" scoped>
h1 {
  font-size: 3em;
}
</style>