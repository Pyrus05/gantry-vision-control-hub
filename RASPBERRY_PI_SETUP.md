
# Raspberry Pi Setup Instructions

Follow these steps to set up the Gantry Vision Control Hub on your Raspberry Pi 4.

## Prerequisites
- Raspberry Pi 4 with Raspberry Pi OS installed
- PiCamera module connected and enabled
- USB-connected gantry controller (GRBL)
- Network connection to access the Pi

## 1. Initial Setup

Update your system first:
```bash
sudo apt update
sudo apt upgrade -y
```

Install required packages:
```bash
# System packages
sudo apt install -y python3-pip python3-picamera2 python3-opencv git nodejs npm

# Python dependencies
pip3 install pyserial opencv-python numpy flask
```

## 2. Project Installation

```bash
# Clone the repository
cd ~
git clone <your-repository-url> gantry-vision-control-hub
cd gantry-vision-control-hub

# Install Node.js dependencies and build
npm install
npm run build
```

## 3. Configure Serial Port Access

```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Reboot for changes to take effect
sudo reboot
```

## 4. Set Up the API Server

There are three ways to set up the service file. Try Method 1 first, and if you encounter permission issues, use Method 2 or 3.

### Method 1: Direct Copy

Important: Make sure to use a space between the source and destination paths in the cp command!

```bash
# Make server executable
chmod +x src/server/api_server.py

# Setup service
# NOTE: Check the correct filename - it should be gantry-control.service (with a hyphen)
sudo cp src/server/gantry-control.service /etc/systemd/system/
# OR if your file is named gantry_control.service (with an underscore)
# sudo cp src/server/gantry_control.service /etc/systemd/system/gantry-control.service

sudo systemctl daemon-reload
sudo systemctl enable gantry-control
sudo systemctl start gantry-control
```

### Method 2: Create Service File Manually

If you encounter permission issues with the copy command, create the service file manually:

```bash
# Make server executable
chmod +x src/server/api_server.py

# Create service file with nano
sudo nano /etc/systemd/system/gantry-control.service
```

Then paste the following content (press Ctrl+Shift+V to paste in the terminal):

```
[Unit]
Description=Gantry Control API Server
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/gantry-vision-control-hub
ExecStart=/usr/bin/python3 /home/pi/gantry-vision-control-hub/src/server/api_server.py
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=gantry-control

[Install]
WantedBy=multi-user.target
```

Save and exit by pressing Ctrl+X, then Y, then Enter. Then continue with:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gantry-control
sudo systemctl start gantry-control
```

### Method 3: Run Without Systemd

If you're still having issues with systemd, you can run the server directly:

```bash
# Make server executable
chmod +x src/server/api_server.py

# Run the server (in a screen session to keep it running)
sudo apt install screen
screen -S gantry
python3 src/server/api_server.py
```

To detach from the screen session, press Ctrl+A followed by D. 
To reattach later: `screen -r gantry`

## 5. Verify Installation

Check service status:
```bash
sudo systemctl status gantry-control
```

Find your Pi's IP address:
```bash
hostname -I
```

Access the web interface at:
```
http://<raspberry-pi-ip-address>:5000
```

## Troubleshooting

### Motion Control Issues

If the camera works but gantry motion does not:

1. Check serial port permissions:
```bash
ls -l /dev/ttyUSB*
# Should show something like: crw-rw---- 1 root dialout 188, 0 May 11 10:15 /dev/ttyUSB0
# The important part is that your user or the dialout group has rw (read-write) access
```

2. Verify your user is in the dialout group:
```bash
groups
# Should include 'dialout' in the list
```

3. If your user is not in the dialout group, add it:
```bash
sudo usermod -a -G dialout $USER
# Then log out and log back in, or reboot
```

4. Test serial communication manually:
```bash
# Install screen if not already installed
sudo apt install screen

# Try to communicate directly with the controller
screen /dev/ttyUSB0 115200
```
Then type: `M115` followed by Enter to get firmware info.
To exit screen, press Ctrl+A followed by backslash (\), then Y to confirm.

5. Check if the correct firmware is loaded on your controller:
```bash
# While connected with screen, send:
M115
# The response should identify the GRBL version or other controller info
```

6. Check for port conflicts:
```bash
sudo lsof | grep ttyUSB
# This shows if any other process is using the serial port
```

7. Try a different USB port on your Raspberry Pi.

8. Try a different USB cable.

### Camera Issues

If the camera feed is not working:

1. Enable camera in raspi-config:
```bash
sudo raspi-config
# Navigate to: Interface Options > Camera > Enable
```

2. Verify camera detection:
```bash
vcgencmd get_camera
# Should show: supported=1 detected=1
```

### Serial Port Issues

1. Add user to dialout group (if not done already):
```bash
sudo usermod -a -G dialout $USER
# Then log out and log back in
```

2. Check USB device:
```bash
ls -l /dev/ttyUSB*
```

3. If device is not at `/dev/ttyUSB0`, update the port in the web interface.

### Service Issues

1. Check service logs:
```bash
sudo journalctl -u gantry-control -f
```

2. Verify permissions:
```bash
sudo chown -R pi:pi /home/pi/gantry-vision-control-hub
```

## Usage Guide

1. Connect to web interface using any browser on your network
2. In the Connection Panel:
   - Set correct serial port (default: /dev/ttyUSB0)
   - Set baud rate (default: 115200)
   - Click Connect

3. Once connected:
   - Use Gantry Control panel for manual movement
   - Use Auto-Alignment for circle detection
   - Monitor status in Status Panel
   - View live camera feed

4. Maintenance commands:
```bash
# Restart service
sudo systemctl restart gantry-control

# View logs
sudo journalctl -u gantry-control -f

# Stop service
sudo systemctl stop gantry-control
```

## Security Considerations

1. Setup basic firewall:
```bash
sudo apt install ufw
sudo ufw allow 5000
sudo ufw enable
```

2. Keep system updated:
```bash
sudo apt update
sudo apt upgrade
```

For additional security:
- Consider implementing authentication
- Restrict access to specific IP addresses
- Use HTTPS for production environments

## Regular Maintenance

1. Update system packages weekly:
```bash
sudo apt update
sudo apt upgrade
```

2. Check logs periodically:
```bash
sudo journalctl -u gantry-control -n 100
```

3. Monitor disk space:
```bash
df -h
```

4. Backup your configuration regularly.
