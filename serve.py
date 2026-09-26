import http.server
import socketserver
import os
import mimetypes
import re
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

class RangeRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Concise logging to keep server responsive
        sys.stdout.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]}\n")
        sys.stdout.flush()

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            parts = self.path.split('?')
            if not parts[0].endswith('/'):
                self.send_response(http.server.HTTPStatus.MOVED_PERMANENTLY)
                new_parts = (parts[0] + '/',) + tuple(parts[1:])
                self.send_header("Location", "?".join(new_parts))
                self.end_headers()
                return None
            for index in "index.html", "index.htm":
                index_path = os.path.join(path, index)
                if os.path.exists(index_path):
                    path = index_path
                    break

        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(http.server.HTTPStatus.NOT_FOUND, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total_len = fs[6]

        range_header = self.headers.get('Range')
        if range_header:
            m = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if m:
                first = int(m.group(1))
                last = int(m.group(2)) if m.group(2) else total_len - 1
                if first >= total_len:
                    self.send_error(http.server.HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    f.close()
                    return None
                length = last - first + 1
                self.send_response(http.server.HTTPStatus.PARTIAL_CONTENT)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Range", f"bytes {first}-{last}/{total_len}")
                self.send_header("Content-Length", str(length))
                self.end_headers()
                f.seek(first)
                return f

        self.send_response(http.server.HTTPStatus.OK)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(total_len))
        self.end_headers()
        return f

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass

if __name__ == '__main__':
    with ThreadingHTTPServer(('0.0.0.0', PORT), RangeRequestHandler) as httpd:
        print(f"Multi-threaded server active at http://localhost:{PORT} and http://127.0.0.1:{PORT}", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
