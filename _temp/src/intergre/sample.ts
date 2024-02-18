
// start form 0.0
function linear_mesh(end: number, point: number){
    return new Float64Array([...Array(point).keys()]).map(x => end / point * x);
}

function single_ao_value(coordinates_power_list: Float64Array[], angular_momentum: number, exponents: number, coefficients: number){
    let ao_value: Float64Array = new Float64Array(coordinates_power_list[1].length);
    if(angular_momentum == 0){
        ao_value.forEach((v, i) => {
            ao_value[i] = coefficients * Math.exp(-exponents * coordinates_power_list[1][i]);
        });
    }else{
        ao_value.forEach((v, i) => {
            ao_value[i] = coefficients * coordinates_power_list[angular_momentum-1][i] * Math.exp(-exponents * coordinates_power_list[1][i]);
        });
    }
    return ao_value;
}
