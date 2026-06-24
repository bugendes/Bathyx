#!/usr/bin/env python3
"""Bathyx — nocache dev server (for local static asset serving)"""
import http.server
import functools
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Disable caching for local development."""

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    directory = sys.argv[2] if len(sys.argv) > 2 else 'build'
    handler = functools.partial(NoCacheHandler, directory=directory)
    with http.server.HTTPServer(('0.0.0.0', port), handler) as httpd:
        print(f'Serving {directory} on http://0.0.0.0:{port} (no-cache)')
        httpd.serve_forever()


if __name__ == '__main__':
    main()
