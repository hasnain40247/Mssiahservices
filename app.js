//jshint esversion:6

const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const Cart = require(__dirname + "/cart.js");
const nodemailer = require("nodemailer");
const https = require("https");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "OurLittleSecret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  phoneNumber: String,
  firstname: String,
  lastname: String,
  city: String,
  zip: String,
  bname: String,
  business: String,
  addr: String,
});

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
  },
  { collection: "Product" }
);

userSchema.plugin(passportlocalmongoose);

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", userSchema);

module.exports = Product;

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cart: { type: Object, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  paymentId: { type: String, required: true },
});
const Order = mongoose.model("Order", orderSchema);
passport.use(User.createStrategy());

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:{type:String,required:true},
  date: { type: String, required: true },
  message: { type: String, required: true },
});

const Post = mongoose.model("Post", postSchema);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get("/", function (req, res) {
  if (req.isAuthenticated()) {

 
    res.render("index", {
      login: true,

      itemCount: req.session.cart ? req.session.cart.totalQ : 0,
    });
  } else {
    res.render("index", {
      login: false,

      itemCount: req.session.cart ? req.session.cart.totalQ : 0,
    });
  }
});

app.get("/equipments", function (req, res) {
  if (req.isAuthenticated()) {
    Product.find(function (err, found) {
      if (!err) {
        res.render("service", {
          breakR: false,
          beans: false,
          login: true,
          products: found,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }
    });
  } else {
    Product.find(function (err, found) {
      if (!err) {
        res.render("service", {
          breakR: false,
          beans: false,
          login: false,
          products: found,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }
    });
  }
});
app.get("/login", function (req, res) {
  res.render("sign-in");
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.get("/loginCheck", function (req, res) {
  res.render("sign-in-check");
});

app.post("/loginCheck", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/Cart/check");
      });
    }
  });
});


app.get("/posts",function(req,res){
  if(req.isAuthenticated()){
    Post.find(function(err,result){
      if(!err){
        res.render("posts",{
          posts: result,
          login:true,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        })
      }
      else{
       res.render("posts",{
         login:true,
         posts:false,
         itemCount: req.session.cart ? req.session.cart.totalQ : 0,
       })
      }
      
      
      
    })

  }
  else{
    Post.find(function(err,result){
      if(!err){
        res.render("posts",{
          posts: result,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
          login:false
        })
      }
      else{
       res.render("posts",{
         login:false,
         itemCount: req.session.cart ? req.session.cart.totalQ : 0,
         posts:false
       })
      }
      
      
      
    })

  }

})

app.post("/posts",function(req,res){

  if(req.isAuthenticated())
{
  var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes()+ ":" 
                + currentdate.getSeconds();

                console.log(datetime);
  var post=new Post({
    user: req.user._id,
    name: req.user.firstname,
    message: req.body.message,
    date:datetime


  })

  post.save(function(err,result){
    if(!err){
      res.redirect("/posts")
    }
  })
  console.log(post);
}
else{
  res.redirect("/login")
}

})

app.post("/yourmessage", async (req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "solon.ebert89@ethereal.email",
      pass: "5agED9bgqewBGsubWp",
    },
  });
  var textBody = `FROM: ${req.body.name} 
    ,EMAIL: ${req.body.email}
    , MESSAGE: ${req.body.message}`;

  const message = {
    from: '"MSSIAH Coffee Services" <mcs@example.com>',
    to: req.body.email,
    subject: "Thank You For Contacting Us!",
    text: textBody,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  res.render("contact", {
    mes: true,
    login: false,
    itemCount: req.session.cart ? req.session.cart.totalQ : 0,
  });

  main().catch(console.error);
});

