const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}

const urlsForUser = function(id, urlDatabase) {
  const userURLS = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLS[shortURL] = urlDatabase[shortURL]
    }
  }
  return userURLS;
}

const generateRandomString = function() {
  let str = '';
  const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++){
    str += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length))
  }
  return str;
}
const setLongUrl = function (url) {
  if (url.match(/^(https:\/\/|http:\/\/)/)) {
    return url;
  } else {
    return  "http://" + url;
  }
}


module.exports =  { getUserByEmail, urlsForUser, generateRandomString, setLongUrl } ;