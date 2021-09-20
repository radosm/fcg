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
	radians=Math.PI*rotation/180;
	return Array( scale*Math.cos(radians),scale*Math.sin(radians),0,
	             -scale*Math.sin(radians),scale*Math.cos(radians),0,
				  positionX               ,positionY               ,1);
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. 
function ComposeTransforms( trans1, trans2 )
{
	return Array(productoEscalar(fila(trans2,0),columna(trans1,0))
	,productoEscalar(fila(trans2,1),columna(trans1,0))
	,productoEscalar(fila(trans2,2),columna(trans1,0))
	,productoEscalar(fila(trans2,0),columna(trans1,1))
	,productoEscalar(fila(trans2,1),columna(trans1,1))
	,productoEscalar(fila(trans2,2),columna(trans1,1))
	,productoEscalar(fila(trans2,0),columna(trans1,2))
	,productoEscalar(fila(trans2,1),columna(trans1,2))
	,productoEscalar(fila(trans2,2),columna(trans1,2)));
}

function fila( m, n) {
	return m.filter((e,i)=>{return i%3==n});
}

function columna( m, n) {
	return m.slice(3*n,3*n+3);
}

function productoEscalar(p,q){
	return p.reduce((p,e,i)=>{ return p+e*q[i]},0);
}