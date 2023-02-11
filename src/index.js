const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({
  stdTTL: 86400,
});

const PORT = 3000;
const url = 'https://www.placardefutebol.com.br/time/flamengo/proximos-jogos';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
}))

app.get('/proximo-jogo', async (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = myCache.get(key);

  if (cachedResponse) {
    res.send(cachedResponse);
    return next();
  } else {
    const retorno = await getNextGame();
    myCache.set(key, retorno);  
  
    res.send(retorno);
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));

async function getNextGame() {
  const { data: html } = await axios.get(url, {
    headers: {
      Accept: 'application/json',
      Origin: 'https://www.placardefutebol.com.br',
      Referer: 'https://www.placardefutebol.com.br/',  
    },
  });
  const $ = cheerio.load(html);

  const dataHora = $('a.match > div > div.match__md_card--info > div.match__md_card--datetime').html().trim();
  const dataHoraFormatada = formatDate(dataHora);
  let nomeMandante = $('a.match > div > div.match__md_card--at-name').html();
  let nomeVisitante = $('a.match > div > div.match__md_card--ht-name').html();
  let imagemMandante = $('a.match > div > div.match__md_card--at-logo > img').attr("src");
  let imagemVisitante = $('a.match > div > div.match__md_card--ht-logo > img').attr("src");
  let mandante = nomeMandante.toLowerCase() !== 'flamengo';

  let retorno = {};  
  retorno.mandante = mandante;
  retorno.nomeRival = mandante ? nomeMandante : nomeVisitante;
  retorno.imagemRival = mandante ? imagemMandante : imagemVisitante;
  retorno.dataHoraJogo = dataHoraFormatada;
  retorno.campeonato = $('a.match > div > div.match__md_card--league').html();

  return retorno;
}

const formatDate = (dataHora) => {
  let dataHoraFormatada;
  
  let valoresArray = dataHora.split('<br>');
  let horasEMinutosArray = valoresArray[1].split(':');

  let hoje = new Date();

  if (dataHora.includes('hoje')) {
    dataHoraFormatada = new Date();
    dataHoraFormatada.setHours(horasEMinutosArray[0]);
    dataHoraFormatada.setMinutes(horasEMinutosArray[1]);
    
  } else if (dataHora.includes('amanhã')) {
    // @todo - testar
    const amanha = hoje.setDate(hoje.getDate() + 1);
    dataHoraFormatada = amanha;

  } else {
    let dataMesArray = valoresArray[0].slice(5).split('/'); 

    let finalDate = new Date(`${hoje.getFullYear()}/${dataMesArray[1]}/${dataMesArray[0]} ${horasEMinutosArray[0]}:${horasEMinutosArray[1]}`);

    dataHoraFormatada = finalDate;
  }

  return dataHoraFormatada.toLocaleString('en-US') ;
}

