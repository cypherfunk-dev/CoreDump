import { defineStore } from 'pinia';


export const useUiStore = defineStore('ui', {
  state: () => ({
    searchbar: false,
    search: '',
    sidebar: true
  }),
  actions: {
    toggleSearch() {
      this.searchbar = !this.searchbar
    },
    onClickOutside() {
      if (this.searchbar) this.searchbar = false
    },
    toggleSideBar() {
      this.sidebar = !this.sidebar
      console.log(this.sidebar)
    }
  }
})