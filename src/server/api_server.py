
#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_file
import subprocess
import os
import time
import threading
import io
import signal
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../../dist', static_url_path='/')

# Global variables
gantry_process = None
camera_process = None
port = '/dev/ttyUSB0'
baud_rate = '115200'
latest_image = None
latest_image_lock = threading.Lock()

def capture_camera():
    """Background thread to capture camera frames"""
    global latest_image
    
    try:
        from picamera2 import Picamera2
        import cv2
        import numpy as np

        picam2 = Picamera2()
        config = picam2.create_preview_configuration(main={"size": (1280, 720), "format": "RGB888"})
        picam2.configure(config)
        picam2.set_controls({"AfMode": 2, "AwbMode": 0})
        picam2.start()
        logger.info("Camera started successfully")

        while True:
            frame = picam2.capture_array()
            
            # Add crosshair
            h, w = frame.shape[:2]
            cv2.line(frame, (w//2 - 25, h//2), (w//2 + 25, h//2), (0, 255, 0), 1)
            cv2.line(frame, (w//2, h//2 - 25), (w//2, h//2 + 25), (0, 255, 0), 1)
            cv2.circle(frame, (w//2, h//2), 10, (0, 255, 0), 1)
            
            # Convert to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            image_bytes = buffer.tobytes()
            
            # Update latest_image with thread safety
            with latest_image_lock:
                latest_image = image_bytes
            
            time.sleep(0.05)  # 20 FPS
            
    except Exception as e:
        logger.error(f"Camera thread error: {str(e)}")

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/camera_feed')
def camera_feed():
    """Serve the latest camera image"""
    global latest_image
    
    with latest_image_lock:
        if latest_image is None:
            return jsonify({"error": "No camera feed available"}), 404
        
        img_io = io.BytesIO(latest_image)
        img_io.seek(0)
        
    return send_file(img_io, mimetype='image/jpeg')

@app.route('/api/start_gantry', methods=['POST'])
def start_gantry():
    """Start the gantry control script"""
    global gantry_process, camera_process, port, baud_rate
    
    try:
        data = request.json
        port = data.get('port', '/dev/ttyUSB0')
        baud_rate = data.get('baudRate', '115200')
        
        if gantry_process:
            return jsonify({"message": "Gantry process already running"}), 200
        
        # Start camera thread
        camera_thread = threading.Thread(target=capture_camera)
        camera_thread.daemon = True
        camera_thread.start()
        
        return jsonify({"message": "Gantry connected successfully"})
    
    except Exception as e:
        logger.error(f"Error starting gantry: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stop_gantry', methods=['POST'])
def stop_gantry():
    """Stop the gantry control script"""
    global gantry_process
    
    try:
        if gantry_process:
            gantry_process.terminate()
            gantry_process = None
        
        return jsonify({"message": "Gantry stopped successfully"})
    
    except Exception as e:
        logger.error(f"Error stopping gantry: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/send_gcode', methods=['POST'])
def send_gcode():
    """Send a G-code command to the gantry"""
    try:
        data = request.json
        command = data.get('command', '')
        
        if not command:
            return jsonify({"error": "No command provided"}), 400
        
        # Import serial here to avoid issues if not available
        import serial
        
        # Open serial connection
        ser = serial.Serial(port, int(baud_rate), timeout=1)
        time.sleep(0.1)
        
        # Send command
        ser.write((command.strip() + '\n').encode())
        
        # Read response
        response = ser.readline().decode().strip()
        ser.close()
        
        return jsonify({"message": "Command sent", "response": response})
    
    except Exception as e:
        logger.error(f"Error sending G-code: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/run_alignment', methods=['POST'])
def run_alignment():
    """Run the auto-alignment routine"""
    try:
        # Import modules needed for alignment
        import serial
        import cv2
        import numpy as np
        from picamera2 import Picamera2
        
        # Setup serial
        ser = serial.Serial(port, int(baud_rate), timeout=1)
        time.sleep(0.1)
        
        # Get camera frame
        with latest_image_lock:
            if latest_image is None:
                return jsonify({"error": "No camera feed available"}), 404
            
            # Convert bytes to opencv image
            nparr = np.frombuffer(latest_image, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process image to find circle
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 7)
        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1.2, 50,
                                param1=100, param2=45, minRadius=10, maxRadius=100)
        
        if circles is not None:
            circles = np.uint16(np.around(circles))
            x, y, r = circles[0, 0]  # First detected circle
            
            # Calculate offset from center
            h, w = frame.shape[:2]
            camera_center = (w // 2, h // 2)
            
            dx_px = x - camera_center[0]
            dy_px = camera_center[1] - y  # Inverted because camera Y is different from machine Y
            
            # Convert pixels to mm (approximate calibration, adjust as needed)
            mm_per_pixel = 0.01
            dx_mm = dx_px * mm_per_pixel
            dy_mm = dy_px * mm_per_pixel
            
            # Send correction command if needed
            tolerance_mm = 0.01
            if abs(dx_mm) <= tolerance_mm and abs(dy_mm) <= tolerance_mm:
                response = "Circle is already centered"
                # Move X+70mm as specified in your script
                ser.write(b"G1 X70 F1000\n")
            else:
                # Send correction command
                gcode_cmd = f"G1 X{dx_mm:.2f} Y{dy_mm:.2f} F1000"
                ser.write((gcode_cmd + '\n').encode())
                response = f"Alignment correction sent: {gcode_cmd}"
            
            ser.close()
            return jsonify({"message": response, "circle": {"x": int(x), "y": int(y), "r": int(r)}})
        else:
            ser.close()
            return jsonify({"error": "No circles detected in image"}), 400
    
    except Exception as e:
        logger.error(f"Error running alignment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    try:
        # Start the Flask app with low resource usage
        app.run(host='0.0.0.0', port=5000, threaded=True)
    except KeyboardInterrupt:
        if gantry_process:
            gantry_process.terminate()
        print("Server stopped")
