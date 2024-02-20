


function fft(data: Float64Array): Float64Array{
    const NPOINT = data.length/2;
    const NPOINTS_HALF = data.length/4;

    for(let i=2; i<NPOINT; i+=4){
        let [t_real, t_imag] = [data[i], data[i+1]];
        [data[i], data[i+1]] = [data[i+NPOINTS_HALF-2], data[i+NPOINTS_HALF-1]];
        [data[i+NPOINTS_HALF-2], data[i+NPOINTS_HALF-1]] = [t_real, t_imag];
    }

    let fftStep: number = 1;
    let block_size: number = 2;
    let nblock: number = NPOINTS_HALF;

    while(nblock>=1){
        let degree: number = -2*Math.PI/block_size  // -2 \pi \frac{1}{n_{block_size}}
            , omega_list: Float64Array = new Float64Array(block_size)  // half of block
            , block_offset_list: Int32Array = new Int32Array(nblock).map((v, block_index) => block_index*block_size);
        // omega
        for(let i=0; i<block_size; i+=2){
            [omega_list[i], omega_list[i+1]] = [Math.cos(degree * i/2), Math.sin(degree * i/2)];
        }
        // (block_index, num_index), two data each point
        for(let num_index=0; num_index<fftStep; num_index++){
            // omega = omega_list[num_index]
            let [omega_real, omega_imag] = [omega_list[num_index*2], omega_list[num_index*2+1]];
            for(let block_index=0; block_index<nblock; block_index++){
                let  e_index = block_offset_list[block_index]+num_index
                    , o_index = e_index+fftStep
                    // e = data[e_index]
                    , [e_real, e_imag ] = [data[e_index*2], data[e_index*2+1]]
                    // o = data[o_index]
                    , [o_real, o_imag] = [ data[o_index*2], data[o_index*2+1]];
                // o *= omega_list[num_index]
                [o_real, o_imag] = [o_real * omega_real - o_imag * omega_imag, o_real * omega_imag + o_imag * omega_real];
                // data[e_index] = e + o
                data[e_index*2] = e_real + o_real;
                data[e_index*2+1] = e_imag + o_imag;
                // data[o_index] = e - o
                data[o_index*2] = e_real - o_real;
                data[o_index*2+1] = e_imag - o_imag;
            }
        }
        nblock /= 2;
        fftStep = block_size;
        block_size *= 2;
    }
    return data;
}
