"""
Widget service.

Responsibilities:
  1. Generate a unique widget_token for each store.
  2. Build embed code (script tag, iframe, Shopify Liquid).
  3. Render the standalone HTML widget page that is served inside the iframe.
"""

import secrets
import os

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
    allowed = {"widget_type", "theme", "max_items", "title", "primary_color"}
    for key, val in updates.items():
        if key in allowed:
            setattr(config, key, val)
    db.session.commit()
    return config


def generate_embed_codes(store_id: str, product_id: int = None) -> dict:
    config = get_or_create_widget(store_id)
    base_url = os.getenv("WIDGET_BASE_URL", "http://localhost:5000")
    token = config.widget_token
    widget_type = config.widget_type
    theme = config.theme

    params = f"?theme={theme}&type={widget_type}"
    if product_id:
        params += f"&product_id={product_id}"

    widget_url = f"{base_url}/widget/{token}{params}"

    script_tag = f"""<!-- RecoAI Widget -->
<div id="recoai-widget"></div>
<script>
  (function() {{
    var el = document.getElementById('recoai-widget');
    var iframe = document.createElement('iframe');
    iframe.src = '{widget_url}';
    iframe.style.cssText = 'width:100%;border:none;min-height:320px;';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    el.appendChild(iframe);
  }})();
</script>"""

    iframe_tag = f'<iframe src="{widget_url}" style="width:100%;border:none;min-height:320px;" scrolling="no" frameborder="0"></iframe>'

    liquid_code = f"""{{% assign recoai_product = product.id %}}
<div id="recoai-widget"></div>
<script>
  (function() {{
    var el = document.getElementById('recoai-widget');
    var iframe = document.createElement('iframe');
    iframe.src = '{widget_url}&product_id={{{{ recoai_product }}}}';
    iframe.style.cssText = 'width:100%;border:none;min-height:320px;';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    el.appendChild(iframe);
  }})();
</script>"""

    return {
        "widget_url": widget_url,
        "widget_token": token,
        "script_tag": script_tag,
        "iframe_tag": iframe_tag,
        "liquid_code": liquid_code,
        "config": config.to_dict(),
    }
