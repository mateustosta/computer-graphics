// Atribui a classe Canvas a variável color_buffer
let color_buffer = new Canvas("canvas");
color_buffer.clear();

function LinearColorInterpolation(pixel_0, pixel_1, pixel_2, axis) {
    let d_red = 0;
    let d_green = 0;
    let d_blue = 0;
    let d_alpha = 0;

    if (axis == 'x') {
        // Variação de X
        const delta_x = pixel_1.x - pixel_0.x;

        // Define o quanto cada cor será incrementada/decrementada a cada pixel
        d_red = (pixel_1.color[0] - pixel_0.color[0]) / delta_x;
        d_green = (pixel_1.color[1] - pixel_0.color[1]) / delta_x;
        d_blue = (pixel_1.color[2] - pixel_0.color[2]) / delta_x;
        d_alpha = (pixel_1.color[3] - pixel_0.color[3]) / delta_x;
    } else {
        // Variação de Y
        const delta_y = pixel_1.y - pixel_0.y;

        // Define o quanto cada cor será incrementada/decrementada a cada pixel
        d_red = (pixel_1.color[0] - pixel_0.color[0]) / delta_y;
        d_green = (pixel_1.color[1] - pixel_0.color[1]) / delta_y;
        d_blue = (pixel_1.color[2] - pixel_0.color[2]) / delta_y;
        d_alpha = (pixel_1.color[3] - pixel_0.color[3]) / delta_y;
    }

    // Calcula a cor de cada pixel
    const color = [pixel_2.color[0] + d_red, pixel_2.color[1] + d_green, pixel_2.color[2] + d_blue, pixel_2.color[3] + d_alpha];

    // Seta as cores novas para o pixel
    pixel_2.color = color;
}

function DrawPixelLineX(pixel_0, pixel_1) {
    // Pixel a ser desenhado, criei este pixel
    // pois estava com dificuldade de fazer a interpolação
    // das cores sem ele
    var pixel_2 = new Pixel(pixel_0.x, pixel_0.y, pixel_0.color);

    // Variações de x e y
    var delta_x = pixel_1.x - pixel_0.x;
    var delta_y = pixel_1.y - pixel_0.y;
    var incr_y = 1; // incremento de y

    if (delta_y < 0) {
        // Espelha para cobrir os gradientes entre 0 e -1
        incr_y = -1;
        delta_y = -delta_y;
    }

    var decision_factor = (2 * delta_y) - delta_x; // fator de decisão para o primeiro pixel

    while (pixel_2.x <= pixel_1.x) {
        LinearColorInterpolation(pixel_0, pixel_1, pixel_2, axis = 'x');
        color_buffer.putPixel(pixel_2.x, pixel_2.y, pixel_2.color);
        // decision_factor > 0 = incremento para NE
        if (decision_factor > 0) {
            pixel_2.y += incr_y;
            decision_factor += 2 * (delta_y - delta_x);
        }
        else {
            // decision_factor <= 0 = incremento para E
            // Não incrementa y
            decision_factor += 2 * delta_y;
        }
        // incrementa x
        pixel_2.x++;
    }
}

function DrawPixelLineY(pixel_0, pixel_1) {
    // Pixel a ser desenhado, criei este pixel
    // pois estava com dificuldade de fazer a interpolação
    // das cores sem ele
    var pixel_2 = new Pixel(pixel_0.x, pixel_0.y, pixel_0.color);

    // Variações de x e y
    var delta_x = pixel_1.x - pixel_0.x;
    var delta_y = pixel_1.y - pixel_0.y;
    var incr_x = 1; // incremento de x

    if (delta_x < 0) {
        // Espelha para cobrir os gradientes entre 0 e -1
        incr_x = -1;
        delta_x = -delta_x;
    }

    var decision_factor = (2 * delta_x) - delta_y; // fator de decisão para o primeiro pixel

    while (pixel_2.y <= pixel_1.y) {
        LinearColorInterpolation(pixel_0, pixel_1, pixel_2, axis = 'y');
        color_buffer.putPixel(pixel_2.x, pixel_2.y, pixel_2.color);
        // decision_factor > 0 = incremento para NE
        if (decision_factor > 0) {
            pixel_2.x += incr_x;
            decision_factor += 2 * (delta_x - delta_y);
        } else {
            // decision_factor <= 0 = incremento para E
            // Não incrementa x
            decision_factor += 2 * delta_x;
        }
        // incrementa y
        pixel_2.y++;
    }
}

function DrawLine(pixel_0, pixel_1) {
    // Variações de x e y
    var delta_x = Math.abs(pixel_1.x - pixel_0.x);
    var delta_y = Math.abs(pixel_1.y - pixel_0.y);

    // delta_y < delta_x = Octantes 1, 4, 5 e 8
    if (delta_y < delta_x) {
        // x0 > x1 = Octantes 4 e 5
        if (pixel_0.x > pixel_1.x) {
            DrawPixelLineX(pixel_1, pixel_0);
        } else {
            // x0 < x1 = Octantes 1 e 8
            DrawPixelLineX(pixel_0, pixel_1);
        }
    } else {
        // delta_y > delta_x = Octantes 2, 3, 6 e 7
        // y0 > y1 = Octantes 6 e 7
        if (pixel_0.y > pixel_1.y) {
            DrawPixelLineY(pixel_1, pixel_0);
        } else {
            // y0 < y1 = Octantes 2 e 3
            DrawPixelLineY(pixel_0, pixel_1);
        }
    }
}

function DrawTriangle(x0, y0, x1, y1, x2, y2, color_0, color_1, color_2) {
    // Encapsulamento para facilitar as operações
    const pixel_0 = new Pixel(x0, y0, color_0);
    const pixel_1 = new Pixel(x1, y1, color_1);
    const pixel_2 = new Pixel(x2, y2, color_2);

    // Invoca a função DrawLine para desenhar o triângulo
    DrawLine(pixel_0, pixel_1);
    DrawLine(pixel_1, pixel_2);
    DrawLine(pixel_2, pixel_0);
}

function MidPointLineAlgorithm(x0, y0, x1, y1, color_0, color_1) {
    // Encapsulamento para facilitar as operações
    const pixel_0 = new Pixel(x0, y0, color_0);
    const pixel_1 = new Pixel(x1, y1, color_1);

    // Invoca a função DrawLine para desenhar os pixels
    DrawLine(pixel_0, pixel_1);
}