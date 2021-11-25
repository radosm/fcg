
// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). Notar 
//    que esta función no es exactamente la misma que implementaron en el TP4, ya que no recibe por parámetro
//    la matriz de proyección. Es decir, deberá retornar solo la transformación antes de la proyección model-view (MV)
//    Es necesario completar esta implementación para que funcione el control de la luz en la interfaz. 
//    IMPORTANTE: No es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords, normals )
//      swapYZ( swap )
//      draw( matrixMVP, matrixMV, matrixNormal )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Notar que es necesario pasar las normales como atributo al VertexShader. 
//    La función draw recibe ahora 3 matrices en column-major: 
//
//       * model-view-projection (MVP de 4x4)
//       * model-view (MV de 4x4)
//       * normal transformation (MV_3x3)
//
//    Estas últimas dos matrices adicionales deben ser utilizadas para transformar las posiciones y las normales del 
//    espacio objeto al esapcio cámara. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//    Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
//  
// d) Implementar los métodos:
//
//      setLightDir(x,y,z)
//      setShininess(alpha)
//    
//    Estas funciones se llaman cada vez que se modifican los parámetros del modelo de iluminación en la 
//    interface. No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
//
// Otras aclaraciones: 
//
//      * Utilizaremos una sola fuente de luz direccional en toda la escena
//      * La intensidad I para el modelo de iluminación debe ser seteada como blanca (1.0,1.0,1.0,1.0) en RGB
//      * Es opcional incorporar la componente ambiental (Ka) del modelo de iluminación
//      * Los coeficientes Kd y Ks correspondientes a las componentes difusa y especular del modelo 
//        deben ser seteados con el color blanco. En caso de que se active el uso de texturas, la 
//        componente difusa (Kd) será reemplazada por el valor de textura. 
//        
// <=====================================================================================================>

// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	let cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
	let cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);

	var rotX = [
		1, 0, 0, 0,
		0, cosX, sinX, 0,
		0, -sinX, cosX, 0,
		0, 0, 0, 1
	];

	var rotY = [
		cosY, 0, -sinY, 0,
		0, 1, 0, 0,
		sinY, 0, cosY, 0,
		0, 0, 0, 1
	];

	var rot = MatrixMult(rotX, rotY);

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	trans = MatrixMult(trans, rot);

	var mv = trans;
	return mv;
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		// 1. Compilamos el programa de shaders
		this.program = InitShaderProgram( meshVS, meshFS );
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp = gl.getUniformLocation( this.program, "mvp" );
		this.mv = gl.getUniformLocation( this.program, "mv" );
		this.normalMatrix = gl.getUniformLocation( this.program, "mn" );
		this.flip = gl.getUniformLocation( this.program, "flip" );
		this.show = gl.getUniformLocation( this.program, "show" );
		this.ambient = gl.getUniformLocation( this.program, "ambient" );
		this.sampler = gl.getUniformLocation( this.program, "texGPU" );
		this.lightDir = gl.getUniformLocation( this.program, "lightDir" );
		this.shininess = gl.getUniformLocation( this.program, "shininess" );

		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.pos = gl.getAttribLocation( this.program, "pos" );
		this.texCoord = gl.getAttribLocation( this.program, "texCoord" );
		this.normCoord = gl.getAttribLocation( this.program, "normCoord" );
		this.vertCoord = gl.getAttribLocation( this.program, "vertCoord" );

		// 4. Creamos los buffers

		this.vertexBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.textureBuffer = gl.createBuffer();

		this.texture = gl.createTexture();
		this.showToggle = true;
		// ...
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices y otros atributos..
		this.numTriangles = vertPos.length / 3 / 3;

		// 1. Binding y seteo del buffer de vértices

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );

		// 2. Binding y seteo del buffer de coordenadas de textura	

		gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );

		// 3. Binding y seteo del buffer de normales	

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
		gl.useProgram( this.program );
		gl.uniform1i( this.flip, swap );
	}

	setAmbient( ambient )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
		gl.useProgram( this.program );
		gl.uniform1i( this.ambient, ambient );
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.program );

		// 2. Setear uniformes con las matrices de transformaciones
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix4fv( this.mv, false, matrixMV );
		gl.uniformMatrix3fv( this.normalMatrix, false, matrixNormal );

   		// 3. Habilitar atributos: vértices, normales, texturas
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.vertexAttribPointer( this.normCoord, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normCoord );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer );
		gl.vertexAttribPointer( this.texCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.texCoord );

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		// [COMPLETAR] Binding de la textura

		gl.bindTexture( gl.TEXTURE_2D, this.texture );

		// Pueden setear la textura utilizando esta función:
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );


		// [COMPLETAR] Ahora que la textura ya está seteada, debemos setear 
		// parámetros uniformes en el fragment shader para que pueda usarla. 

		gl.generateMipmap( gl.TEXTURE_2D );

		gl.useProgram( this.program );
		gl.uniform1i( this.sampler, 0 );
		gl.uniform1i( this.show, this.showToggle );
	}
		
        // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader para indicar si debe o no usar la textura
		gl.useProgram( this.program );
		gl.uniform1i( this.show, show );
		this.showToggle = show;
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram( this.program );
		gl.uniform3f( this.lightDir, x, y, z );
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram( this.program );
		gl.uniform1f( this.shininess, shininess );
	}
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader
var meshVS = `
	attribute vec3 pos;
	attribute vec2 texCoord;
	attribute vec3 normCoord;
	attribute vec4 vertCoord;

	uniform mat4 mvp;
	uniform mat4 mv;
	uniform int flip;
	uniform vec3 lightDir;
	uniform float shininess;

	varying mat4 vmv;
	varying vec2 vtexCoord;
	varying vec3 vnormCoord;
	varying vec4 vvertCoord;
	varying vec3 vlightDir;
	varying float vshininess;

	void main()
	{ 
		gl_Position = mvp * vec4((flip == 0) ? pos.xyz : pos.xzy, 1.0);
		vtexCoord = texCoord;
		vnormCoord = (flip == 0) ? normCoord.xyz : normCoord.xzy;
		vvertCoord = vertCoord;
		vmv = mv;
		vlightDir = lightDir;
		vshininess = shininess;
	}
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow

var meshFS = `
	precision mediump float;

	uniform mat3 mn;
	uniform sampler2D texGPU;
	uniform int show;
	uniform int ambient;

	varying vec2 vtexCoord;
	varying vec3 vnormCoord;
	varying vec4 vvertCoord;
	varying mat4 vmv;
	varying vec3 vlightDir;
	varying float vshininess;

	void main()
	{	
		vec3 normalDir = normalize(mn * vnormCoord);
		vec3 lightDir = normalize(vlightDir);
		vec3 viewDir = -normalize(vec3(vmv * vvertCoord));

		float diffuse = max(dot(normalDir, lightDir), 0.0);
		float specular = pow(max(dot(normalDir, normalize(lightDir + viewDir)), 0.0), vshininess);

		vec4 texColor = texture2D(texGPU, vtexCoord);
		vec4 white = vec4(1.0, 1.0, 1.0, 1.0);

		// Si queremos que no funda al fondo violeta, podemos poner el alpha de black en 1.0
		vec4 black = vec4(0.0, 0.0, 0.0, 0.0);

		vec4 Kd = (show == 0 ? white : texColor);
		vec4 Ks = white;
		vec4 I = white;
		vec4 Ka = (ambient == 0 ? black : Kd);

		vec4 Ia = vec4(0.1, 0.1, 0.1, 1.0);
		
		gl_FragColor = I * (Kd * diffuse + Ks * specular) + Ia * Ka;
	}
`;