from flask import Flask,jsonify,request
app = Flask(__name__)




@app.route('/v1/process')
def process():
    text = request.args.get('text')
    print(text)
    data = {"message":"ok",
            "text":text}
    return jsonify(data), 200

def sendsms():
    pass

def check_serial():
    pass

if __name__ == "__main__":
    app.run("0.0.0.0",5000,debug=True)
