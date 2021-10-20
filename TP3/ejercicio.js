// Completar la implementación de esta clase y el correspondiente vertex shader. 
// No será necesario modificar el fragment shader a menos que, por ejemplo, quieran modificar el color de la curva.
class CurveDrawer 
{
	// Inicialización de los shaders y buffers
	constructor()
	{
		// Creamos el programa webgl con los shaders para los segmentos de recta
		this.prog   = InitShaderProgram( curvesVS, curvesFS );
		this.pos    = [];
		this.mvp    = gl.getUniformLocation( this.prog, 'mvp' );

		this.pos[0] = gl.getUniformLocation( this.prog, 'p0' );
		this.pos[1] = gl.getUniformLocation( this.prog, 'p1' );
		this.pos[2] = gl.getUniformLocation( this.prog, 'p2' );
		this.pos[3] = gl.getUniformLocation( this.prog, 'p3' );

		// Obtenemos la ubicación del muestreo de t
		this.tPos  = gl.getAttribLocation( this.prog, 't' );
		
		// Muestreo del parámetro t
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}

		// Creacion del vertex buffer y seteo de contenido
		this.buffer = gl.createBuffer();

		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);

	}

	// Actualización del viewport (se llama al inicializar la web o al cambiar el tamaño de la pantalla)
	setViewport( width, height )
	{
		// Calculamos la matriz de proyección.
		// Como nos vamos a manejar únicamente en 2D, no tiene sentido utilizar perspectiva. 
		// Simplemente inicializamos la matriz para que escale los elementos de la escena
		// al ancho y alto del canvas, invirtiendo la coordeanda y. La matriz está en formato 
		// column-major.
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];

		// Seteamos la matriz en la variable unforme del shader
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mvp, false, trans );
	}

	updatePoints( pt )
	{
		// [Completar] Actualización de las variables uniformes para los puntos de control
		// [Completar] No se olviden de hacer el binding del programa antes de setear las variables 
		// [Completar] Pueden acceder a las coordenadas de los puntos de control consultando el arreglo pt[]:
		gl.useProgram( this.prog );
		for(var i=0;i<4;i++){
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			gl.uniform2fv(this.pos[i], [x,y]);
		}		
	}

	draw()
	{
		// Seleccionamos el shader
		gl.useProgram( this.prog );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );

		// Habilitamos el atributo 
		gl.vertexAttribPointer( this.tPos, 1, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.tPos );

		gl.drawArrays( gl.LINE_STRIP, 0, this.steps );
	}
}

// Vertex Shader
//[Completar] El vertex shader se ejecuta una vez por cada punto en mi curva (parámetro step). No confundir punto con punto de control.
// Deberán completar con la definición de una Bezier Cúbica para un punto t. Algunas consideraciones generales respecto a GLSL: si
// declarás las variables pero no las usás, no se les asigna espacio. Siempre poner ; al finalizar las sentencias. Las constantes
// en punto flotante necesitan ser expresadas como X.Y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var curvesVS = `
    precision mediump float;
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	
	void main()
	{
		float t2 = t * t;
		float t3 = t2 * t;
		float it = 1.0 - t;
		float it2 = it * it;
		float it3 = it2 * it;
		vec2 pos = p0 * it3 + p1 * 3.0 * t * it2 + p2 * 3.0 * t2 * it + p3 * t3;
		gl_Position = mvp * vec4(pos,0,1);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(0,0,1,1);
	}
`;