app.post("/newsletter", function (req, res) {
  const email = req.body.email;

  if (req.user) {
    const data = {
      members: [
        {
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: req.user.firstname,

            LNAME: req.user.lastname,
            ADDRESS: req.user.addr,
          },
        },
      ],
    };
    const jsonData = JSON.stringify(data);
    const url = "https://us17.api.mailchimp.com/3.0/lists/98abf0a0da";

    const options = {
      method: "POST",
      auth: "hasnain:8f88a6208d052aa6e5e4c53c9fb17006-us17",
    };

    const request = https.request(url, options, function (response) {
      if (response.statusCode === 200) {
        res.render("sucFail", {
          login: true,
          success: true,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      } else {
        res.render("sucFail", {
          login: true,
          success: false,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }

      response.on("data", function (data) {
        console.log(JSON.parse(data));
      });
    });
    console.log(request);
    request.write(jsonData);
    request.end();
  } else {
    const data = {
      members: [
        {
          email_address: email,
          status: "subscribed",
        },
      ],
    };
    const jsonData = JSON.stringify(data);
    const url = "https://us17.api.mailchimp.com/3.0/lists/98abf0a0da";

    const options = {
      method: "POST",
      auth: "hasnain:8f88a6208d052aa6e5e4c53c9fb17006-us17",
    };

    const request = https.request(url, options, function (response) {
      if (response.statusCode === 200) {
        res.render("sucFail", {
          login: false,
          success: true,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      } else {
        res.render("sucFail", {
          login: false,
          success: false,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }

      response.on("data", function (data) {
        console.log(JSON.parse(data));
      });
    });
    console.log(request);
    request.write(jsonData);
    request.end();
  }
});

app.get("/register", function (req, res) {
  res.render("sign-up");
});

app.post("/register", function (req, res) {
  const user = {
    username: req.body.username,
    phoneNumber: req.body.phone,
    firstname: req.body.fname,
    lastname: req.body.lname,
    city: req.body.city,
    zip: req.body.zip,
    bname: req.body.bname,
    business: req.body.business,
    addr: req.body.al1 + req.body.al2,
  };

  User.register(new User(user), req.body.password, function (err, users) {
    if (!err) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/Cart", function (req, res) {
  if (req.isAuthenticated()) {
    if (!req.session.cart) {
      var itemCount = 0;
      res.render("cart", {
        login: true,
        products: null,

        itemCount: cart ? cart.totalQ : itemCount,
      });
    } else {
      var cart = new Cart(req.session.cart);
      var itemCount = 0;
      res.render("cart", {
        login: true,
        products: cart.generate(),
        totalP: cart.totalP,

        itemCount: cart ? cart.totalQ : itemCount,
      });
    }
  } else {
    if (!req.session.cart) {
      var itemCount = 0;
      res.render("cart", {
        login: false,
        products: null,
        itemCount: cart ? cart.totalQ : itemCount,
      });
    } else {
      var cart = new Cart(req.session.cart);
      var itemCount = 0;
      res.render("cart", {
        login: false,
        products: cart.generate(),
        totalP: cart.totalP,
        itemCount: cart ? cart.totalQ : itemCount,
      });
    }
  }
});

app.get("/business", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("business", {
      login: true,
      itemCount: req.session.cart ? req.session.cart.totalQ : 0,
    });
  } else {
    res.render("business", {
      login: false,
      itemCount: req.session.cart ? req.session.cart.totalQ : 0,
    });
  }
});

app.get("/contact", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("contact", {
      mes: false,
      login: true,
      itemCount: req.session.cart ? req.session.cart.totalQ : 0,
    });
  } else {
    res.render("contact", {
      mes: false,
      login: false,
      itemCount: req.session.cart ? req.session.cart.totalQ : 0,
    });
  }
});

app.get("/break", function (req, res) {
  if (req.isAuthenticated()) {
    Product.find(function (err, found) {
      if (!err) {
        res.render("service", {
          breakR: true,
          beans: false,
          login: true,
          products: found,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }
    });
  } else {
    Product.find(function (err, found) {
      if (!err) {
        res.render("service", {
          breakR: true,
          beans: false,
          login: false,
          products: found,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }
    });
  }
});

app.get("/beans", function (req, res) {
  if (req.isAuthenticated()) {
    Product.find(function (err, found) {
      if (!err) {
        res.render("service", {
          beans: true,
          breakR: false,
          login: true,
          products: found,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }
    });
  } else {
    Product.find(function (err, found) {
      if (!err) {
        res.render("service", {
          beans: true,
          login: false,
          breakR: false,
          products: found,
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
        });
      }
    });
  }
});

app.get("/break/:id", function (req, res) {
  if (req.isAuthenticated()) {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function (err, product) {
      if (!err) {
        cart.add(product, product.id);

        req.session.cart = cart;

        res.redirect("/break");
      }
    });
  } else {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function (err, product) {
      if (!err) {
        cart.add(product, product.id);

        req.session.cart = cart;

        res.redirect("/break");
      }
    });
  }
});
app.get("/beans/:id", function (req, res) {
  if (req.isAuthenticated()) {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function (err, product) {
      if (!err) {
        cart.add(product, product.id);

        req.session.cart = cart;

        res.redirect("/beans");
      }
    });
  } else {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function (err, product) {
      if (!err) {
        cart.add(product, product.id);

        req.session.cart = cart;

        res.redirect("/beans");
      }
    });
  }
});

app.get("/equipments/:id", function (req, res) {
  if (req.isAuthenticated()) {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function (err, product) {
      if (!err) {
        cart.add(product, product.id);

        req.session.cart = cart;

        res.redirect("/equipments");
      }
    });
  } else {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function (err, product) {
      if (!err) {
        cart.add(product, product.id);

        req.session.cart = cart;

        res.redirect("/equipments");
      }
    });
  }
});

app.post("/charge", function (req, res) {
  if (req.isAuthenticated()) {
    if (!req.session.cart) {
      res.redirect("/Cart");
    }
    var cart = new Cart(req.session.cart);
    const stripe = require("stripe")(
      "sk_test_51HYEiXKpObt632yVNGI57OwrUEGreOxpYnIc7nOCFFMK8IKg3lGAJTfJwN9uHbFfU5IeojrVAMASlj2pkqjsM3vC00ayWpXyht"
    );

    const token = req.body.stripeToken; // Using Express

    amount = parseInt(cart.totalP) + 45;
    console.log(amount);

    stripe.charges.create(
      {
        amount: amount * 100,
        currency: "inr",
        source: token,
        description: "Example charge",
      },
      function (err, charge) {
        if (err) {
          console.log("Error");
          return res.redirect("/Cart/check");
        }
        var order = new Order({
          user: req.user._id,
          cart: cart,
          address: req.body.cardaddress,
          name: req.body.cardname,
          paymentId: charge.id,
        });

        order.save(function (err, result) {
          if (!err) {
            console.log("Successs");

            req.session.cart = null;

            res.redirect("/equipments");
          }
        });
      }
    );
  }
});

app.get("/Cart/check", function (req, res) {
  if (req.isAuthenticated()) {
    if (!req.session.cart) {
      res.redirect("/Cart");
    }
    var cart = new Cart(req.session.cart);
    res.render("credit", {
      price: cart.totalP,
    });
  } else {
    res.redirect("/loginCheck");
  }
});

app.get("/user/profile", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user._id, function (err, user) {
      res.render("profile", {
        user: user,
        login: true,
        itemCount: req.session.cart ? req.session.cart.totalQ : 0,
      });
    });
  }
});

app.get("/user/orders", function (req, res) {
  console.log("inside get");
  if (req.isAuthenticated()) {
    Order.find({ user: req.user._id }, function (err, orders) {
      if (!err) {
        var cart;
        orders.forEach((order) => {
          cart = new Cart(order.cart);
          order.items = cart.generate();
        });

        res.render("orders", {
          itemCount: req.session.cart ? req.session.cart.totalQ : 0,
          login: true,
          orders: orders,
        });
      } else {
        console.log(err);
      }
    });
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
