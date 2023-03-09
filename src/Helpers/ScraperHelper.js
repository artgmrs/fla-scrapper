const axios = require('axios');
const cheerio = require('cheerio');
const { DateTime } = require("luxon");

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

  const horas = +horasEMinutosArray[0];
  const minutos = +horasEMinutosArray[1];

  let hoje = DateTime.now();

  if (dataHora.includes('hoje')) {
    dataLocal = DateTime.now().setZone("America/Sao_Paulo").set({hour: horas, minute: minutos});
  } else if (dataHora.includes('amanhã')) {
    dataLocal = DateTime.now().setZone("America/Sao_Paulo").plus({days: 1}).set({hour: horas, minute: minutos});
  } else {
    let dataMesArray = valoresArray[0].slice(5).replace(',', '').trim().split('/'); 

    const mes = +dataMesArray[1];
    const dia = +dataMesArray[0];
    
    dataLocal = DateTime.local(hoje.year, mes, dia, horas, minutos).setZone("America/Sao_Paulo");
  }

  dataLocal = dataLocal.set({second: 0, millisecond: 0});

  return dataLocal;
}

module.exports = getNextGameAsync;