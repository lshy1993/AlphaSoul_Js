/* eslint-disable */

const vertexShaderSrc = `
void main(){
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
}`;

const fragmentShaderSrc = `
void main(){
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

class CanvasDrawer {
    constructor(canvas){
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        this.initShader(this.gl);
        this.init();
    }

    initShader(gl) {
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
        gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
        gl.compileShader(vertexShader);// 编译定点着色器
    
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
        gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
        gl.compileShader(fragmentShader);// 编译片段着色器
    
        var shaderProgram = gl.createProgram();// 创建着色器程序
        gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
        gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
        gl.linkProgram(shaderProgram);// 链接程序
        gl.useProgram(shaderProgram);//使用着色器
    }


    init(){
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);// 指定清空canvas的颜色
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);// 清空canvas
        this.gl.drawArrays(this.gl.POINTS, 0, 1);
    }

}

export { CanvasDrawer };
