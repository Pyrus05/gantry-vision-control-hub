
# Raspberry Pi Setup Instructions

Follow these steps to set up the Gantry Vision Control Hub on your Raspberry Pi 4.

## 1. Install Required Packages

```bash
sudo apt update
sudo apt install -y python3-pip python3-picamera2 python3-opencv python3-flask git nodejs npm

# Install Python dependencies
pip3 install pyserial opencv-python numpy flask
```

## 2. Clone or Download the Project

```bash
cd ~
git clone <your-repository-url> gantry-vision-control-hub
cd gantry-vision-control-hub
```

## 3. Build the React App

```bash
npm install
npm run build
```

## 4. Set Up the API Server

Make the API server executable:

```bash
chmod +x src/server/api_server.py
```

## 5. Setup Auto-Start Service

```bash
sudo cp src/server/gantry-control.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gantry-control
sudo systemctl start gantry-control
```

To check if the service is running correctly:

```bash
sudo systemctl status gantry-control
```

## 6. Access the Control Hub

Open a web browser on any device connected to the same network as your Raspberry Pi and navigate to:

```
http://[raspberry-pi-ip-address]:5000
```

Where `[raspberry-pi-ip-address]` is the IP address of your Raspberry Pi.

You can find your Pi's IP address by running:

```bash
hostname -I
```

## Troubleshooting

### Camera Issues

If the camera feed is not working, check that:

1. The PiCamera is properly connected
2. The camera is enabled in `raspi-config`:

```bash
sudo raspi-config
# Navigate to: Interface Options > Camera > Enable
```

### Serial Port Issues

If you're having trouble connecting to the serial port:

1. Make sure your user has permission to access serial devices:

```bash
sudo usermod -a -G dialout $USER
# Then log out and log back in
```

2. Check that your device is actually at `/dev/ttyUSB0`:

```bash
ls -l /dev/ttyUSB*
```

If it's at a different location, update the port in the web interface.

### Auto-Alignment Not Working

If auto-alignment is not detecting circles:

1. Adjust lighting to improve contrast
2. You may need to modify the parameters in the `api_server.py` file to adjust the Hough Circles detection parameters for your specific setup.
