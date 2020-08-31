const axios = require("axios");
const config = require("./config");


async function sendMessage(receptor,message) {
    data = {
      "Messages": [message,],
      "MobileNumbers": [receptor,],
      "LineNumber": config.LineNumber,
      "SendDateTime": "",
      "CanContinueInCaseOfError": "false",
    };
    headers = {
      "Content-Type": "application/json",
      "x-sms-ir-secure-token": config.sendToken,
    };
  try {
    const res = await axios.post("https://RestfulSms.com/api/MessageSend", data, {
      headers: headers,
    });
    console.log(res.data);
  } catch (error) {
    console.error(error);
  }
}


module.exports = sendMessage