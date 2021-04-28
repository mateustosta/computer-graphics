/******************************************************************************
 * Vértices do modelo (cubo) centralizado no seu espaco do objeto. Os dois
 * vértices extremos do cubo são (-1,-1,-1) e (1,1,1), logo, cada aresta do cubo
 * tem comprimento igual a 2.
 *****************************************************************************/
//                                 X     Y     Z    W (coord. homogênea)
// let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
//                 new THREE.Vector4(1.0, -1.0, -1.0, 1.0),
//                 new THREE.Vector4(1.0, -1.0, 1.0, 1.0),
//                 new THREE.Vector4(-1.0, -1.0, 1.0, 1.0),
//                 new THREE.Vector4(-1.0, 1.0, -1.0, 1.0),
//                 new THREE.Vector4(1.0, 1.0, -1.0, 1.0),
//                 new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
//                 new THREE.Vector4(-1.0, 1.0, 1.0, 1.0)];

// Pirâmide
let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
                new THREE.Vector4(1.0, -1.0, -1.0, 1.0),
                new THREE.Vector4(1.0, 1.0, -1.0, 1.0),
                new THREE.Vector4(-1.0, 1.0, -1.0, 1.0),
                new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
                new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
                new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
                new THREE.Vector4(0.0, 0.0, 1.0, 1.0),];

/******************************************************************************
 * As 12 arestas do cubo, indicadas através dos índices dos seus vértices.
 *****************************************************************************/
// let edges = [[0, 1],
//              [1, 2],
//              [2, 3],
//              [3, 0],
//              [4, 5],
//              [5, 6],
//              [6, 7],
//              [7, 4],
//              [0, 4],
//              [1, 5],
//              [2, 6],
//              [3, 7]];

// Pirâmide
let edges = [[0,1],
             [1,2],
             [2,3],
             [3,0],
             [0,4],
             [1,5],
             [2,6],
             [3,7]];

/******************************************************************************
 * Matriz Model (modelagem): Esp. Objeto --> Esp. Universo. 
 * OBS: A matriz está carregada inicialmente com a identidade.
 *****************************************************************************/
function applyTransforms(matrix, transformation, parameters) {
    if (transformation === undefined) {
        return identityMatrix();
    } else {
        // Cria uma matriz para realizar as operações
        let resultMatrix = new THREE.Matrix4();
        resultMatrix = identityMatrix();
        
        // Armazena a matriz da transformação
        let transformMatrix = getTransforms(transformation, parameters);

        // Realiza a multiplicação
        resultMatrix.multiply(transformMatrix);
        matrix.multiply(resultMatrix);

        return matrix;
    }
}

function getTransforms(transformation, parameters) {
    // Transformações implementadas Scale, Rotation, Translation, Shear, and Reflection
    if (transformation == 'scale') {
        let scale_x = parameters.scale_x;
        let scale_y = parameters.scale_y;
        let scale_z = parameters.scale_z;
        return scaleMatrix(scale_x, scale_y, scale_z);
    } else if (transformation == 'rotation') {
        // tetha deve ser passado em graus
        let tetha = parameters.tetha;
        let axis = parameters.axis;
        return rotationMatrix(tetha, axis);
    } else if (transformation == 'translation') {
        let x = parameters.x;
        let y = parameters.y;
        let z = parameters.z;
        return translationMatrix(x, y, z);
    } else if (transformation == 'shear') {
        let x = parameters.x;
        let y = parameters.y;
        let z = parameters.z;
        let axis = parameters.axis;
        return shearMatrix(x, y, z, axis);
    } else if (transformation == 'reflection') {
        let plane = parameters.plane;
        return reflectionMatrix(plane);
    }
}

function scaleMatrix(scale_x, scale_y, scale_z) {
    // Matriz de escala
    let m_scale = new THREE.Matrix4();

    m_scale.set(scale_x, 0.0, 0.0, 0.0,
                0.0, scale_y, 0.0, 0.0,
                0.0, 0.0, scale_z, 0.0,
                0.0, 0.0, 0.0, 1.0);

    return m_scale;
}

function rotationMatrix(tetha, axis) {
    // Seno e Cosseno
    let sin = Math.sin(tetha*Math.PI/180.0);
    let cos = Math.cos(tetha*Math.PI/180.0);

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

function translationMatrix(x, y, z){
    // Matriz de translação
    let m_translation = new THREE.Matrix4();

    m_translation.set(1.0, 0.0, 0.0, x,
                      0.0, 1.0, 0.0, y,
                      0.0, 0.0, 1.0, z,
                      0.0, 0.0, 0.0, 1.0);

    return m_translation;
}

function shearMatrix(x, y, z, axis) {
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

function reflectionMatrix(plane) {
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

// Aplica transformações em m_model
// m_model = applyTransforms(m_model);  // faz m_model ser a identidade
m_model = applyTransforms(m_model, 'rotation', { tetha: 240, axis: 'X'});
m_model = applyTransforms(m_model, 'rotation', { tetha: -20, axis: 'Y'});
m_model = applyTransforms(m_model, 'scale', { scale_x: 1, scale_y: 1, scale_z: 2});
m_model = applyTransforms(m_model, 'translation', { x: 0, y: 0, z: .3});

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

                 cam_pos(1.3, 1.7, 2.0) - Posição da câmera no espaço do universo
                *
               /
              /
             /
            \/
            * cam_look_at(0, 0, 0) - Ponto para o qual a câmera aponta

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
let O = new THREE.Vector3();
O.copy(cam_look_at);
let t = P.sub(O);
t.multiplyScalar(-1);

// Aplica a translação a matriz m_t
m_t = applyTransforms(m_t, 'translation', { x: t.x, y: t.y, z: t.z })

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

let width = 1024;
let height = 768;

// Matriz de escala
m_S = applyTransforms(m_S, 'scale', { scale_x: width/2, scale_y: height/2, scale_z: 1.0 });

// Matriz de translação
m_T = applyTransforms(m_T, 'translation', { x: 1, y: 1, z:0 });

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
