from flask import Blueprint, request, jsonify
from database.db import db
from models import Product, Store

bp = Blueprint("products", __name__, url_prefix="/api/products")


def _get_store_or_404(store_id):
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return None, jsonify({"error": f"Store '{store_id}' not found."}), 404
    return store, None, None


@bp.get("/")
def list_products():
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id query param required"}), 400

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    category = request.args.get("category")
    search = request.args.get("q")
    status = request.args.get("status", "active")

    query = Product.query.filter_by(store_id=store_id)
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    pagination = query.order_by(Product.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "products": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages,
        "per_page": per_page,
    })


@bp.get("/<int:product_id>")
def get_product(product_id):
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id query param required"}), 400

    product = Product.query.filter_by(id=product_id, store_id=store_id).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product.to_dict())


@bp.post("/")
def create_product():
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    # Ensure store exists
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        store = Store(store_id=store_id, name=store_id)
        db.session.add(store)

    product = Product(
        store_id=store_id,
        name=data.get("name", "Untitled"),
        description=data.get("description"),
        category=data.get("category"),
        price=data.get("price"),
        image_url=data.get("image_url"),
        product_url=data.get("product_url"),
        tags=",".join(data["tags"]) if isinstance(data.get("tags"), list) else data.get("tags"),
        rating=data.get("rating"),
        review_count=data.get("review_count", 0),
        stock=data.get("stock", 0),
        status=data.get("status", "active"),
        external_id=data.get("external_id"),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@bp.put("/<int:product_id>")
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id") or request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    product = Product.query.filter_by(id=product_id, store_id=store_id).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    updatable = ["name", "description", "category", "price", "image_url", "product_url",
                 "rating", "review_count", "stock", "status", "external_id"]
    for field in updatable:
        if field in data:
            setattr(product, field, data[field])
    if "tags" in data:
        product.tags = ",".join(data["tags"]) if isinstance(data["tags"], list) else data["tags"]

    db.session.commit()
    return jsonify(product.to_dict())


@bp.delete("/<int:product_id>")
def delete_product(product_id):
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    product = Product.query.filter_by(id=product_id, store_id=store_id).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"deleted": product_id})


@bp.get("/categories")
def list_categories():
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    rows = (
        db.session.query(Product.category)
        .filter_by(store_id=store_id, status="active")
        .distinct()
        .all()
    )
    return jsonify({"categories": [r[0] for r in rows if r[0]]})
