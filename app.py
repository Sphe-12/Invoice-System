from flask import Flask

app = Flask(__name__)

# Import blueprints
from app.auth.routes import auth
from app.dashboard.routes import dashboard
from app.invoice.routes import invoice

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(dashboard)
app.register_blueprint(invoice)

if __name__ == '__main__':
    app.run(debug=True)