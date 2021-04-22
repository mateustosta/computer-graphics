/******************************************************************************
 * Vértices do modelo (cubo) centralizado no seu espaco do objeto. Os dois
 * vértices extremos do cubo são (-1,-1,-1) e (1,1,1), logo, cada aresta do cubo
 * tem comprimento igual a 2.
 *****************************************************************************/
//                                 X     Y     Z    W (coord. homogênea)
let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
                new THREE.Vector4(1.0, -1.0, -1.0, 1.0),
                new THREE.Vector4(1.0, -1.0, 1.0, 1.0),
                new THREE.Vector4(-1.0, -1.0, 1.0, 1.0),
                new THREE.Vector4(-1.0, 1.0, -1.0, 1.0),
                new THREE.Vector4(1.0, 1.0, -1.0, 1.0),
                new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
                new THREE.Vector4(-1.0, 1.0, 1.0, 1.0)];

/******************************************************************************
 * As 12 arestas do cubo, indicadas através dos índices dos seus vértices.
 *****************************************************************************/
let edges = [[0, 1],
             [1, 2],
             [2, 3],
             [3, 0],
             [4, 5],
             [5, 6],
             [6, 7],
             [7, 4],
             [0, 4],
             [1, 5],
             [2, 6],
             [3, 7]];

/******************************************************************************
 * Matriz Model (modelagem): Esp. Objeto --> Esp. Universo. 
 * OBS: A matriz está carregada inicialmente com a identidade.
 *****************************************************************************/
function applyTransforms(m_model) {
    // Transformações implementadas
    // As linhas estão comentadas para que não
    // seja feita nenhuma operação com matriz que não será utilizada
    // let m_scale = scaleMatrix(1.0, 1.0, 1.0);
    // let m_rotation = rotationMatrix(30, 'X');  // o ângulo deve ser passado em graus
    // let m_translation = translationMatrix(-0.2, 0.0, 1.0);
    // let m_shear = shearMatrix(2.0, 0.3, 0.3, axis='X');
    // let m_reflection = reflectionMatrix('XY');
    // let m_identity = identityMatrix();

    // Carrega a matriz identidade em m_model
    m_model = identityMatrix();

    // Aplica a transformação na matriz model
    // m_model = m_model.clone().multiply(m_scale);
    // m_model = m_model.clone().multiply(m_translation);
    // m_model = m_model.clone().multiply(m_shear);
    // m_model = m_model.clone().multiply(m_rotation);
    // m_model = m_model.clone().multiply(m_reflection);
    
    return m_model;
}

function scaleMatrix(scale_x=1.0, scale_y=1.0, scale_z=1.0) {
    // Matriz de escala
    let m_scale = new THREE.Matrix4();

    m_scale.set(scale_x, 0.0, 0.0, 0.0,
                0.0, scale_y, 0.0, 0.0,
                0.0, 0.0, scale_z, 0.0,
                0.0, 0.0, 0.0, 1.0);

    return m_scale;
}

function rotationMatrix(tetha=30, axis='X') {
    // Ângulo em graus
    let rotation_theta = tetha;

    // Seno e Cosseno
    let sin = Math.sin(rotation_theta*Math.PI/180.0);
    let cos = Math.cos(rotation_theta*Math.PI/180.0);

    // Matriz de rotação
    let m_rotation = new THREE.Matrix4();

    if (axis == 'X'){
        // Rotação em X
        m_rotation.set(1.0, 0.0, 0.0, 0.0,
                       0.0, cos, -sin, 0.0,
                       0.0, sin, cos, 0.0,
                       0.0, 0.0, 0.0, 1.0);
    } else if(axis == 'Y') {
        // Rotação em Y
        m_rotation.set(cos, 0.0, sin, 0.0,
                       0.0, 1.0, 0.0, 0.0,
                       -sin, 0.0, cos, 0.0,
                       0.0, 0.0, 0.0, 1.0);
    } else {
        // Rotação em Z
        m_rotation.set(cos, -sin, 0.0, 0.0,
                       sin, cos, 0.0, 0.0,
                       0.0, 0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0, 1.0);
    }

    return m_rotation;
}

function translationMatrix(x=1.0, y=1.0, z=1.0){
    // Matriz de translação
    let m_translation = new THREE.Matrix4();

    m_translation.set(1.0, 0.0, 0.0, x,
                      0.0, 1.0, 0.0, y,
                      0.0, 0.0, 1.0, z,
                      0.0, 0.0, 0.0, 1.0);

    return m_translation;
}

function shearMatrix(x=1.0, y=2.0, z=3.0, axis='X') {
    // Matriz de shear
    let m_shear = new THREE.Matrix4();

    if (axis == 'X'){
        m_shear.set(1.0, 0.0, 0.0, 0.0,
                    y, 1.0, 0.0, 0.0,
                    z, 0.0, 1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0);
    } else if (axis == 'Y'){
        m_shear.set(1.0, x, 0.0, 0.0,
                    0.0, 1.0, 0.0, 0.0,
                    0.0, z, 1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0);
    } else {
        // axis == 'Z'
        m_shear.set(1.0, 0.0, x, 0.0,
                    0.0, 1.0, y, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0);
    }

    return m_shear;
}

function reflectionMatrix(plane='XY') {
    // Matriz de reflexão
    let m_reflection = new THREE.Matrix4();

    if (plane == 'XY') {
        m_reflection.set(1.0, 0.0, 0.0, 0.0,
                         0.0, 1.0, 0.0, 0.0,
                         0.0, 0.0, -1.0, 0.0,
                         0.0, 0.0, 0.0, 1.0);        
    } else if (plane == 'YZ') {
        m_reflection.set(-1.0, 0.0, 0.0, 0.0,
                         0.0, 1.0, 0.0, 0.0,
                         0.0, 0.0, 1.0, 0.0,
                         0.0, 0.0, 0.0, 1.0);
    } else {
        // Plane ZX
        m_reflection.set(1.0, 0.0, 0.0, 0.0,
                         0.0, -1.0, 0.0, 0.0,
                         0.0, 0.0, 1.0, 0.0,
                         0.0, 0.0, 0.0, 1.0);
    }

    return m_reflection;
}

