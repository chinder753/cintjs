import { GPU, GPUTextureType, Input, Texture, TextureArrayOutput, ThreadKernelVariable } from "gpu.js";

export function fft_gpu(data: Float32Array){
    const NPOINTS = data.length/2;
    const NPOINTS_HALF = NPOINTS/2;
    const gpu = new GPU();


    let move_to_gpu =gpu.createKernel(function (data: Float32Array, npoints: number){
        let index: number = this.thread.x*2;

        if(this.thread.x < npoints/2) {
            // return (this.thread.x%2 == 0) ? [index/2, 0] : [(index + npoints - 2)/2, 0];
            return (this.thread.x%2 == 0) ? [data[index], data[index+1]] : [data[index + npoints - 2], data[index + npoints - 1]];
        }else{
            // return (this.thread.x%2 == 0) ? [(index - npoints + 2)/2, 0] : [index/2, 0];
            return (this.thread.x%2 == 0) ? [data[index - npoints + 2], data[index - npoints + 3]] : [data[index], data[index+1]];
        }
    }).setPipeline(true).setImmutable(true).setOutput([NPOINTS]);


    let omega = gpu.createKernel(function (degree: number){
        return [Math.cos(degree * this.thread.x), Math.sin(degree * this.thread.x)];
    }).setPipeline(true).setDynamicOutput(true);


    let radix2 = gpu.createKernel(function (data: Float32Array[], omega_list: Float32Array[], block_size: number, fftStep: number) {
        let num_index: number = this.thread.x % block_size
            , o_index: number = 0, e_index: number = 0
            , omega_real: number = 0, omega_imag: number = 0;
        if(num_index<fftStep){
            e_index = this.thread.x;
            o_index = e_index + fftStep;
            // omega = omega_list[num_index];
            // return omega_list[num_index];
        }else{
            o_index = this.thread.x;
            e_index = o_index - fftStep;
            // return omega_list[num_index-fftStep];
            // omega = omega_list[num_index-fftStep];
        }
        return omega_list[111111111111111]

        // // e = complex_data[e_index], o = complex_data[o_index]
        // let e = data[e_index]
        //     , e_real = e[0], e_imag = e[1]
        //     , o = data[o_index]
        //     , o_real = o[0], o_imag = o[1];
        // // o *= omega_list[num_index]
        // o_real = o_real * omega_real - o_imag * omega_imag
        // o_imag = o_real * omega_imag + o_imag * omega_real;
        // if(num_index<fftStep) {
        //     return [e_real + o_real, e_imag + o_imag];  // complex_data[e_index] = e + o
        // }else{
        //     return [e_real - o_real, e_imag - o_imag];  // complex_data[o_index] = e - o
        // }
    }).setPipeline(true).setImmutable(true).setOutput([NPOINTS]);



    let result: Texture = <Texture>move_to_gpu(data, NPOINTS);

    let fftStep: number = 1;
    let block_size: number = 2;
    let nblock: number = NPOINTS_HALF;

    while(nblock>=1){
        omega.setOutput([block_size/2]);

        // -2 \pi \frac{1}{2^{n_{block_size}}}
        let degree: number = -2*Math.PI/block_size
            , omega_list = <Texture>omega(degree)
            , new_result = <Texture>radix2(result, omega_list, block_size, fftStep);
        console.log()
        result.delete();
        result = new_result;
        console.log(fftStep)
        console.log(omega_list.toArray())
        console.log(result.toArray())

        nblock /= 2;
        fftStep = block_size;
        block_size *= 2;
    }

    move_to_gpu.destroy();
    omega.destroy();
    radix2.destroy();
    return "ok";
}

