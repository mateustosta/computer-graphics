// Criação do objeto Three.js que armazenará os dados da cena.
let scene = new THREE.Scene();

// Definição da câmera do Three.js
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;

// A câmera é adicionada a cena.
scene.add(camera);

// Criação do objeto Three.js responsável por realizar o rendering.
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Criação do objeto de controle (interação) da câmera.
let controls = new THREE.OrbitControls(camera, renderer.domElement);

//----------------------------------------------------------------------------
// 'geometry' : Variável que contém a geometria (informação sobre vértices
//     e arestas) do objeto a ser renderizado (um torus, neste caso). É importante 
//     observar que, de acordo com o Three.js, a geometria de um objeto não contém
//     ainda a informação sobre o seu material.
//----------------------------------------------------------------------------
let geometry = new THREE.TorusGeometry(10, 3, 16, 25);

//----------------------------------------------------------------------------
// Variáveis do tipo "uniform", enviadas pela CPU aos shaders :
//
// * 'Ip_position' : posição da fonte de luz pontual no Espaço do Universo.
// * 'Ip_ambient_color' : cor do componente ambiente da fonte de luz pontual.
// * 'Ip_diffuse_color' : cor do componente difuso da fonte de luz pontual.
// * 'k_a' : coeficiente de reflectância ambiente do objeto.
// * 'k_d' : coeficiente de reflectância difusa do objeto.
// * 'k_s' : coeficiente de reflectância especular do objeto.
//----------------------------------------------------------------------------
let rendering_uniforms = {
    Ip_position: {type: 'vec3', value: new THREE.Vector3(-20, 10, 10)},
    Ip_ambient_color: {type: 'vec3', value: new THREE.Color(0.3, 0.3, 0.3)},
    Ip_diffuse_color: {type: 'vec3', value: new THREE.Color(0.7, 0.7, 0.7)},
    k_a: {type: 'vec3', value: new THREE.Color(0.25, 0.25, 0.85)},
    k_d: {type: 'vec3', value: new THREE.Color(0.25, 0.25, 0.85)},
    k_s: {type: 'vec3', value: new THREE.Color(1, 1, 1)},
    phong_exponent: {type: 'f', value: 16}
}

//----------------------------------------------------------------------------
// Criação do material na forma de um Vertex Shader e um Fragment Shader customizados.
// Os shaders receberão valores da CPU (i.e. variáveis do tipo 'uniform') por meio da
// variável 'rendering_uniforms'.
//----------------------------------------------------------------------------
let material = new THREE.ShaderMaterial({
    uniforms: rendering_uniforms,
    vertexShader:'',
    fragmentShader: ''
});

//----------------------------------------------------------------------------
// Vertex Shader
//----------------------------------------------------------------------------
material.vertexShader = `
    varying vec3 Normal;
    varying vec3 Position;
    varying vec4 Ip_pos_cam_spc;

    uniform vec3 Ip_position;

      void main() {
        // 'normal' : variável de sistema que contém o vetor normal do vértice (vec3) no espaço do objeto.
        Normal = normalize(normalMatrix * normal);
        
        // 'Position' : variável que contém o vértice (i.e. 'position') transformado para o Espaço de Câmera.
        Position = vec3(modelViewMatrix * vec4(position, 1.0));
        
        // 'Ip_pos_cam_spc' : variável que armazenará a posição da fonte de luz no Espaço da Câmera.
        Ip_pos_cam_spc = modelViewMatrix * vec4(Ip_position, 1.0);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

//----------------------------------------------------------------------------
// Fragment Shader
//----------------------------------------------------------------------------
material.fragmentShader = `

    uniform float phong_exponent;

    varying vec3 Normal;
    varying vec3 Position;
    varying vec4 Ip_pos_cam_spc;

    uniform vec3 Ip_position;
    uniform vec3 Ip_ambient_color;
    uniform vec3 Ip_diffuse_color;

    uniform vec3 k_a;
    uniform vec3 k_d;
    uniform vec3 k_s;

    varying vec4 I;


    void main() {

        // 'normal' : variável de sistema que contém o vetor normal do vértice (vec3) no espaço do objeto.
        vec3 N_cam_spc = normalize(Normal);
        
        // 'L_cam_spc' : variável que contém o vetor unitário, no Espaço de Câmera, referente à fonte de luz.
        vec3 L_cam_spc = normalize(Ip_pos_cam_spc.xyz - Position);
        
        // 'eyeVec': variável que contém o vetor que aponta para a câmera
        vec3 eyeVec = normalize(vec3(-Position));
        
        // 'reflect()' : função do sistema que retorna 'R_cam_spc', isto é, o vetor 'L_cam_spc' refletido 
        //     em relação o vetor 'N_cam_spc'.
        vec3 R_cam_spc = reflect(-L_cam_spc, N_cam_spc);


        vec3 tempI;
        
        // Componente ambiente
        tempI = Ip_ambient_color * k_a;
        
        // Componente difusa
        float diffuse = max(0.0, dot(L_cam_spc, N_cam_spc));
        tempI += Ip_diffuse_color * k_d * diffuse;

        // Componente especular
        float specular = pow(max(dot(R_cam_spc, normalize(eyeVec)),0.0), phong_exponent);
        tempI += Ip_diffuse_color * k_s * specular;


        gl_FragColor = vec4(tempI, 1.0);
    }
    `;

//----------------------------------------------------------------------------
// 'object_mesh' : De acordo com o Three.js, um 'mesh' é a geometria acrescida do material.
//----------------------------------------------------------------------------
var object_mesh = new THREE.Mesh(geometry, material);
scene.add(object_mesh);

//----------------------------------------------------------------------------
// 'render()' : Função que realiza o rendering da cena a cada frame.
//----------------------------------------------------------------------------
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

// Chamada da função de rendering.
render();
