# backend/app.py
from flask import Flask, render_template, jsonify, request
from pony.orm import db_session, select
from backend.database import Product, Log
from datetime import datetime, timedelta
from decimal import Decimal
from werkzeug.utils import secure_filename
import os

IMAGE_FOLDER = './frontend/static/images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_app():
    app = Flask(
        __name__,
        template_folder ='./frontend/templates',
        static_folder = './frontend/static'
    )

    app.config['IMAGE_FOLDER'] = IMAGE_FOLDER
    return app

app = create_app()

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/inventar')
@db_session
def inventar():
    products = select(p for p in Product)[:]
    return render_template('inventar.html', products=products)

@app.route('/proizvodi')
@db_session
def proizvodi():
    products = select(p for p in Product)[:]
    return render_template('proizvodi.html', products=products)

@app.route('/evidencija')
@db_session
def evidencija():
    logs = Log.select().order_by(Log.timestamp.desc())
    return render_template('evidencija.html', logs=logs)

@app.route('/statistika')
@db_session
def statistika():
    return render_template('statistika.html')

### Funkcionalnosti inventar stranice
# Ažuriranje inventara

@app.route('/update_inventory', methods=['PATCH'])
@db_session
def update_inventory():
    data = request.json
    new_quantity = int(data['quantity'])

    product = Product.get(id=data['id'])
    if product:
        old_quantity = product.quantity
        quantity_change = new_quantity - old_quantity  # Calculate the difference
        if quantity_change > 0:
            net_gain = -(quantity_change * product.cost_price)
        elif quantity_change == 0:
            return jsonify({'success': True})
        else:
            net_gain = -(quantity_change * product.selling_price)

        # Spremi izvještaj promjene
        Log(
            product=product,
            old_quantity=old_quantity,
            new_quantity=new_quantity,
            quantity_change=quantity_change,
            net_gain=net_gain,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        # Ažuriraj količinu proizvoda
        product.quantity = new_quantity

        return jsonify({'success': True})

    return jsonify({'success': False}), 404

### Funkcionalnosti proizvodi stranice
# Dodaj novi proizvod

@app.route('/add_product', methods=['POST'])
@db_session
def add_product():
    name = request.form['name'].strip()

    # Provjeri da li proizvod sa istim imenom već postoji (case insensitive)
    existing_product = Product.get(name=name)
    if existing_product:
        return jsonify({"error": f"A product with the name '{name}' already exists."}), 400

    name = request.form['name']
    cost_price = Decimal(request.form['cost_price'])
    selling_price = Decimal(request.form['selling_price'])
    image_url = request.form['productImageURL']
    image_file = request.files.get('uploadProductImage')

    if image_url == '' and image_file.filename == '':
        image_url = 'https://via.placeholder.com/200x200'

    if image_file.filename != '' and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        image_file.save(os.path.join(app.config['IMAGE_FOLDER'], filename))
        image_url = f"../static/images/{filename}"

    Product(
        name=name,
        cost_price=cost_price,
        selling_price=selling_price,
        image_url=image_url
    )
    return jsonify({'success': True})


# Dohvati podatke proizvoda iz baze

@app.route('/get_product/<int:product_id>', methods=['GET'])
@db_session
def get_product(product_id):
    product = Product.get(id=product_id)
    if product:
        return jsonify({
            'id': product.id,
            'name': product.name,
            'cost_price': str(product.cost_price),
            'selling_price': str(product.selling_price),
            'quantity': product.quantity,
            'image_url': product.image_url
        })
    return jsonify({'error': 'Product not found'}), 404

#Ažuriraj proizvod u bazi

@app.route('/update_product/<int:product_id>', methods=['PATCH'])
@db_session
def update_product(product_id):
    product = Product.get(id=product_id)
    name = request.form['name'].strip()

    # Provjeri da li proizvod sa istim imenom već postoji (case insensitive)
    existing_product = select(p for p in Product if p.name == name and p.id != product_id).first()
    if existing_product:
        return jsonify({"error": f"A product with the name '{name}' already exists."}), 400

    if product:
        product.name = request.form['name']
        product.cost_price = Decimal(request.form['cost_price'])
        product.selling_price = Decimal(request.form['selling_price'])
        image_url = request.form['productImageURL']
        image_file = request.files.get('uploadProductImage')

        if image_url == '' and image_file.filename == '':
            product.image_url = 'https://via.placeholder.com/200x200'

        elif image_file.filename != '' and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            image_file.save(os.path.join(app.config['IMAGE_FOLDER'], filename))
            product.image_url = f"../static/images/{filename}"

        else:
            product.image_url = image_url

        return jsonify({'success': True})

    return jsonify({'success': False}), 404

#Izbriši proizvod iz baze

@app.route('/delete_product/<int:product_id>', methods=['DELETE'])
@db_session
def delete_product(product_id):
    product = Product.get(id=product_id)
    if product:
        product.delete()
        return jsonify({'success': True})
    return jsonify({'success': False}), 404

### Generiranje grafikona
# Filtriranje podataka po vremenskom rasponu
def filter_logs_by_time(time_range):
    now = datetime.now()
    if time_range == '30_days':
        return now - timedelta(days=30)
    elif time_range == '7_days':
        return now - timedelta(days=7)
    elif time_range == '1_day':
        return now - timedelta(days=1)
    elif time_range == '1_hour':
        return now - timedelta(hours=1)
    return None  # For 'all_time', no filter is needed

# Dohvati podatke za analizu i grafikon
@app.route('/get_chart_data')
@db_session
def get_chart_data():
    chart_type = request.args.get('chart_type')
    time_range = request.args.get('time_range')

    # Filter logs based on time range
    time_filter = filter_logs_by_time(time_range)
    if time_filter:
        logs = select(l for l in Log if l.timestamp >= time_filter)
    else:
        logs = select(l for l in Log)

    labels = []
    data = []

    if chart_type == 'profit_per_unit':
        products = select(p for p in Product)
        for product in products:
            labels.append(product.name)
            if product.selling_price and product.cost_price:
                data.append(float(product.selling_price - product.cost_price))
            else:
                data.append(0)

    elif chart_type == 'overall_profit':
        products = select(p for p in Product)
        for product in products:
            gain = sum(log.net_gain for log in logs if log.product == product)
            total_profit = gain if gain > 0 else 0
            labels.append(product.name)
            data.append(float(total_profit))

    elif chart_type == 'quantity_sold':
        products = select(p for p in Product)
        for product in products:
            total_sold = sum(-log.quantity_change for log in logs if log.product == product and log.quantity_change < 0)
            labels.append(product.name)
            data.append(total_sold)

    return jsonify({"labels": labels, "data": data})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
