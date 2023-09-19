<template>
  <div id="touch-container" ref="touchContainer">
    <div
      ref="itemsContainer"
      id="rendered-items-flexbox"
      :class="state.transitionClass"
      :style="{ transform: state.transformStyle }"
    >
      <div
        v-for="page in renderedItems"
        :key="page.key"
        :id="page.key"
        class="rendered-item"
      >
        <!-- <div class="item-content" :class="item.id">{{ item.id }}</div> -->
        <MobilePage :route="page" :class="page.color" />
      </div>
    </div>

    <!--
      LEFT & RIGHT TOUCH AREAS
      Non-visible divs over left & right sides of screen that can be tapped to change slide
    -->
    <div
      class="touch-tap-left"
      role="button"
      aria-label="Previous"
      tabindex="0"
      @click="previous"
      @keyup.enter="previous"
      @keyup.space="previous"
    >
      <!--   
        LEFT EDGE SHAPE
        Edge animation when reaching end of array, otherwise loops infinitely (optional)
      -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 10 100"
        height="100%"
        width="40px"
        preserveAspectRatio="none"
        class="left-edge-shape"
        :class="state.transitionClass"
        :style="{ transform: 'scaleX(' + state.leftEdgeScale + ')' }"
      >
        <path d="M0,0v100h5.2c3-14.1,4.8-31.4,4.8-50S8.2,14.1,5.2,0H0z" />
      </svg>
    </div>

    <div
      class="touch-tap-right"
      role="button"
      aria-label="Next"
      tabindex="0"
      @click="next"
      @keyup.enter="next"
      @keyup.space="next"
    >
      <!-- RIGHT EDGE SHAPE-->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 10 100"
        height="100%"
        width="40px"
        preserveAspectRatio="none"
        class="right-edge-shape"
        :class="state.transitionClass"
        :style="{ transform: 'scaleX(' + state.rightEdgeScale + ')' }"
      >
        <path
          d="M10,100V0L4.8,0C1.8,14.1,0,31.4,0,50c0,18.6,1.8,35.9,4.8,50H10z"
        />
      </svg>
    </div>
  </div>
</template>


