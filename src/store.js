import { createStore } from 'vuex'

// Create a new store instance.
export const store = createStore({
  state() {
    return {
      // any object in the below array represents a prop that is passed from MobileSwiper to MobilePage
      pages: [{ title: "Settings", routeName: "SettingsView", color: "red" },
      {
        title: "Conversations",
        routeName: "ConversationsView",
        color: "yellow",
      },
      { title: "Chat", routeName: "ChatView", color: "green" },
      { title: "Details", routeName: "UserDetailsView", color: "blue" }],
      currentIndex: 1,
      pagesRendered: ["red", "yellow", "green"],
      isInfiniteLoop: false,
      prefersReducedMotion: false,
      upcomingIndex: 0,
      currentRoute: null,
      mobile: window.screen.width <= 749,
    }
  },
  mutations: {
    toggleInfiniteSwipe(state) {
      return state.isInfiniteLoop = !state.isInfiniteLoop
    },
    toggleReducedMotion(state) {
      return state.prefersReducedMotion = !state.prefersReducedMotion
    },
    updatePageIndex(state) {
      return state.currentIndex = state.upcomingIndex;
    }
  }
})
