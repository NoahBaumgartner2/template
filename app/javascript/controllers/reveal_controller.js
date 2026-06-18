import { Controller } from "@hotwired/stimulus"

// Fades and slides an element into view the first time it scrolls
// into the viewport (opacity 0 -> 1, translateY 30px -> 0).
export default class extends Controller {
  connect() {
    if (this.element.dataset.revealDelay) {
      this.element.style.transitionDelay = `${this.element.dataset.revealDelay}ms`
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersect(entries),
      { threshold: 0.15 }
    )
    this.observer.observe(this.element)
  }

  disconnect() {
    this.observer?.disconnect()
  }

  handleIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.element.classList.add("is-visible")
        this.observer.unobserve(this.element)
      }
    })
  }
}
