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

    let floatImage = getDitherFloat(image, w, h);

    console.log('factor='+factor);
    console.log('alto='+h);
    console.log('ancho='+w);
    console.log('paleta='+paleta);
    console.log('jarvis='+jarvis[0]);
    console.log('jarvis='+jarvis[1]);
    console.log('jarvis='+jarvis[2]);
    let newPx,err,px;

    for (let y=0; y < h; y++)
    {
        for (let x = 0; x < w; x++)
        {        
            [newPx, err] = nearestAvailableColor(getPixel(floatImage, x, y), paleta);
            for (let i=0;i<3;i++)
            {
                for (let j=0;j<5;j++)
                {
                    let coef=jarvis[i][j];
                    // no toca los anteriores ni el actual
                    if (coef==0) { 
                        continue;
                    }
                    let vx=x+j-2;
                    let vy=y+i;
                    if (validPixel(vx, vy, h, w)){
                        px = getPixel(floatImage, vx, vy);
                        addError(px, err, coef/48);
                        putPixel(floatImage, vx, vy, px);
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

    
    for (y=0; y<h; y++)
    {
        for (x=0;x<w;x++)
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