const express = require('express');
const router = express.Router();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({
  stdTTL: 86400,
});
const getNextGameAsync = require('../Helpers/ScraperHelper')

router.get('/', async (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = myCache.get(key);

  if (cachedResponse) {
    res.send(cachedResponse);
    return next();
  } else {
    const retorno = await getNextGameAsync();
    myCache.set(key, retorno);  
  
    res.send(retorno);
  }
})

module.exports = router;
