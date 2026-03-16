# RecoAI Widget Embed Guide

## Overview

RecoAI now supports **3 different embedding methods** to fit any use case:

1. **Script Tag** — Recommended for most users
2. **iFrame Embed** — Self-contained & sandbox-safe
3. **Liquid Code** — For Shopify theme developers

---

## 1. Script Tag Embed (Recommended)

The easiest way to add recommendations to any website.

### Features
- ✅ Works on any HTML/CSS framework
- ✅ Direct styling integration
- ✅ Customizable via data attributes
- ✅ Best for: WordPress, custom HTML, landing pages

### How to Use

```html
<!-- RecoAI Widget - carousel -->
<div id="recoai-widget"
  data-store="store_abc123xyz"
  data-type="carousel"
  data-theme="dark">
</div>
<script src="https://cdn.recoai.io/widget.js" async></script>
```

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-store` | `string` | Your unique store ID |
| `data-type` | `carousel`, `grid`, `list` | Widget layout type |
| `data-theme` | `dark`, `light` | Color scheme |

### Example: Grid Layout with Light Theme

```html
<div id="recoai-widget"
  data-store="store_abc123xyz"
  data-type="grid"
  data-theme="light">
</div>
<script src="https://cdn.recoai.io/widget.js" async></script>
```

---

## 2. iFrame Embed

Self-contained embed that won't affect your site's styling. Great for maximum compatibility.

### Features
- ✅ Completely isolated from site styling
- ✅ No CSS conflicts
- ✅ Safe sandbox environment
- ✅ Best for: Shopify, Wix, Squarespace, hosted platforms

### How to Use

```html
<!-- RecoAI Embedded Widget (iframe) -->
<iframe
  src="https://widget.recoai.io/embed?storeId=store_abc123xyz&type=carousel&theme=dark"
  width="100%"
  height="400"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 8px;"
  title="RecoAI Recommendations">
</iframe>
```

### Query Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `storeId` | `string` | Required | Your unique store ID |
| `type` | `carousel`, `grid`, `list` | `carousel` | Widget layout type |
| `theme` | `dark`, `light` | `dark` | Color scheme |

### Adjust Height

```html
<!-- 300px height -->
<iframe ... height="300" ...></iframe>

<!-- 500px height for larger displays -->
<iframe ... height="500" ...></iframe>
```

### For Shopify: Add to Product Page

In your Shopify theme editor:

1. Go to **Online Store > Themes > Edit Code**
2. Find `product-template.liquid` or `product.json`
3. Add this code where you want recommendations:

```html
<div class="product-recommendations" style="margin: 2rem 0;">
  <iframe
    src="https://widget.recoai.io/embed?storeId=store_abc123xyz&type=carousel&theme=dark"
    width="100%"
    height="400"
    frameborder="0"
    scrolling="no"
    style="border: none; border-radius: 8px;"
    title="RecoAI Recommendations">
  </iframe>
</div>
```

---

## 3. Liquid Code (Shopify Theme Developers)

Advanced option for custom Shopify theme integration. Automatically detects product context.

### Features
- ✅ Native Shopify Liquid support
- ✅ Automatic product ID detection
- ✅ Only shows on product pages
- ✅ Best for: Custom theme development

### How to Use

```liquid
{%- if product -%}
  <!-- RecoAI Product Recommendation Widget -->
  <div class="recoai-recommendations" style="margin: 2rem 0;">
    <div id="recoai-widget"
      data-store="store_abc123xyz"
      data-product-id="{{ product.id }}"
      data-type="carousel"
      data-theme="dark">
    </div>
  </div>
  <script src="https://cdn.recoai.io/widget.js" async></script>
{%- endif -%}
```

### What This Does

- ✅ Checks if viewing a product page
- ✅ Auto-passes current product ID
- ✅ Shows widget only on product pages
- ✅ Hides on collection/home pages

### Customizing

```liquid
{%- if product -%}
  <div id="recoai-widget"
    data-store="store_abc123xyz"
    data-product-id="{{ product.id }}"
    data-type="grid"
    data-theme="light">
  </div>
  <script src="https://cdn.recoai.io/widget.js" async></script>
{%- endif -%}
```

---

## Choosing the Right Method

### Use Script Tag if:
- ✅ You want direct styling integration
- ✅ You're on WordPress/custom HTML site
- ✅ You want full CSS customization
- ✅ You need maximum flexibility

### Use iFrame if:
- ✅ You're on Shopify/Wix/Squarespace
- ✅ You want zero styling conflicts
- ✅ You want plug-and-play simplicity
- ✅ You don't need to customize CSS

### Use Liquid if:
- ✅ You're building a custom Shopify theme
- ✅ You want automatic product detection
- ✅ You need advanced developer control
- ✅ You want conditional rendering

---

## Troubleshooting

### Widget Not Showing?

1. **Check Store ID** — Make sure `storeId` is correct
2. **Check Browser Console** — Look for errors
3. **Check CORS** — iFrame needs correct origin
4. **Check Async Loading** — Script may not be loaded yet
5. **Check Theme** — Verify theme value is `dark` or `light`

### Styling Issues?

**With Script Tag:**
```css
/* Add custom styles */
#recoai-widget {
  max-width: 100%;
  margin: 2rem 0;
}
```

**With iFrame:**
- iFrame isolates all styling
- Adjust `height` attribute
- Adjust `width` (typically `100%`)

### Mobile Issues?

```html
<!-- Responsive iFrame -->
<iframe
  src="..."
  width="100%"
  height="400"
  style="border: none; border-radius: 8px; max-width: 100%;">
</iframe>
```

---

## Support

- 📧 Email: support@recoai.io
- 💬 Discord: [Join Community](https://discord.gg/recoai)
- 📖 Docs: [recoai.io/docs](https://recoai.io/docs)

---

**Ready to get started? Go to `/dashboard/embed` to generate your unique embed codes!**
