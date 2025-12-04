import { defineStore } from 'pinia';
import database from '../database/db.json';
import MiniSearch from 'minisearch';
const accessNested = (obj: any, path: string) => {
  return path.split('.').reduce((doc, key) => {
    const intKey = parseInt(key, 10);
    return doc && doc[isNaN(intKey) ? key : intKey];
  }, obj);
}

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 


export const useUiStore = defineStore('ui', {
  state: () => ({
    searchbar: false,
    search: '',
    sidebar: true,
    loading: false
  }),
  actions: {
    toggleSearch() {
      this.searchbar = !this.searchbar
    },
    onClickOutside() {
      if (this.searchbar) this.searchbar = false
      console.log('clicked outside')
      console.log(this.search)
      },
    onloading(val: boolean) {
      this.loading = val
    },
    toggleSideBar() {
      this.sidebar = !this.sidebar
    },
    queryChange(val: string) {
      this.search = val
      const miniSearch = new MiniSearch({
        idField: 'id',
        extractField: (doc, fieldName) => accessNested(doc, fieldName),
        fields: ['metadata.title', 'metadata.tags', 'metadata.abstract', 'metadata.category', 'metadata.date'],
        storeFields: ['slug', 'metadata.title', 'metadata.tags', 'metadata.abstract', 'metadata.date']
    })
      miniSearch.addAll(database)
      const results = miniSearch.search(removeAccents(this.search), {
        prefix: true,
        fuzzy: 0.2
      })
      return results
  }
}})