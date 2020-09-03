const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
const e = require("express");
app.use(cookieParser())


app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
const findEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
  return false;
}

const generateRandomString = function() {
  let str = '';
  const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++){
    str += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length))
  }
  return str;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let user_id = req.cookies.user_id;
    let templateVars = {
        user: users[user_id],
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);

})
//sending user data and others to urls/new/only registerd or loged in can access
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  if (!user_id) {
    res.redirect("/login")
  } else {
  let templateVars = {
    user: users[user_id],
    urls: urlDatabase
  }
    res.render("urls_new", templateVars)
}
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  console.log(longURL)
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies.user_id}
  res.redirect('/urls')  
});
app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL].longURL
   console.log(longURL)
  res.redirect(longURL);
});   //renders to urls_show and sending user object  
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies.user_id;
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], user : users[user_id]};
  res.render("urls_show", templateVars);
});
// delets the short urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
})
// edits the longURLS
app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.editedUrl;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls")
})
// *** Login endpoint for login of the cookie and username and send usercookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(403).send("Fields must be filled out");
  } else if (findEmail(email, users)) {
    if (findEmail(email, users).password === password){
      res.cookie("user_id", findEmail(email,users).id)
      res.redirect('/urls')
    } else {
      res.status(403).send("Incorrect password")
    } 
  } else {
    res.status(403).send("Please register first")
  }
 
})
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login");
})
app.get("/login", (req,res) => {
  res.render("login")
})

//**Registration */

// returns register template:
app.get("/register", (req, res) => {
  res.render("register")
})
app.post("/register", (req, res) => {
  const userRandomID = generateRandomString()
  res.cookie("user_id", userRandomID);
  const email = req.body.email;
  const password = req.body.password
  if (email === "" || password === "" || findEmail(email, users)) {
    res.statusCode = 400;
    res.status(400).send("Please enter a valid email")
  } else {
    const user = {id: userRandomID, email:req.body.email, password:req.body.password}
    users[userRandomID] = user
  res.redirect("/urls")
  }
})













app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});