#!/usr/bin/env python3
import http.server
import socketserver
import os

# Cambiar al directorio del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor corriendo en http://localhost:{PORT}")
    print(f"Directorio: {os.getcwd()}")
    httpd.serve_forever()
