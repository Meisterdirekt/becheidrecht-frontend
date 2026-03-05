#!/bin/bash
# Cursor 2.5.20 Installation
set -e
echo "1. Kopiere Paket..."
cp "/home/henne1990/Downloads/cursor_2.5.20_amd64(1).deb" /tmp/cursor_2.5.20_amd64.deb
echo "2. Installiere Cursor 2.5..."
sudo dpkg -i /tmp/cursor_2.5.20_amd64.deb
echo "3. Prüfe Abhängigkeiten..."
sudo apt-get install -f -y
echo "Fertig! Cursor neu starten."
