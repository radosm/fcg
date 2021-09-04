// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)

// Estas constantes son para elegir un indice dentro de un pixel
const ROJO=0
const VERDE=1
const AZUL=2
const ALFA=3

// Devuelve un array con la paleta según el factor
function getPaleta(factor) 
{
    // Calcula el salto
    var step=Math.round(256/factor);
    // Para evitar valores mayores a 255 antes del último valor de la paleta
    if (256-step*factor < 0) step=step-1;
    // El primer valor de la paleta es 0
    var p=[0];
    // Agrega todos los valores antes del 255
    var c=step;
    for (i=1;i<factor;i++) {
        p.push(c);
        c=c+step;
    }
    // Pone el último valor (255)
    p.push(255);
    // Devuelve la paleta
    return p;
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

function dither(image, factor)
{
    var p=getPaleta(factor);
    var h=image.height;
    var w=image.width;
    console.log('factor='+factor);
    console.log('paleta='+p);
    console.log('alto='+h);
    console.log('ancho='+w);
    for (x=0;x<h;x++)
    {
        for (y=0; y<w; y++)
        {
            px=getPixel(image,x,y);
            // Deja sólo el componente verde y 25% opacidad
            // px[ROJO]=0; px[AZUL]=0; px[ALFA]=64;
            putPixel(image,x,y,px);
        }
    }
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) 
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
                putPixel(result,x,y,pxR);
            }
        }
    }    
}