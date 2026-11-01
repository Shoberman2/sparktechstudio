// Schema.org helpers for the page-level JSON-LD
import { pricing } from '../designs/content.jsx'

export const SITE = 'https://www.sparktechstudio.com'
export const ORG = `${SITE}/#org`

export const crumbs = list => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })) })
export const faqLd = items => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })
const offer = key => {
  const p = pricing[key], [lo, hi] = p.price.match(/[\d,]+k?/g).map(v => Number(v.replace(/,/g, '').replace('k', '000')))
  return { '@type': 'Offer', name: p.name, priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'USD', ...(hi ? { minPrice: lo, maxPrice: hi } : { price: lo }), ...(p.unit === 'a month' ? { unitText: 'MONTH' } : {}) } }
}
export const serviceLd = (page, name, area = [{ '@type': 'City', name: 'New York' }, { '@type': 'Place', name: 'Long Island, NY' }]) => {
  const keys = [page.package].flat().filter(Boolean)
  return { '@context': 'https://schema.org', '@type': 'Service', name, serviceType: name, url: `${SITE}${page.path}`, provider: { '@id': ORG }, areaServed: area, ...(keys.length ? { offers: keys.map(offer) } : {}) }
}