function identityMatrix() {
    // Matriz identidade
    let m_identity = new THREE.Matrix4();

    m_identity.set(1.0, 0.0, 0.0, 0.0,
                   0.0, 1.0, 0.0, 0.0,
                   0.0, 0.0, 1.0, 0.0,
                   0.0, 0.0, 0.0, 1.0);

    return m_identity;
}

// Cria a matriz model
let m_model = new THREE.Matrix4();

// Apply transformations to m_model
m_model = applyTransforms(m_model);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_model);

/******************************************************************************
 * Parâmetros da camera sintética.
 *****************************************************************************/
let cam_pos = new THREE.Vector3(1.3, 1.7, 2.0);     // posição da câmera no esp. do Universo.
let cam_look_at = new THREE.Vector3(0.0, 0.0, 0.0); // ponto para o qual a câmera aponta.
let cam_up = new THREE.Vector3(0.0, 1.0, 0.0);      // vetor Up da câmera.

/******************************************************************************
 * Matriz View (visualização): Esp. Universo --> Esp. Câmera
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

// Derivar os vetores da base da câmera a partir dos parâmetros informados acima.

// z_cam = -D/|D|
/*

                 cam_pos(1.3, 1.7, 2.0) - Origem do espaço da câmera
                *
               /
              /
             /
            \/
            * (0, 0, 0) - Origem do espaço do universo

z_cam aponta na direção contrária de D. D é o vetor direção, neste caso,
D = (0 - 1.3, 0 - 1.7, 0 - 2.0), logo
D = (-1.3, -1.7, -2.0), D = cam_look_at - cam_pos
*/
let z_cam = new THREE.Vector3();
let D = new THREE.Vector3();

// D recebe uma cópia de cam_look_at para depois subtrair o valor de cam_pos
// ao final multiplicamos por -1
D.copy(cam_look_at);
D.sub(cam_pos).multiplyScalar(-1); // Neste caso, a subtração é irrelevante (0,0,0)

// z_cam recebe D normalizado
z_cam = D.normalize();

// x_cam = up cross z_cam / norm(up cross z_cam)
let x_cam = new THREE.Vector3();
x_cam = cam_up.clone().cross(z_cam).normalize();

// y_cam = z_cam cross x_cam
// Não precisamos dividir pela norma pois z_cam e x_cam já são unitários
let y_cam = new THREE.Vector3();
y_cam = z_cam.clone().cross(x_cam);

// Construir 'm_bt', a inversa da matriz de base da câmera.
let m_bt = new THREE.Matrix4();

m_bt.set(x_cam.x, x_cam.y, x_cam.z, 0.0,
         y_cam.x, y_cam.y, y_cam.z, 0.0,
         z_cam.x, z_cam.y, z_cam.z, 0.0,
         0.0, 0.0, 0.0, 1.0);

// Construir a matriz 'm_t' de translação para tratar os casos em que as
// origens do espaço do universo e da câmera não coincidem.
let m_t = new THREE.Matrix4();

// vector(t) = vector(P) - vector(O), onde P é a origem do espaço da câmera e
// O é a origem do espaço do universo
let P = new THREE.Vector3();
P.copy(cam_pos);
let O = new THREE.Vector3(0, 0, 0);
let t = P.sub(O);
t.multiplyScalar(-1);

m_t.set(1.0, 0.0, 0.0, t.x,
        0.0, 1.0, 0.0, t.y,
        0.0, 0.0, 1.0, t.z,
        0.0, 0.0, 0.0, 1.0);

// Constrói a matriz de visualização 'm_view' como o produto
//  de 'm_bt' e 'm_t'.
let m_view = m_bt.clone().multiply(m_t);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_view);

/******************************************************************************
 * Matriz de Projecao: Esp. Câmera --> Esp. Recorte
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/
let m_projection = new THREE.Matrix4();
let d = 1.0;

m_projection.set(1.0, 0.0, 0.0, 0.0,
                 0.0, 1.0, 0.0, 0.0,
                 0.0, 0.0, 1.0, d,
                 0.0, 0.0, -1.0/d, 0.0);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_projection);

/******************************************************************************
 * Homogeneizacao (divisao por W): Esp. Recorte --> Esp. Canônico
 *****************************************************************************/

for (let i = 0; i < 8; ++i) {
    vertices[i].divideScalar(vertices[i].w);
}

/******************************************************************************
 * Matriz Viewport: Esp. Canônico --> Esp. Tela
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/
let m_viewport = new THREE.Matrix4();
let m_T = new THREE.Matrix4();
let m_S = new THREE.Matrix4();

let width = 128;
let height = 128;

// Matriz de escala
m_S.set(width/2, 0.0, 0.0, 0.0,
        0.0, height/2, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0);

// Matriz de translação        
m_T.set(1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0);

// Cria a matriz view port como sendo a matriz de escala * matriz de translação
m_viewport = m_S.clone().multiply(m_T);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_viewport);

/******************************************************************************
 * Rasterização
 *****************************************************************************/
color = [255, 0, 0, 255];
for (let i = 0; i < edges.length; ++i) {
    MidPointLineAlgorithm(vertices[edges[i][0]].x, vertices[edges[i][0]].y, vertices[edges[i][1]].x, vertices[edges[i][1]].y, color, color);
}
