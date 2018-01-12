const cheerio = require('cheerio')
const PDFDocument = require('pdfkit')
const fs = require('fs');
require.extensions['.html'] = function(module, filename){
    module.exports = fs.readFileSync(filename, 'utf8');
};
const htmlParsed2String = require('./notas/Nota')

const PDFWindow = require('electron-pdf-window')
const { BrowserWindow } = require('electron').remote


window.onload = function() {


  const dataValores = []
  const dataQuant = []
  const dataCodigo = []


  document.getElementById('gerar').addEventListener('click', () => {
  //pega valores do HTML
  $ = cheerio.load(htmlParsed2String)
  $('.Data7').each(function(i, elem) {
    dataValores[i] = $(this).text()
  })

  dataValores.push();

  $('.Data6').each(function(i, elem) {
    dataQuant[i] = $(this).text();
  })

  dataQuant.push();

  $('.Data3').each(function(i, elem) {
    dataCodigo[i] = $(this).text();
  })

  dataCodigo.push();
  var parseValores = parse(float(dataValores))
  var parseQuant = parse(float(dataQuant))
  var precoFinal = preco(parseValores)
  var totalEtiquetas = somaEtiquetas(parseQuant)
  var impressaoEtiquetas = etiquetas(parseQuant, precoFinal)
  var impressaoCodigos = etiquetas(parseQuant,dataCodigo)

  escrevePDF(impressaoEtiquetas, totalEtiquetas, impressaoCodigos)
  
  });
  // Add the add button click event
  document.getElementById('imprimir').addEventListener('click', () => {

  const mainWindow = new BrowserWindow({ width: 800, height: 600 })
  PDFWindow.addSupport(mainWindow)
  mainWindow.loadURL('file:///Users/samillasilva/Desktop/geradorDePreco/etiquetasImpressao1.pdf')
  });

  
}

//substitui virgulas por pontos
function float(data){
  return data.map(item => item.replace(",", "."))
} 


//transforma os dados para inteiros
function parse(data){
  return data.map(item => parseFloat(item, 10))
  // var parse = []
  // for(var k in data){
  //  parse.push(parseInt(data[k],10))
  // }
  // return parse
}

//precifica os valores com porcentagens
function preco(valores, totalEtiquetas){
  var preco = []
  for(var i in valores){
    if(valores[i]>=20){
      preco[i] = Math.ceil(valores[i] + 0.55*valores[i])
    }else if(valores[i]>10 && valores[i]<20){
      preco[i] = Math.ceil(valores[i] + 0.75*valores[i])
    }else if(valores[i]<10){
      preco[i] = Math.ceil(valores[i]*2)
    }
  }return preco
}

//faz um array com os preços repetindo de acordo com a quantidade
function etiquetas(quantidade, valores){
  var etiqueta = []
  var j=0
  var k, l

  for(k = 0; k < quantidade.length; k++){
    for (l = 0; l < quantidade[k]; l++){
      etiqueta[j]=valores[k]
      j++
      }   
    }
  return etiqueta
}

function somaEtiquetas(quantidade){
  var totalEtiquetas = 0
  for (var i in quantidade){  
    totalEtiquetas += Number(quantidade[i])
  } return totalEtiquetas
}

//função que escreve um pdf com as etiquetas
function escrevePDF(etiquetas, totalEtiquetas, codigos){
  var tamanhoDaPag = totalEtiquetas * 37
  var espaco = 20
  var espacoCodigo = 0
  // Create a document
  pdf = new PDFDocument({
    layout: 'landscape',
    size: [tamanhoDaPag, 302], // a smaller document for small badge printers
    margin: 5
  });


  for(var k = 0; k < totalEtiquetas; k = k + 2){
    pdf.fontSize(20)
      .text(codigos[k],4,espacoCodigo)
      .text("R$"+etiquetas[k]+",00",4, espaco)
      .text(codigos[k+1],175,espacoCodigo)
      .text("R$"+etiquetas[k+1]+",00",175, espaco)

      espaco = espaco + 60
      espacoCodigo = espacoCodigo+60;
  }
  // Stream contents to a file
  pdf.pipe(fs.createWriteStream('etiquetasImpressao1.pdf')).on('finish', function () {
    //console.log('PDF closed');
    });

  // Close PDF and write file.
  pdf.end();
} 