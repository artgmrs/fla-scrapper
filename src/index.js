require('dotenv').config()
const express = require('express');
const cors = require('cors');

const PORT = 3000;
var allowedDomains = ['http://localhost:5173', 'https://quando-o-flamengo-joga.vercel.app', 'https://www.quandoflamengojoga.com.br' ];

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedDomains.indexOf(origin) === -1) {
      let msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const homeRoute = require('./Routes/HomeRoute');
const proximoJogoRoute = require('./Routes/ProximoJogoRoute');

app.use('/', homeRoute);
app.use('/proximo-jogo', proximoJogoRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
