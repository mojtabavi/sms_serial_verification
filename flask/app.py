from flask import Flask,jsonify,request
from config import Sendtoken, LineNumber, DATABASE_FILE_PATH
from pandas import read_excel
import re
import requests
import sqlite3
app = Flask(__name__)

sms_token = None




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

def import_database_from_exel(filepath,filepath_invalid):

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
        start_serial = normalize_string(start_serial)
        end_serial = normalize_string(end_serial)
        query = f'INSERT INTO serials VALUES("{line}", "{ref}", "{desc}", "{start_serial}", "{end_serial}", "{date}");'
        cur.execute(query)
        if serial_counter % 10 == 0:
            conn.commit()
        serial_counter += 1
    conn.commit()

    cur.execute('DROP TABLE IF EXISTS invalids')
    cur.execute("""CREATE TABLE IF NOT EXISTS invalids (
        invalid_serial TEXT PRIMARY KEY)""")
    conn.commit()
    invalid_counter = 0
    df = read_excel(filepath_invalid, 0)
    for index, (failed_serial, ) in df.iterrows():   
        query = f'INSERT INTO invalids VALUES("{failed_serial}")'
        cur.execute(query)

        if invalid_counter % 10 == 0:
            conn.commit()
        invalid_counter += 1
    conn.commit()

    conn.close()


def normalize_string(str):
    from_char = "۱۲۳۴۵۶۷۸۹۰"
    to_char = "1234567890"
    for i in range(len(from_char)):
        str = str.replace(from_char[i],to_char[i])
    str = str.upper()
    str = re.sub(r'\W+', '',str)
    return str

def check_serial(serial):
    """this function will get one serial number and return  appropriate 
    answer to that , after consuling the db """

    conn = sqlite3.connect(DATABASE_FILE_PATH)
    cur = conn.cursor()

    query = f"SELECT * FROM invalids WHERE invalid_serial == '{serial}'"
    results = cur.execute(query)
    if len(results.fetchall()):
        return "the serial is among failed ones" #TODO return better string

    query = f"SELECT * FROM serials WHERE start_serial < '{serial}' AND end_serial > '{serial}' ;"
    results = cur.execute(query)
    if len(results.fetchall()) == 1:
        return 'I found your serial' #TODO return better string 

    return "it was not in the db"

@app.route('/v1/process')
def process():
    """
    This is a callback from sms.ir
    """

    message = normalize_string(request.args.get('text'))
    sender = request.args.get('from') 
    print(f'received {message} from {sender}') #TODO logging

    answer = check_serial(message)

    data = {"message":"processed"}
    return jsonify(data), 200



if __name__ == "__main__":
    # sendsms(sms_token,"09392115688","تست ارسال به تلفن همراه")
    import_database_from_exel('../data.xlsx','../invalid.xlsx')
    print(check_serial('JJ1000002'))
    app.run("0.0.0.0",5000,debug=True)
