
function normalize(str){
    const from_char = "۱۲۳۴۵۶۷۸۹۰";
    const to_char = "1234567890";
    str = str.toUpperCase();
    for(var i=0;i<from_char.length;i++){
        str = str.replace(from_char[i],to_char[i]);
    }
    return str
}

module.exports = normalize;