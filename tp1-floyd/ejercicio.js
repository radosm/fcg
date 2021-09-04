// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)

// Estas constantes son para elegir un indice dentro de un pixel
const ROJO=0
const VERDE=1
const AZUL=2
const ALFA=3

const getPaleta = (factor) => {
    const step = 255 / factor;

    let paleta = [];

    for(let i = 0; i <= factor; i++)
        paleta.push(Math.round(i * step));

    // console.log('paleta: ',  paleta);
    // console.log('step: ', step);

    return paleta;
}

const nearestAvailableColor = (pixel, paleta) => {
    let err = [255, 255, 255];
    let bestColor = [0, 0, 0];
    let minErr = [255, 255, 255];
    
    for(let i = 0; i < paleta.length; i++){
        err[ROJO] = pixel[ROJO] - paleta[i];
        err[VERDE] = pixel[VERDE] - paleta[i];
        err[AZUL] = pixel[AZUL] - paleta[i];

        //console.log(err);

        if(Math.abs(err[ROJO]) < Math.abs(minErr[ROJO])){
            bestColor[ROJO] = paleta[i];
            minErr[ROJO] = err[ROJO];
        }

        if(Math.abs(err[VERDE]) < Math.abs(minErr[VERDE])){
            bestColor[VERDE] = paleta[i];
            minErr[VERDE] = err[VERDE];
        }
        
        if(Math.abs(err[AZUL]) < Math.abs(minErr[AZUL])){
            bestColor[AZUL] = paleta[i];
            minErr[AZUL] = err[AZUL];
        }
    }

    bestColor.push(pixel[ALFA]);

    //console.log(bestColor);

    return [bestColor, minErr];
}

// Devuelve un array de 4 bytes [r,g,b,a]
function getPixel(image,x,y)
{
    w=image.width;
    var px=[];
    for(i=0;i<4;i++) px.push(image.data[4*(x*w+y)+i]);
    return px;
}

// Reemplaza el pixel x,y de una imagen
function putPixel(image,x,y,px)
{
   var desde=4*(x*w+y);
   for(i=0;i<4;i++) image.data[desde+i]=px[i];
}

function addError(px, err, coef){
    px[ROJO]  = Math.round(px[ROJO]  + coef * err[ROJO]);
    px[VERDE] = Math.round(px[VERDE] + coef * err[VERDE]);
    px[AZUL]  = Math.round(px[AZUL]  + coef * err[AZUL]);
}

const validPixel = (x, y, h, w) => (x >= 0 && y >= 0 && x < h && x < w)

function dither(image, factor)
{
    let h = image.height;
    let w =image.width;

    let paleta = getPaleta(factor);

    console.log('factor='+factor);
    console.log('alto='+h);
    console.log('ancho='+w);

    for (x=0;x<h;x++)
    {
        for (y=0; y<w; y++)
        {
            let [newPx, err] = nearestAvailableColor(getPixel(image, x, y), paleta);
            let px;
            //console.log(err);

            if(validPixel(x + 1, y, h, w)){
                px = getPixel(image, x + 1, y);
                addError(px, err, 7/16);
                putPixel(image, x + 1, y, px);
            }

            if(validPixel(x - 1, y + 1, h, w)){
                px = getPixel(image, x - 1, y + 1);
                addError(px, err, 3/16);
                putPixel(image, x - 1, y + 1, px);
            }

            if(validPixel(x, y + 1, h, w)){
                px = getPixel(image, x, y + 1);
                addError(px, err, 5/16);
                putPixel(image, x, y + 1, px);
            }

            if(validPixel(x + 1, y + 1, h, w)){
                px = getPixel(image, x + 1, y + 1);
                addError(px, err, 1/16);
                putPixel(image, x + 1, y + 1, px);
            }
        
            putPixel(image, x, y, newPx);
        }
    }
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA, imageB, result) 
{
    {
        var h=imageA.height;
        var w=imageA.width;
        var pxR=[0,0,0,255]; // Pixel resultado, siempre con alfa=255

        for (x=0;x<h;x++)
        {
            for (y=0; y<w; y++)
            {
                // Obtiene los pixels x,y de cada imagen
                pxA=getPixel(imageA,x,y);
                pxB=getPixel(imageB,x,y);
                alfaA=pxA[ALFA]/255;
                // Calcula la resta en los 3 canales
                pxR[ROJO]=Math.abs(pxA[ROJO]*alfaA-pxB[ROJO]);
                pxR[VERDE]=Math.abs(pxA[VERDE]*alfaA-pxB[VERDE]);
                pxR[AZUL]=Math.abs(pxA[AZUL]*alfaA-pxB[AZUL]);
                // Guarda el resultado
                putPixel(result, x, y, pxR);
            }
        }
    }    
}