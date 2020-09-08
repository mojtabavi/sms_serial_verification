import requests
import re
import os
from flask import Flask, flash, jsonify, Response, request, redirect, url_for, request, session, abort, render_template
from flask_login import LoginManager, UserMixin,login_required, login_user, logout_user
from pandas import read_excel
from werkzeug.utils import secure_filename
import re
import requests
import mysql.connector as mysqldb
import config
app = Flask(__name__)

UPLOAD_FOLDER = config.UPLOAD_FOLDER
ALLOWED_EXTENSIONS = config.ALLOWED_EXTENSIONS
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# flask-login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"



def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app.config.update(
    SECRET_KEY= config.SECRET_KEY
)

# silly user model
class User(UserMixin):

    def __init__(self, id):
        self.id = id

    def __repr__(self):
        return "%d" % (self.id)


# create some users with ids 1 to 20
user = User(0)


# some protected url
@app.route('/',methods=['GET','POST'])
@login_required
def home():
    data = []
    if 'files[]' not in request.files:
        flash('No file part')


    files = request.files.getlist('files[]')

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            data.append(file_path)

    if(len(data) == 1):
        return '''
        <h3>one file missing</h3>
        '''
    if(len(data) == 2):
        import_database_from_exel(data[0],data[1])
        os.remove(data[0])
        os.remove(data[1])

    html_return = '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method="post" action="/" enctype="multipart/form-data">
    <dl>
    <p>
    <input type="file" name="files[]" multiple="true" autocomplete="off" required>
    </p>
    </dl>
    <p>
    <input type="submit" value="Submit">
    </p>
    </form>
'''
    return render_template('index.html')






# somewhere to login


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST': #TODO stop the bruteforce
        username = request.form['username']
        password = request.form['password']
        if password == config.PASSWORD and username == config.USERNAME:
            login_user(user)
            return redirect('/') 
        else:
            return abort(401)
    else:
        return  render_template('login.html')


# somewhere to logout
@app.route("/logout")
@login_required
def logout():
    logout_user()
    return Response('<p>Logged out</p>')


# handle login failed
@app.errorhandler(401)
def page_not_found(error):
    return Response('<p>Login failed</p>')


# callback to reload the user object
@login_manager.user_loader
def load_user(userid):
    return User(userid)

def get_token(apikey,secretkey):
    url = "https://RestfulSms.com/api/Token"
    header = {'Content-Type': 'application/json'}
    payload = {"UserApiKey": apikey,
               "SecretKey": secretkey}
    r = requests.post(url,data=payload)
    return(r.json()['TokenKey'])

def sendsms(receptor,message):
        sms_token = get_token(config.UserApiKey, config.SecretKey)
        print(sms_token)

        url = "https://RestfulSms.com/api/MessageSend"
        header = {
            'x-sms-ir-secure-token':sms_token
        }
        payload = {
            "Messages": message,
            "MobileNumbers": receptor,
            "LineNumber": config.LineNumber,
            "SendDateTime": "",
            "CanContinueInCaseOfError": "false",
        }
        r = requests.post(url,headers=header,data=payload)
        print(r.json()["IsSuccessful"])

def import_database_from_exel(filepath,filepath_invalid):
    db = mysqldb.connect(
        host=config.MYSQL_HOST,
        user=config.MYSQL_USERNAME,
        passwd=config.MYSQL_PASSWORD,
        database=config.MYSQL_DB_NAME,
        auth_plugin='mysql_native_password'
    )


    cur = db.cursor()
    cur.execute('DROP TABLE IF EXISTS serials')
    cur.execute("""CREATE TABLE serials (
        id INTEGER PRIMARY KEY,
        ref VARCHAR(200),
        description VARCHAR(200),
        start_serial CHAR(30),
        end_serial CHAR(30),
        date DATE);""")
    db.commit()
        
    df = read_excel(filepath,0)
    serial_counter = 0
    for index,(line,ref,desc,start_serial,end_serial,date) in df.iterrows():
        start_serial = normalize_string(start_serial)
        end_serial = normalize_string(end_serial)
        query = f'INSERT INTO serials VALUES("{line}", "{ref}", "{desc}", "{start_serial}", "{end_serial}", "{date}");'
        cur.execute(query)
        if serial_counter % 10 == 0:
            db.commit()
        serial_counter += 1
    db.commit()

    cur.execute('DROP TABLE IF EXISTS invalids')
    cur.execute("""CREATE TABLE invalids (
        invalid_serial CHAR(30) PRIMARY KEY)""")
    db.commit()
    invalid_counter = 0
    df = read_excel(filepath_invalid, 0)
    for index, (failed_serial, ) in df.iterrows():   
        query = f'INSERT INTO invalids VALUES("{failed_serial}")'
        cur.execute(query)

        if invalid_counter % 10 == 0:
            db.commit()
        invalid_counter += 1
    db.commit()

    db.close()


def normalize_string(data):
    from_char = "۱۲۳۴۵۶۷۸۹۰"
    to_char = "1234567890"
    for i in range(len(from_char)):
        data = data.replace(from_char[i],to_char[i])
    data = data.upper()
    data = re.sub(r'\W+', '',data)
    return data

def check_serial(serial):
    """this function will get one serial number and return  appropriate 
    answer to that , after consuling the db """

    db = mysqldb.connect(
        host=config.MYSQL_HOST,
        user=config.MYSQL_USERNAME,
        passwd=config.MYSQL_PASSWORD,
        database=config.MYSQL_DB_NAME,
        auth_plugin='mysql_native_password'
    )
    cur = db.cursor()

    query = f"SELECT * FROM invalids WHERE invalid_serial = '{serial}'"
    cur.execute(query)
    results = cur.fetchall()
    if len(results) > 0:
        return "the serial is among failed ones" #TODO return better string

    query = f"SELECT * FROM serials WHERE start_serial <= '{serial}' AND end_serial >= '{serial}' ;"
    cur.execute(query)
    results = cur.fetchone()
    if results:
        desc = results[2]
        return 'I found your serial in ' + desc

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
    sendsms(sender,answer)
    data = {"message":"processed"}
    return jsonify(data), 200



if __name__ == "__main__":
    # sendsms(sms_token,"09392115688","تست ارسال به تلفن همراه")
    # import_database_from_exel('../data.xlsx','../invalid.xlsx')
    ss = ['JM101','JJ1000000','','1','A']
    for s in ss:
        print(check_serial(s))
    app.run("0.0.0.0",5000,debug=True)
