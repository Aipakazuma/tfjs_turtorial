from flask import Flask, render_template, \
    request as flask_request, Blueprint
from flask_cors import CORS
import ssl
import requests
import os
import json
import base64


model_app = Blueprint('mobilenet',
    __name__,
    static_url_path='/mobilenet',
    static_folder='./mobilenet'
)


app = Flask(__name__)
app.register_blueprint(model_app)
CORS(app)

context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
context.load_cert_chain('server.crt', 'server.key')


@app.route('/')
def index():
    return 'hello, world!!'


@app.route('/get_image', methods=['POST'])
def get_image():
    req = json.loads(flask_request.data.decode('utf8'))
    print(req, 'test')
    url = req['url']
    img = download_image(url)

    res = {}
    res['img'] = base64.b64encode(img).decode('utf8')
    return json.dumps(res)


def download_image(url, timeout=10):
    response = requests.get(url, allow_redirects=False, timeout=timeout)
    if response.status_code != 200:
        e = Exception('HTTP status: ' + response.status_code)
        raise e

    content_type = response.headers['content-type']
    if 'image' not in content_type:
        e = Exception('Content-Type: ' + content_type)
        raise e

    return response.content


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000,
      ssl_context=context,
      threaded=True,
      debug=True)
