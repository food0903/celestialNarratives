from flask import Flask, jsonify, request, redirect, url_for, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_socketio import SocketIO, send, emit
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Retrieve database credentials from environment variables
DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
SECRET_KEY = os.getenv('SECRET_KEY')

# URL-encode the password
from urllib.parse import quote_plus
DB_PASSWORD_ENCODED = quote_plus(DB_PASSWORD)

# Create the database URI
DATABASE_URI = f'mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD_ENCODED}@{DB_HOST}/{DB_NAME}'

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = SECRET_KEY

# Configure session cookie settings
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # or 'Strict' depending on your requirements

# Allow CORS for all domains on all routes
CORS(app, supports_credentials=True)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
socketio = SocketIO(app, cors_allowed_origins="*")


# Define the User model
class User(db.Model):
    __tablename__ = 'users'  # This should match your table name
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=True)
    password = db.Column(db.String(60), nullable=False)
    name = db.Column(db.String(50))
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.room_id'), nullable=True)

    def set_password(self, pw):
        self.password = bcrypt.generate_password_hash(pw).decode('utf8')

    def check_password(self, pw):
        return bcrypt.check_password_hash(self.password, pw)
    
    # Required methods and properties for Flask-Login
    @property
    def is_authenticated(self):
        return True  # Assuming all users are authenticated

    @property
    def is_active(self):
        return True  # Assuming all accounts are active

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)
    

class Room(db.Model):
    __tablename__ = 'rooms'
    room_id = db.Column(db.Integer, primary_key=True)
    room_name = db.Column(db.String(255), nullable=False)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    num_players = db.Column(db.Integer, nullable=False, default=0)
    max_players = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='waiting')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

    host = db.relationship('User', backref='hosted_rooms', foreign_keys=[host_id])
    users = db.relationship('User', backref='room', foreign_keys=[User.room_id])


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
@login_required
def index():
    try:
        # Fetch all users from the database
        users = User.query.all()
        user_list = [{"id": user.id, "username": user.username, "name": user.name} for user in users]
        return jsonify(user_list)
    except Exception as e:
        return str(e)

@app.route('/register', methods=['POST'])
def register():
    if request.is_json:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')

        if not (username and password and name):
            return jsonify({"error": "Username, password, and name are required"}), 400

        # Check if username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 409  

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password=hashed_password, name=name, room_id=None)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)
        print(new_user.id, new_user.username, new_user.name)
        
        response = jsonify({
            "message": "User registered and logged in successfully",
            "user": {  # This is the correct placement of the user object
                "id": new_user.id,
                "username": new_user.username,
                "name": new_user.name
            }
        })
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 201
    else:
        return jsonify({"error": "Request body must be JSON"}), 400


@app.route('/login', methods=['POST'])
def login():
    if request.is_json:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            response = jsonify({
                "message": "Login successful",
                "user":{
                    "id": user.id,
                    "username": user.username,
                    "name": user.name
                }
            })
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 200
        return jsonify({"message": "Invalid credentials"}), 401
    else:
        return jsonify({"message": "Request body must be JSON"}), 400
    
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    response = jsonify({"message": "Logout successful"})
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200


@app.route('/create_room', methods=['POST'])
def create_room():
    data = request.get_json()
    room_name = data.get('room_name')
    host_id = data.get('host_id')
    max_players = data.get('max_players')

    if not room_name or not max_players:
        return jsonify({'message': 'Room name and max players are required'}), 400
    
    new_room = Room(room_name=room_name, host_id=host_id, max_players=max_players, num_players=1)
    db.session.add(new_room)
    db.session.commit()
    user = User.query.get(host_id)
    user.room_id = new_room.room_id
    db.session.commit()

    return jsonify({'message': 'Room created successfully'}), 201

@app.route('/join_room', methods=['POST'])
def join_room():
    data = request.get_json()
    user_id = data.get('user_id')
    room_id = data.get('room_id')

    try:
        user = User.query.get(user_id)
        if user.room_id:
            return jsonify({'message': 'User already in a room',
                            'error': 'user already in room'}), 400
        user.room_id = room_id
        room = Room.query.get(room_id)
        if room.max_players == room.num_players:
            return jsonify({'message': 'Room is full',
                            'error': 'room is full'}), 400
        room.num_players += 1
        db.session.commit()
        return jsonify({'message': 'Joined room successfully', 'room_id': room_id}), 200
    except Exception as error:  # Corrected syntax from `catch` to `except`
        return jsonify({'message': 'Error joining room', 'error': str(error)}), 400
    
@app.route('/leave_room', methods=['POST'])
def leave_room():
    data = request.get_json()
    user_id = data.get('user_id')
    room_id = data.get('room_id')

    try:
        user = User.query.get(user_id)
        user.room_id = None
        room = Room.query.get(room_id)
        room.num_players -= 1
        db.session.commit()
        return jsonify({'message': 'Left room successfully', 'room_id': room_id}), 200
    except Exception as error:
        return jsonify({'message': 'Error leaving room', 'error': str(error)}), 400
 

@socketio.on('get_rooms')
def get_rooms():
    rooms = Room.query.all()
    rooms_list =[]
    for room in rooms:
        room_data = {
            'room_id': room.room_id,
            'room_name': room.room_name,
            'host_id': room.host_id,
            'num_players': room.num_players,
            'max_players': room.max_players,
            'status': room.status,
            'created_at': room.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        rooms_list.append(room_data)
    emit('rooms_data', rooms_list)

@socketio.on('fetch_room_users')
def fetch_room_users():
    room_id = request.args.get('room_id')
    users = User.query.filter_by(room_id=room_id).all()
    users_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'name': user.name
        }
        users_list.append(user_data)
    emit('room_users', users_list)



# SocketIO
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('message', 'Connected to the server')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(msg):
    print('Message:', msg)
    send(msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)

