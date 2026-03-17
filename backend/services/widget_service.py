"""
Widget service.

Responsibilities:
  1. Generate a unique widget_token for each store.
  2. Build embed code (script tag, iframe, Shopify Liquid).
  3. Render the standalone HTML widget page that is served inside the iframe.
"""

import secrets
import os
from urllib.parse import quote

from database.db import db
from models import WidgetConfig


def get_or_create_widget(store_id: str) -> WidgetConfig:
    config = WidgetConfig.query.filter_by(store_id=store_id).first()
    if not config:
        config = WidgetConfig(
            store_id=store_id,
            widget_token=secrets.token_urlsafe(32),
        )
        db.session.add(config)
        db.session.commit()
    return config


def update_widget_config(store_id: str, updates: dict) -> WidgetConfig:
    config = get_or_create_widget(store_id)
    allowed = {"widget_type", "theme", "max_items", "title", "primary_color", "engine_preference"}
    for key, val in updates.items():
        if key in allowed:
            setattr(config, key, val)
    db.session.commit()
    return config


def generate_embed_codes(store_id: str, product_id: int = None) -> dict:
    config = get_or_create_widget(store_id)
    base_url = os.getenv("WIDGET_BASE_URL", "http://localhost:5000")
    token = config.widget_token

    # Build URL with all appearance params so the embedded widget always
    # matches the current dashboard configuration.
    color_encoded = quote(config.primary_color or "#8b5cf6", safe="")
    params = (
        f"?theme={config.theme}"
        f"&type={config.widget_type}"
        f"&max_items={config.max_items}"
        f"&primary_color={color_encoded}"
    )
    if product_id:
        params += f"&product_id={product_id}"

    widget_url      = f"{base_url}/widget/{token}{params}"
    widget_base_url = f"{base_url}/widget/{token}"   # no params — for client-side code generation

    # Auto-resize snippet (listens for postMessage from the widget iframe)
    resize_listener = """
    window.addEventListener('message', function(e) {
      if (e.data && e.data.recoai_height) {
        iframe.style.height = e.data.recoai_height + 'px';
      }
    });"""

    script_tag = f"""<!-- RecoAI Widget -->
<div id="recoai-widget"></div>
<script>
  (function() {{
    var iframe = document.createElement('iframe');
    iframe.src = '{widget_url}';
    iframe.style.cssText = 'width:100%;border:none;min-height:340px;display:block';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'RecoAI Recommendations');
    document.getElementById('recoai-widget').appendChild(iframe);{resize_listener}
  }})();
</script>"""

    iframe_tag = (
        f'<iframe src="{widget_url}" '
        f'style="width:100%;border:none;min-height:340px;display:block" '
        f'scrolling="no" frameborder="0" '
        f'title="RecoAI Recommendations"></iframe>'
    )

    liquid_code = f"""{{% comment %}} RecoAI Widget — paste on your product page for personalised recommendations {{% endcomment %}}
<div id="recoai-widget"></div>
<script>
  (function() {{
    var iframe = document.createElement('iframe');
    iframe.src = '{widget_url}&product_id={{{{ product.id }}}}';
    iframe.style.cssText = 'width:100%;border:none;min-height:340px;display:block';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'RecoAI Recommendations');
    document.getElementById('recoai-widget').appendChild(iframe);{resize_listener}
  }})();
</script>"""

    return {
        "widget_url":      widget_url,
        "widget_base_url": widget_base_url,
        "widget_token":    token,
        "script_tag":      script_tag,
        "iframe_tag":      iframe_tag,
        "liquid_code":     liquid_code,
        "config":          config.to_dict(),
    }
