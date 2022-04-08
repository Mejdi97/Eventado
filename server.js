const path = require("path");
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require("cors");
const morgan = require("morgan");


const { Client, resources, Webhook } = require("coinbase-commerce-node");
const {
  COINBASE_API_KEY,
  COINBASE_WEBHOOK_SECRET,
  DOMAIN,
} = require("./config");
const { Charge } = resources;
Client.init(COINBASE_API_KEY);



app.use(cors());
app.use(morgan("dev"));

app.use(
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    })
  );


mongoose.connect("mongodb+srv://mej:123test@cluster0.we743.mongodb.net/eventado?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

app.use(express.urlencoded({ extended: false }));

app.use('/images', express.static(path.join(__dirname, 'images')));

//routes
const userRouter = require('./routes/user')
app.use('/user', userRouter)

const EventRouter = require('./routes/event')
app.use('/event', EventRouter)




const EventRegisterRouter = require('./routes/eventRegister')
app.use('/eventRegister', EventRegisterRouter)


//paiement
/*
app.get("/create-charge", async (req, res) => {
    const chargeData = {
      name: "om kolthoum",
      description: "concert om kolthoum a theatre de carthage",
      local_price: {
        amount: 0.2,
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        customer_id: "id_1005",
        customer_name: "mola_el bach",
      },
      redirect_url: `${DOMAIN}/success-payment`,
      cancel_url: `${DOMAIN}/cancel-payment`,
    };
  
    const charge = await Charge.create(chargeData);
  
    console.log(charge);
  
    res.send(charge);
  });






  app.post("/payment-handler", (req, res) => {
    const rawBody = req.rawBody;
    const signature = req.headers["x-cc-webhook-signature"];
    const webhookSecret = COINBASE_WEBHOOK_SECRET;
  
    let event;
  
    try {
      event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
      // console.log(event);
  
      if (event.type === "charge:pending") {
        // received order
        // user paid, but transaction not confirm on blockchain yet
        console.log("pending payment");
      }
  
      if (event.type === "charge:confirmed") {
        // fulfill order
        // charge confirmed
        console.log("charge confirme");
      }
  
      if (event.type === "charge:failed") {
        // cancel order
        // charge failed or expired
        console.log("charge failed");
      }
  
      res.send(`success ${event.id}`);
    } catch (error) {
      console.log(error);
      res.status(400).send("success");
    }
  });

  
app.get("/success-payment", (req, res) => {
    res.send("success payment");
  });
  
  app.get("/cancel-payment", (req, res) => {
    res.send("cancel payment");
  });



*/
app.listen(3001, () => console.log('Server Started'))