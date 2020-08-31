from flask import Flask,jsonify,request
app = Flask(__name__)




@app.route('/v1/process')
def process():
    """
    This is a callback from sms.ir
    """
    
    message = request.args.get('text')
    sender = request.args.get('from') 
    print(f'received {message} from {sender}')
    data = {"message":"processed"}
    return jsonify(data), 200

def sendsms():
    pass

def check_serial():
    pass

if __name__ == "__main__":
    app.run("0.0.0.0",5000,debug=True)
