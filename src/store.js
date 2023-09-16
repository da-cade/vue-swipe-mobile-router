import { createStore } from 'vuex'

// Create a new store instance.
export const store = createStore({
  state() {
    return {
      items: ["red", "yellow", "green", "blue"],
      currentIndex: 0,
      upcomingIndex: 0,
      pagesRendered: ["red", "yellow", "green"],
      swiperInfiniteLoop: false,
      prefersReducedMotion: false,
    }
  },
  mutations: {
    toggleInfiniteSwipe(state) {
      return state.swiperInfiniteLoop = !state.swiperInfiniteLoop
    },
    toggleReducedMotion(state) {
      return state.prefersReducedMotion = !state.prefersReducedMotion
    },
    updatePageIndex(state) {
      return state.currentIndex = state.upcomingIndex;
    }
  }
})
