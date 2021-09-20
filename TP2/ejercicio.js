// Esta función construye una matriz de transfromación de 3x3 en coordenadas homogéneas 
// utilizando los parámetros de posición, rotación y escala. La estructura de datos a 
// devolver es un arreglo 1D con 9 valores en orden "column-major". Es decir, para un 
// arreglo A[] de 0 a 8, cada posición corresponderá a la siguiente matriz:
//
// | A[0] A[3] A[6] |
// | A[1] A[4] A[7] |
// | A[2] A[5] A[8] |
// 
// Se deberá aplicar primero la escala, luego la rotación y finalmente la traslación. 
// Las rotaciones vienen expresadas en grados. 
function BuildTransform( positionX, positionY, rotation, scale )
{	
	let radians = Math.PI * rotation / 180;
	return Array( scale * Math.cos(radians), scale * Math.sin(radians), 0,
	             -scale * Math.sin(radians), scale * Math.cos(radians), 0,
				  positionX                , positionY                , 1);
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. 
function ComposeTransforms( trans1, trans2 )
{
	return toArray(matrixMultiply(toMatrix(trans1), toMatrix(trans2)));
}

const newMatrix = () => {
	let matrix = Array();
	for(let i = 0; i < 3; i++)
		matrix.push(new Array(3));
	
	for(let i = 0; i < 9; i++)
		matrix[Math.floor(i / 3)][i % 3] = 0;

	return matrix;
}

const toMatrix = ( array ) => {
	let matrix = newMatrix();

	for(let i = 0; i < 9; i++)
		matrix[Math.floor(i / 3)][i % 3] = array[i];

	return matrix;
}

const toArray = ( matrix ) => {
	let array = Array();

	for(let x = 0; x < 3; x++){
		for(let y = 0; y < 3; y++){
			array.push(matrix[x][y]);
		}
	}

	return array;
}

const matrixMultiply = ( matrix1, matrix2 ) => {
	let result = newMatrix();

	for(let x = 0; x < 3; x++){
		for(let y = 0; y < 3; y++){
			for(let k = 0; k < 3; k++){
				result[x][y] += matrix1[x][k] * matrix2[k][y];
			}
		}
	}

	return result;
}