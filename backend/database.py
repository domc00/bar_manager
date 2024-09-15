# backend/database.py
from pony.orm import Database, Required, Optional, Set, db_session
from datetime import datetime
from decimal import Decimal

# Inicijalizacija baze podataka
db = Database()

# Definicija modela
class Product(db.Entity):
    name = Required(str)
    cost_price = Required(Decimal)
    selling_price = Required(Decimal)
    quantity = Required(int, default=0)
    image_url = Optional(str, default='https://via.placeholder.com/200x200')  # Store URL/path to product image
    logs = Set('Log')

class Log(db.Entity):
    product = Required(Product)  # Foreign key reference to the Product table
    old_quantity = Required(int)
    new_quantity = Required(int)
    quantity_change = Required(int)  # Positive if bought, negative if sold
    net_gain = Required(Decimal)
    timestamp = Required(datetime)

# Vezanje baze za sqlite
db.bind(provider='sqlite', filename='database.sqlite', create_db=True)

# Generiranje mapiranja i stvaranje tablica
db.generate_mapping(create_tables=True)