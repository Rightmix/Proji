import '@testing-library/jest-dom/vitest'

// jsdom lacks HTMLDialogElement modal APIs and matchMedia; minimal polyfills for tests.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// Stage 5.5: device-local stores (cart, favourites, builder draft) must not leak between tests.
import { afterEach } from 'vitest'
import { cartStore } from '../features/cart/cartStore'
import { favouritesStore } from '../features/meals/favourites'
afterEach(() => {
  try {
    sessionStorage.clear()
    localStorage.clear()
  } catch {
    /* ignore */
  }
  cartStore.reset()
  favouritesStore.reset()
})