<script>
import { computed, onMounted, reactive, ref } from "vue";
import Hammer from "hammerjs";
import _ from "lodash";
import { store } from "../../../store";
import { router } from "../../../router";
import MobilePage from "../../../pages/MobilePage.vue";
export default {
  components: {
    MobilePage,
  },
  setup() {
    const state = reactive({
      translateX: 0,
      maxTranslateX: 0,
      transformStyle: "translateX(0)",
      transitionClass: "transition-initial",
      isTransitioning: false,
      leftEdgeScale: 0,
      rightEdgeScale: 0,
      currentRoute: null,
    });

    const touchContainer = ref(null);
    const itemsContainer = ref(null);

    onMounted(() => {
      itemsContainer.value.addEventListener("transitionstart", (e) => {
        if (e.target === itemsContainer.value) {
          state.isTransitioning = true;
        }
      });
      itemsContainer.value.addEventListener("transitionend", (e) => {
        if (e.target === itemsContainer.value) {
          updateCurrentItem();
        }
      });

      const hammer = new Hammer.Manager(touchContainer.value, {
        recognizers: [
          [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }],
          [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
        ],
      });
      hammer.on("pan swipe", handleTouchEvents);
    });

    const infoItems = computed(() => {
      let arr = [...store.state.pages];

      // If there are only 2 items, double array to always have odd number in renderedItems
      if (arr.length === 2) {
        arr = [...arr, ...arr];
      }
      const rendered = arr.map((page, index) => ({
        title: page.title,
        routeName: page.routeName,
        color: page.color,
        key: `${page.name}-${index}`,
      }));
      console.log(rendered);
      return rendered;
    });

    const renderedItems = computed(() => {
      // const { currentIndex: i, infoItems } = state;
      if (infoItems.value.length === 1) {
        return [infoItems.value[0]];
      }

      // Modifies prev and next index for infinite scroll compatibility.
      const lastIndex = infoItems.value.length - 1;
      const prevIndex =
        store.state.currentIndex === 0
          ? lastIndex
          : store.state.currentIndex - 1;
      const nextIndex =
        store.state.currentIndex === lastIndex
          ? 0
          : store.state.currentIndex + 1;
      return [
        infoItems.value[prevIndex],
        infoItems.value[store.state.currentIndex],
        infoItems.value[nextIndex],
      ];
    });

    const isNextAvailable = computed(() => {
      const { pages, currentIndex, isInfiniteLoop } = store.state;
      return (
        currentIndex < pages.length - 1 ||
        (isInfiniteLoop && pages.length !== 1)
      );
    });

    const isPreviousAvailable = computed(() => {
      const { pages, currentIndex, isInfiniteLoop } = store.state;
      return currentIndex > 0 || (isInfiniteLoop && pages.length !== 1);
    });

    function handleTouchEvents(e) {
      const { isTransitioning, translateX, leftEdgeScale, rightEdgeScale } =
        state;
      const { deltaX, deltaY, isFinal } = e;

      if (isTransitioning) {
        return;
      }

      if (
        Math.abs(deltaX) < 8 ||
        (Math.abs(deltaY) - Math.abs(deltaX) > -1 &&
          !translateX &&
          !leftEdgeScale &&
          !rightEdgeScale)
      ) {
        console.log("returning 161");
        return;
      }

      if (
        (!isPreviousAvailable.value && deltaX > 0) ||
        (!isNextAvailable.value && deltaX < 0)
      ) {
        updateEdgeEffect(deltaX, isFinal);
      } else if (isFinal) {
        handleGestureEnd(deltaX);
      } else {
        handleGestureMove(deltaX);
      }
    }

    function handleGestureMove(deltaX) {
      const { maxTranslateX } = state;

      // Record farthest distance in one direction so can check if gesture goes in
      // opposite direction, indicating user doesn't want to change slides
      if (Math.abs(deltaX) > Math.abs(maxTranslateX)) {
        state.maxTranslateX = deltaX;
      }

      // Move items by deltaX amount
      state.translateX = deltaX;
      state.transitionClass = "transition-initial";
      state.transformStyle = `translateX(${deltaX}px)`;
    }

    function handleGestureEnd() {
      const { translateX, maxTranslateX } = state;

      if (Math.abs(translateX) - Math.abs(maxTranslateX) < -1) {
        // If gesture goes too much in oposite direction, stay on current slide
        state.transitionClass = "transition-item";
        state.transformStyle = "translateX(0)";
      } else if (translateX > 0) {
        previous();
      } else if (translateX < 0) {
        next();
      }
    }

    function updateEdgeEffect(deltaX = 0, isFinal = false) {
      if (isFinal) {
        state.transitionClass = "transition-edge";
        state.leftEdgeScale = 0;
        state.rightEdgeScale = 0;
      } else {
        state.transitionClass = "transition-initial";
        const scaleVal = Math.min(0.2 + Math.abs(deltaX) / 50, 1);
        if (deltaX > 0) {
          state.leftEdgeScale = scaleVal;
        }
        if (deltaX < 0) {
          state.rightEdgeScale = scaleVal;
        }
      }
    }

    // Debounce previous & next functions so only triggered by individual gestures
    const previous = _.debounce(
      function () {
        if (state.isTransitioning) {
          return;
        }

        if (!isPreviousAvailable.value) {
          updateEdgeEffect(100, false);
          setTimeout(() => {
            updateEdgeEffect(0, true);
          }, 100);
          return;
        }

        const { currentIndex, pages, prefersReducedMotion } = store.state;

        state.transitionClass = "transition-item";
        state.transformStyle = "translateX(100vw)";

        const prevIndex =
          currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
        store.state.upcomingIndex = prevIndex;

        if (prefersReducedMotion) {
          updateCurrentItem();
        }
      },
      100,
      { leading: true, trailing: false }
    );

    // Respond to "next" navigation request
    // Figure out which card is next and call updateCurrentItem
    const next = _.debounce(
      function () {
        if (state.isTransitioning) {
          return;
        }

        if (!isNextAvailable.value) {
          updateEdgeEffect(-100, false);
          setTimeout(() => {
            updateEdgeEffect(0, true);
          }, 100);
          return;
        }

        const { currentIndex, pages, prefersReducedMotion } = store.state;

        state.transitionClass = "transition-item";
        state.transformStyle = "translateX(-100vw)";

        const nextIndex =
          currentIndex === pages.length - 1 ? 0 : currentIndex + 1;
        store.state.upcomingIndex = nextIndex;

        if (prefersReducedMotion) {
          updateCurrentItem();
        }
      },
      100,
      { leading: true, trailing: false }
    );

    // If using Vue Router or Vuex, can put that logic here instead of just changing local state
    function updateCurrentItem() {
      store.state.currentIndex = store.state.upcomingIndex;
      // store.commit("updatePageIndex");
      store.state.currentRoute =
        store.state.pages[store.state.currentIndex].routeName;
      router.push({ name: state.currentRoute });
      resetTranslate();
    }

    function resetTranslate() {
      state.isTransitioning = false;
      state.transitionClass = "transition-initial";
      state.transformStyle = "translateX(0)";
      state.translateX = 0;
      state.maxTranslateX = 0;
    }

    return {
      state,
      renderedItems,
      touchContainer,
      itemsContainer,
      next,
      previous,
    };
  },
};
</script>


<style lang="scss" scoped>
</style>