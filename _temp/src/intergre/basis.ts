export { BSE, Basis as BasisGTO }

import "mathjs"
import { MathCollection, MathType, Matrix, exp, expm, matrix, pow, zeros } from "mathjs";

type Shell = {
    function_type:string;
    region:string;
    angular_momentum:number[];
    exponents:number[];
    coefficients:number[][];
}

type Element = {
    references:string[];
    shells:Shell[];
}

class BSE{
    private molssi_bse_schema:{
        schema_type:string;
        schema_version:string;
    };
    private description:string;
    private data_source:string;
    private elements:Map<string, Element>;

    constructor(json_text:string){
        let basis = <BSE>JSON.parse(json_text);
        this.molssi_bse_schema = basis.molssi_bse_schema;
        this.description = basis.description;
        this.data_source = basis.data_source;
        this.elements = new Map(Object.entries(basis.elements));
    }

    public getElementShellFor(element:string|number):Element{
        if(typeof element == "number") element = element.toString();
        if(!this.elements.has(element)) throw `没有${element}号元素的基组`;
        return <Element>this.elements.get(element);
    }

}



class CGTO{
    private _angular_momentum:number[];
    private exponents:number[];
    private coefficients:number[][];
    private exp_a:number;

    constructor(angular_momentum:number[], exponents:number[], coefficients:number[][]){
        this._angular_momentum = angular_momentum;
        this.exponents = exponents;
        this.coefficients = coefficients;

        this.exp_a = 0;
        coefficients.forEach((coefficient) => {
            this.exponents.forEach((value, index) => {
                this.exp_a += coefficient[index] * exp(value)
            });
        });
    }

    public static fromShell(shell:Shell){
        return new CGTO(shell.angular_momentum, shell.exponents, shell.coefficients);
    }

    public nomorlize(){

    }

    // r = r_A - r_B
    public value(angular_momentum:number, r:number, r_squre:number){
        
    }

    public get angular_momentum(){
        return this._angular_momentum;
    }

}



class Basis{
    private basis:Map<number, CGTO[]>;

    constructor(elements:number[], cgto:CGTO[][]){
        this.basis = new Map();
        elements.forEach((element, index) => {
            this.basis.set(element, cgto[index]);
        });
    }

    public static fromElementShell(elements:number[], element_shells:Element[]):Basis{
        let all_cgto:CGTO[][] = [];
        element_shells.forEach((element_shell) => {
            let cgto:CGTO[] = [];
            element_shell.shells.forEach((shell) => {
                cgto.push(CGTO.fromShell(shell));
            });
            all_cgto.push(cgto);
        });
        return new Basis(elements, all_cgto);
    }

}
