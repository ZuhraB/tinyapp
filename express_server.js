// **** All required ****//

const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; 
let cookieSession = require('cookie-session');
const { getUserByEmail, urlsForUser, generateRandomString, setLongUrl } = require('./helpers');

// *** All app.use *** //

app.use(cookieSession({
  name: 'session',
  keys: ["done"],
  maxAge: 24 * 60 * 60 * 1000 
}))
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const e = require("express");

// *** app.set *** //
app.set("view engine", "ejs");

// *** Data bases *** //

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//  renders to urls_index 
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {urls: urlsForUser(user_id, urlDatabase), user: users[user_id]};
    res.render("urls_index", templateVars); }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});
// Registration endpoint for get requests 
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
// Login endpoint for get requests
app.get("/login", (req, res) => {
  res.render("login");
});

// newly created ursl
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  } else {
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  }
    res.render("urls_new", templateVars);
  }
});

// Only registered and the creators of short usrls can visit them
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = setLongUrl(req.body.longURL);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id}
  res.redirect('/urls'); 
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});  

// Only the creators of shrot urls can be rendered 
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  const shortURL = req.params.shortURL
  if (userID) {
    let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user : users[userID],};
    res.render("urls_show", templateVars);
    } else {
      res.redirect("/login");
    }
});

// delets the short urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (urlsForUser(userID, urlDatabase)) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("Your are not allowed to delet this page!");
  }
})
// edits the longURLS
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID= req.session.user_id;
  if (urlsForUser(userID, urlDatabase)) {
    const { shortURL} = req.params;
    const longURL = req.body.editedUrl;
    urlDatabase[shortURL] = {longURL, userID}
    res.redirect("/urls");
  } else {
    res.send("Action not allowed!");
  }
})
//  Login post request
app.post("/login", (req, res) => {

  const {email, password } = req.body
  if (!email || !password) {
    res.status(403).send("Fields must be filled out");
  } else if (getUserByEmail(email, users)) {
      let user = getUserByEmail(email, users);
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id =  user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send("Incorrect password");
    } 
  } else {
    res.status(403).send("Please register first");
  }
});


// Register post request

app.post("/register", (req, res) => {
  const userRandomID = generateRandomString();
  req.session.user_id =  userRandomID;
  const {email, password } = req.body
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "" || getUserByEmail(email, users)) {
    res.statusCode = 400;
    res.status(400).send("Please enter a valid email")
  } else {
    const user = {id: userRandomID, email:req.body.email, password: hashedPassword}
    users[userRandomID] = user
  res.redirect("/urls")
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});