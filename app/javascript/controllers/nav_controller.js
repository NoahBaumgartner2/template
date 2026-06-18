import { Controller } from "@hotwired/stimulus"

// Controls the sticky navigation: background state on scroll and the
// mobile menu toggle.
export default class extends Controller {
  static targets = ["menu", "icon"]

  connect() {
    this.onScroll = this.onScroll.bind(this)
    window.addEventListener("scroll", this.onScroll, { passive: true })
    this.onScroll()
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll)
  }

  onScroll() {
    this.element.classList.toggle("is-scrolled", window.scrollY > 24)
  }

  toggle() {
    this.menuTarget.classList.toggle("hidden")
    this.element.classList.toggle("menu-open")
  }

  close() {
    this.menuTarget.classList.add("hidden")
    this.element.classList.remove("menu-open")
  }
}
