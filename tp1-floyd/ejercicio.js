// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)

function dither(image, factor){
    let h = image.height;
    let w =image.width;
    let paleta = getPaleta(factor);

    console.log('Factor:', factor);
    console.log('Alto:', h);
    console.log('Ancho:', w);

    for (y = 0; y < w; y++){
        for (let x = 0; x < h; x++){
            let [newPx, err] = nearestAvailableColor(getPixel(image, x, y), paleta);
            let px;

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
function substraction(imageA, imageB, result) {
    var h = imageA.height;
    var w = imageA.width;
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