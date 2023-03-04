const axios = require('axios');
const cheerio = require('cheerio');

const url = process.env['URL_SCRAPE'];

async function getNextGameAsync() {
  const { data: html } = await axios.get(url, {
    headers: {
      Accept: 'application/json',
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
  let dataLocal;
  
  let valoresArray = dataHora.split('<br>');
  let horasEMinutosArray = valoresArray[1].trim().split(':');

  let hoje = new Date();

  if (dataHora.includes('hoje')) {
    dataLocal = new Date();
    dataLocal.setHours(horasEMinutosArray[0]);
    dataLocal.setMinutes(horasEMinutosArray[1]);
  } else if (dataHora.includes('amanhã')) {
    dataLocal = new Date();
    dataLocal.setDate(hoje.getDate() + 1);
    dataLocal.setHours(horasEMinutosArray[0]);
    dataLocal.setMinutes(horasEMinutosArray[1]);
  } else {
    let dataMesArray = valoresArray[0].slice(5).split('/'); 

    let finalDate = new Date(`${hoje.getFullYear()}/${dataMesArray[1]}/${dataMesArray[0]} ${horasEMinutosArray[0]}:${horasEMinutosArray[1]}`);

    dataLocal = finalDate;
  }

  dataLocal.setSeconds(0);

  console.log('data local', dataLocal);

  var dataUTC = convertDateToUTC(dataLocal);
  console.log('data utc', dataUTC);

  return dataUTC;
}

const convertDateToUTC = (date) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
} 

module.exports = getNextGameAsync;