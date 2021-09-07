// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)

function dither(image, factor)
{
    
    let jarvis = [   [ 0, 0, 0, 7, 5 ] 
                    ,[ 3, 5, 7, 5, 3 ]
                    ,[ 1, 3, 5, 3, 1 ]
                 ];

    let h = image.height;
    let w =image.width;
    let paleta = getPaleta(factor);

    console.log('factor='+factor);
    console.log('alto='+h);
    console.log('ancho='+w);
    console.log('paleta='+paleta);
    console.log('jarvis='+jarvis[0]);
    console.log('jarvis='+jarvis[1]);
    console.log('jarvis='+jarvis[2]);
    let newPx,err,px;

    for (let y=0; y < w; y++)
    {
        for (let x = 0; x < h; x++)
        {
            [newPx, err] = nearestAvailableColor(getPixel(image, x, y), paleta);
            for (let i=0;i<3;i++)
            {
                for (let j=0;j<5;j++)
                {
                    let coef=jarvis[i][j];
                    // no toca los anteriores ni el actual
                    if (coef==0) { 
                        continue;
                    }
                    let vx=x+i;
                    let vy=y+j-2;
                    if (validPixel(vx, vy, h, w)){
                        px = getPixel(image, vx, vy);
                        addError(px, err, coef/48);
                        putPixel(image, vx, vy, px);
                    }
                }
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