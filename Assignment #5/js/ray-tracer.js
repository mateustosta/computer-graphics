///////////////////////////////////////////////////////////////////////////////
// Funcao que desenha um pixel colorido no canvas.
// Entrada:
//   x, y: Coordenadas de tela do pixel.
//   color: Cor do pixel no formato RGB (THREE.Vector3).
// Retorno:
//   Sem retorno.
///////////////////////////////////////////////////////////////////////////////
function PutPixel(x, y, color) {
  let c = document.getElementById('canvas')
  let ctx = c.getContext('2d')
  let r = Math.min(255, Math.max(0, Math.round(color.x * 255)))
  let g = Math.min(255, Math.max(0, Math.round(color.y * 255)))
  let b = Math.min(255, Math.max(0, Math.round(color.z * 255)))
  ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
  ctx.fillRect(x, y, 1, 2)
}

///////////////////////////////////////////////////////////////////////////////
// Classe que representa um raio de luz.
// Construtor:
//   origem: Ponto de origem do raio (THREE.Vector3).
//   direcao: Vetor unitario que indica a direcao do raio (THREE.Vector3).
///////////////////////////////////////////////////////////////////////////////
class Raio {
  constructor(origem, direcao) {
    this.origem = origem
    this.direcao = direcao
  }
}

///////////////////////////////////////////////////////////////////////////////
// Classe que representa a camera.
// Construtor:
//   Sem parametros. Os atributos da camera estao 'hard coded' no construtor.
///////////////////////////////////////////////////////////////////////////////
class Camera {
  constructor() {
    this.resolucaoX = 512 // Resolucao do sensor em X.
    this.resolucaoY = 512 // Resolucao do sensor em Y.
    this.d = 1.0 // Distancia do sensor em relacao a posicao da camera.
    this.xMin = -1.0 // Extremidade esquerda do sensor.
    this.xMax = 1.0 // Extremidade direita do sensor.
    this.yMin = -1.0 // Extremidade inferior do sensor.
    this.yMax = 1.0 // Extremidade superior do sensor.
    this.k = new THREE.Vector3(this.xMin, this.yMax, -this.d) // Canto superior esquerdo do sensor.
    this.a = new THREE.Vector3(this.xMax - this.xMin, 0.0, 0.0) // Vetor para calculo de um ponto sobre o sensor.
    this.b = new THREE.Vector3(0.0, this.yMin - this.yMax, 0.0) // Vetor para calculo de um ponto sobre o sensor.
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Metodo que converte coordenadas (x,y) de tela para um raio
  // primario que passa pelo centro do pixel no espaco do universo.
  // Entrada:
  //   x, y: Coordenadas de tela do pixel.
  // Retorno:
  //   Um objeto do tipo Raio.
  ///////////////////////////////////////////////////////////////////////////////
  raio(x, y) {
    let u = (x + 0.5) / this.resolucaoX
    let v = (y - 0.5) / this.resolucaoY
    let p = this.a
      .clone()
      .multiplyScalar(u)
      .add(this.b.clone().multiplyScalar(v))
      .add(this.k)

    let origem = new THREE.Vector3(0.0, 0.0, 0.0)
    let direcao = p.normalize()

    return new Raio(origem, direcao)
  }
}

///////////////////////////////////////////////////////////////////////////////
// Classe que representa um ponto de interseccao entre o raio e uma primitiva.
// Construtor:
//   Sem parametros. As propriedades de um objeto desta classe sao preenchidas
//   assim que uma interseccao raio-primitiva e detectada.
///////////////////////////////////////////////////////////////////////////////
class Interseccao {
  constructor() {
    this.t = Infinity // distancia entre a origem do rio e o ponto de intersecao.
    this.posicao = new THREE.Vector3(0.0, 0.0, 0.0) // Coordenadas do ponto de interseccao.
    this.normal = new THREE.Vector3(0.0, 0.0, 0.0) // Vetor normal no ponto de interseccao.
  }
}

///////////////////////////////////////////////////////////////////////////////
// Classe que representa uma primitiva do tipo triangulo.
// Construtor:
//   a: Vértice do triangulo (THREE.Vector3).
//   b: Vértice do triangulo (THREE.Vector3).
//   c: Vértice do triangulo (THREE.Vector3).
///////////////////////////////////////////////////////////////////////////////
class Triangulo {
  constructor(a, b, c) {
    this.a = a
    this.b = b
    this.c = c
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Metodo que testa a interseccao entre o raio e o triangulo.
  // Entrada:
  //   raio: Objeto do tipo Raio cuja a interseccao com p triangulo se quer verificar.
  //   interseccao: Objeto do tipo Interseccao que armazena os dados da interseccao caso esta ocorra.
  // Retorno:
  //   Um valor booleano: 'true' caso haja interseccao; ou 'false' caso contrario.
  ///////////////////////////////////////////////////////////////////////////////
  interseccionar(raio, interseccao) {
    let EPSILON = 0.000001

    // calcula a normal do triangulo
    let edge1 = this.b.clone().sub(this.a.clone())
    let edge2 = this.c.clone().sub(this.a.clone())
    let N = edge1.clone().cross(edge2.clone())

    let pvec = raio.direcao.clone().cross(edge2.clone())

    let det = edge1.clone().dot(pvec.clone())

    if (det > -EPSILON && det < EPSILON) return 0

    let inv_det = 1.0 / det

    let tvec = raio.origem.clone().sub(this.a.clone())

    let u = tvec.clone().dot(pvec.clone()) * inv_det

    if (u < 0.0 || u > 1.0) return false

    let qvec = tvec.clone().cross(edge1.clone())

    let v = raio.direcao.clone().dot(qvec.clone()) * inv_det

    if (v < 0.0 || u + v > 1.0) return false

    let t = edge2.clone().dot(qvec.clone()) * inv_det

    interseccao.posicao = raio.origem
      .clone()
      .add(raio.direcao.clone().multiplyScalar(t))
    interseccao.normal = N.negate().normalize()

    return true
  }
}

///////////////////////////////////////////////////////////////////////////////
// Classe que representa uma primitiva do tipo esfera.
// Construtor:
//   centro: Coordenadas do centro da esfera no espaco do universo (THREE.Vector3).
//   raio: Raio da esfera.
///////////////////////////////////////////////////////////////////////////////
class Esfera {
  constructor(centro, raio) {
    this.centro = centro
    this.raio = raio
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Metodo que testa a interseccao entre o raio e a esfera.
  // Entrada:
  //   raio: Objeto do tipo Raio cuja a interseccao com a esfera se quer verificar.
  //   interseccao: Objeto do tipo Interseccao que armazena os dados da interseccao caso esta ocorra.
  // Retorno:
  //   Um valor booleano: 'true' caso haja interseccao; ou 'false' caso contrario.
  ///////////////////////////////////////////////////////////////////////////////
  interseccionar(raio, interseccao) {
    let a = raio.direcao.clone().dot(raio.direcao)
    let o_c = raio.origem.clone().sub(this.centro)
    let b = 2.0 * raio.direcao.clone().dot(o_c)
    let c = o_c.clone().dot(o_c) - this.raio * this.raio

    let disc = b * b - 4.0 * a * c

    if (disc > 0.0) {
      let t1 = (-b + Math.sqrt(disc)) / (2.0 * a)
      let t2 = (-b - Math.sqrt(disc)) / (2.0 * a)

      interseccao.t = t1

      if (t2 > 0.001 && t2 < t1) interseccao.t = t2

      if (interseccao.t > 0.001) {
        interseccao.posicao = raio.origem
          .clone()
          .add(raio.direcao.clone().multiplyScalar(interseccao.t))
        interseccao.normal = interseccao.posicao
          .clone()
          .sub(this.centro)
          .normalize()
        return true
      }

      return false
    }

    return false
  }
}

///////////////////////////////////////////////////////////////////////////////
// Classe que representa uma fonte de luz pontual.
// Construtor:
//   posicao: Posicao da fonte de luz pontual no espaco (THREE.Vector3).
//   cor: Cor da fonte de luz no formato RGB (THREE.Vector3).
///////////////////////////////////////////////////////////////////////////////
class Luz {
  constructor(posicao, cor) {
    this.posicao = posicao
    this.cor = cor
  }
}

///////////////////////////////////////////////////////////////////////////////
// Funcao que renderiza a cena utilizando ray tracing.
// Entrada:
//  Sem entradas.
// Retorno:
//   Sem retorno.
///////////////////////////////////////////////////////////////////////////////
function Render() {
  let camera = new Camera()
  let s1 = new Esfera(new THREE.Vector3(0.0, 0.0, -3.0), 1.0)
  let t1 = new Triangulo(
    new THREE.Vector3(-1.0, -1.0, -3.5),
    new THREE.Vector3(1.0, 1.0, -3.0),
    new THREE.Vector3(0.75, -1.0, -2.5)
  )
  let Ip = new Luz(
    new THREE.Vector3(-10.0, 10.0, 4.0),
    new THREE.Vector3(0.8, 0.8, 0.8)
  )

  // Lacos que percorrem os pixels do sensor.
  for (let y = 0; y < 512; ++y)
    for (let x = 0; x < 512; ++x) {
      let raio = camera.raio(x, y) // Construcao do raio primario que passa pelo centro do pixel de coordenadas (x,y).
      let interseccao = new Interseccao()

      if (t1.interseccionar(raio, interseccao)) {
        // Se houver interseccao entao...

        let ka = new THREE.Vector3(1.0, 0.0, 0.0) // Coeficiente de reflectancia ambiente da esfera.
        let kd = new THREE.Vector3(1.0, 0.0, 0.0) // Coeficiente de reflectancia difusa da esfera.
        let ks = new THREE.Vector3(1.0, 1.0, 1.0) // Coeficiente de reflectancia especular da esfera.
        let Ia = new THREE.Vector3(0.2, 0.2, 0.2) // Intensidade da luz ambiente.
        let phong = 32 // Expoente de Phong

        let termo_ambiente = Ia.clone().multiply(ka) // Calculo do termo ambiente do modelo local de iluminacao.

        let L = Ip.posicao.clone().sub(interseccao.posicao).normalize() // Vetor que aponta para a fonte e luz pontual.
        let R = L.clone().reflect(interseccao.normal) // Vetor reflexão de L sobre N
        let V = interseccao.posicao.normalize() // Vetor que aponta para a camera

        // Calculo do termo difuso do modelo local de iluminacao.
        let termo_difuso = Ip.cor
          .clone()
          .multiply(kd)
          .multiplyScalar(Math.max(0.0, interseccao.normal.dot(L)))

        // Calculo do termo especular do modelo local de ilumicacao.
        let termo_especular = Ip.cor
          .clone()
          .multiply(ks)
          .multiplyScalar(Math.pow(Math.max(0.0, R.dot(V)), phong))

        PutPixel(x, y, termo_difuso.add(termo_ambiente).add(termo_especular)) // Combina os termos difuso, ambiente e especular e pinta o pixel.
      } // Senao houver interseccao entao...
      else PutPixel(x, y, new THREE.Vector3(0.0, 0.0, 0.0)) // Pinta o pixel com a cor de fundo.
    }
}

Render() // Invoca o ray tracer.
