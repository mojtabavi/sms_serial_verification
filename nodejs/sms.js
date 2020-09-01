const axios = require("axios");
const config = require("./config");


async function get_new_token(){
      data = {
        "UserApiKey": config.apiKey,
        "SecretKey": config.secretKey
      };
      headers = {
        "Content-Type": "application/json",
      };
      try {
        const res = await axios.post("https://RestfulSms.com/api/Token", data, {
          headers: headers,
        });
        console.log(res.data)
        return(res.data.TokenKey);
      } catch (error) {
        console.error(error);
      }
}


async function sendMessage(receptor,message) {
    const token = await get_new_token()
    data = {
      "Messages": [message,],
      "MobileNumbers": [receptor,],
      "LineNumber": config.LineNumber,
      "SendDateTime": "",
      "CanContinueInCaseOfError": "false",
    };
    headers = {
      "Content-Type": "application/json",
      "x-sms-ir-secure-token": token,
    };
    console.log(token)
  try {
    const res = await axios.post("https://RestfulSms.com/api/MessageSend", data, {
      headers: headers,
    });
    console.log(res.data);
  } catch (error) {
    console.error(error);
  }
}


module.exports = {sendMessage,get_new_token}