// Estas constantes son para elegir un indice dentro de un pixel
const ROJO  = 0;
const VERDE = 1;
const AZUL  = 2;
const ALFA  = 3;

// Devuelve la paleta de colores pertmitidos dado un factor
const getPaleta = (factor) => {
    const step = 255 / factor;
    let paleta = [];

    for(let i = 0; i <= factor; i++)
        paleta.push(Math.round(i * step));

    return paleta;
}

// Encuentra el color más parecido dentro de la paleta de colores permitidos
const nearestAvailableColor = (pixel, paleta) => {
    let err = [255, 255, 255];
    let bestColor = [0, 0, 0];
    let minErr = [255, 255, 255];
    
    for(let i = 0; i < paleta.length; i++){
        err[ROJO] = pixel[ROJO] - paleta[i];
        err[VERDE] = pixel[VERDE] - paleta[i];
        err[AZUL] = pixel[AZUL] - paleta[i];

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

    return [bestColor, minErr];
}

// Devuelve un pixel en forma de array de 4 bytes [r,g,b,a]
const getPixel = (image, x, y) => {
    let w = image.width;
    let px = new Float32Array(4);
    
    for(let i = 0; i < 4; i++)
        px[i] = (image.data[4 * (y * w + x) + i]);

    return px;
}

// Reemplaza el pixel x,y de una imagen
const putPixel = (image, x, y, px) => {
    let w = image.width;
    let desde = 4 * (y * w + x);
    
    for(let i = 0; i < 4; i++)
        image.data[desde + i] = px[i];
}

const getDitherFloat = (image, w, h) => {
    let newData = new Float32Array(image.data.length);

    let newImage = {
        data: newData,
        width: w,
        height: h
    }

    for(let i = 0; i < image.data.length; i++){
        newImage.data[i] = image.data[i];
    }
    
    console.log(newImage);

    return newImage;
}

// Suma el error multiplicado por el coeficiente al pixel
const addError = (px, err, coef) => {
    px[ROJO]  = px[ROJO]  + coef * err[ROJO];
    px[VERDE] = px[VERDE] + coef * err[VERDE];
    px[AZUL]  = px[AZUL]  + coef * err[AZUL];
}

// Devuelve true si un pixel está dentro de la imagen
const validPixel = (x, y, h, w) => (x >= 0 && y >= 0 && y < h && x < w)