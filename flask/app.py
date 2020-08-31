from flask import Flask,jsonify,request
from config import Sendtoken, LineNumber, DATABASE_FILE_PATH
from pandas import read_excel
import requests
import sqlite3
app = Flask(__name__)

sms_token = None


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

def get_token(apikey,secretkey):
    url = "https://RestfulSms.com/api/Token"
    header = {'Content-Type': 'application/json'}
    payload = {"UserApiKey": apikey,
               "SecretKey": secretkey}
    r = requests.post(url,data=payload)
    return(r.json()['TokenKey'])

def sendsms(sms_token,receptor,message):
        # sms_token = get_token(UserApiKey, SecretKey)
        url = "https://RestfulSms.com/api/MessageSend"
        header = {
            'x-sms-ir-secure-token':Sendtoken
        }
        payload = {
            "Messages": message,
            "MobileNumbers": receptor,
            "LineNumber": LineNumber,
            "SendDateTime": "",
            "CanContinueInCaseOfError": "false",
        }
        r = requests.post(url,headers=header,data=payload)
        print(r.json()["IsSuccessful"])



def import_database_from_exel(filepath):




    conn = sqlite3.connect(DATABASE_FILE_PATH)
    cur = conn.cursor()
    cur.execute('DROP TABLE IF EXISTS serials')
    cur.execute("""CREATE TABLE IF NOT EXISTS serials (
        id INTEGER PRIMARY KEY,
        ref TEXT,
        desc TEXT,
        start_serial TEXT,
        end_serial TEXT,
        date DATE);""")
        



    df = read_excel(filepath,0)
    serial_counter = 0
    for index,(line,ref,desc,start_serial,end_serial,date) in df.iterrows():
        query = f'INSERT INTO serials VALUES("{line}", "{ref}", "{desc}", "{start_serial}", "{end_serial}", "{date}");'
        cur.execute(query)
        if serial_counter % 10:
            conn.commit()
        serial_counter += 1
    conn.commit()

    cur.execute('DROP TABLE IF EXISTS invalids')
    cur.execute("""CREATE TABLE IF NOT EXISTS invalids (
        invalid_serial TEXT PRIMARY KEY)""")
    conn.commit()
    invalid_counter = 0
    df = read_excel(filepath, 1)
    for index, (failed_serial_row) in df.iterrows():
        failed_serial = failed_serial_row[0]
        
        query = f'INSERT INTO invalids VALUES("{failed_serial}")'
        cur.execute(query)

        if invalid_counter % 10:
            conn.commit()
        invalid_counter += 1
    conn.commit()

    conn.close()

def check_serial():
    pass

if __name__ == "__main__":
    # sendsms(sms_token,"09392115688","تست ارسال به تلفن همراه")
    import_database_from_exel('../data.xlsx')
    app.run("0.0.0.0",5000,debug=True)
