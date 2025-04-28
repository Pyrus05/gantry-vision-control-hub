
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

```bash
# Make server executable
chmod +x src/server/api_server.py

# Setup service
sudo cp src/server/gantry-control.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gantry-control
sudo systemctl start gantry-control
```

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

