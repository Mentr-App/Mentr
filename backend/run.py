from app import create_app
from app.extensions import socketio
import eventlet
import eventlet.wsgi

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8000)
