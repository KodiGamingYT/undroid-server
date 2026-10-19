import sys, time, subprocess
import socketio

VM_NAME = "Galaxy Note 10+"
VDO_URL = "https://vdo.ninja/?view=Maszyna1_Stream&autoplay=1&mute=1"
RENDER_URL = "https://undroid-server.onrender.com"

SCREEN_WIDTH = 1080
SCREEN_HEIGHT = 2280

sio = socketio.Client()

@sio.event
def connect():
    # Zgłaszamy się jako 'android'
    sio.emit('register_vm', {'name': VM_NAME, 'video_url': VDO_URL, 'os': 'android'})
    print("✅ Połączono jako Android!")

@sio.on('absolute_input')
def on_absolute_input(data):
    action = data.get('action')
    rel_x = data.get('x', 0.5)
    rel_y = data.get('y', 0.5)
    
    if action == 'tap':
        # Przeliczamy procenty na prawdziwe piksele Note 10+
        target_x = int(rel_x * SCREEN_WIDTH)
        target_y = int(rel_y * SCREEN_HEIGHT)
        subprocess.Popen(["adb", "shell", f"input tap {target_x} {target_y}"])
        print(f"👆 Dotyk w X:{target_x} Y:{target_y}")

while True:
    try:
        sio.connect(RENDER_URL)
        sio.wait() 
    except Exception as e:
        time.sleep(3)