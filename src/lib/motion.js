import { useEffect } from 'react'

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Adds `is-visible` to every [data-reveal] element once it scrolls into view.
// Stagger with an inline `--d` delay on the element.
export function useReveal() {
  useEffect(() => {
    const items = [...document.querySelectorAll('[data-reveal]')]
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
