import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function generateEmbedCode(storeId, widgetType = 'carousel', theme = 'dark') {
  return `<!-- RecoAI Widget - ${widgetType} -->
<div id="recoai-widget"
  data-store="${storeId}"
  data-type="${widgetType}"
  data-theme="${theme}">
</div>
<script src="https://cdn.recoai.io/widget.js" async></script>`
}

export function generateIframeCode(storeId, widgetType = 'carousel', theme = 'dark', height = '400') {
  const iframeUrl = `https://widget.recoai.io/embed?storeId=${storeId}&type=${widgetType}&theme=${theme}`
  return `<!-- RecoAI Embedded Widget (iframe) -->
<iframe
  src="${iframeUrl}"
  width="100%"
  height="${height}"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 8px;"
  title="RecoAI Recommendations">
</iframe>`
}

export function generateLiquidCode(storeId, widgetType = 'carousel', theme = 'dark') {
  return `{%- if product -%}
  <!-- RecoAI Product Recommendation Widget -->
  <div class="recoai-recommendations" style="margin: 2rem 0;">
    <div id="recoai-widget"
      data-store="${storeId}"
      data-product-id="{{ product.id }}"
      data-type="${widgetType}"
      data-theme="${theme}">
    </div>
  </div>
  <script src="https://cdn.recoai.io/widget.js" async></script>
{%- endif -%}`
}

export function truncate(str, length = 50) {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
