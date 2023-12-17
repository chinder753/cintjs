export { BSE };

import { Basis } from "./basis.js";
import { FixedLengthArray } from "./extype.js";



type ShellInfo<NP extends number, NC extends number> = {
    function_type: string;
    region: string;
    angular_momentum: FixedLengthArray<number, NP>;
    exponents: FixedLengthArray<number, NP>;
    coefficients: FixedLengthArray<FixedLengthArray<number, NP>, NC>;
}

type ElementInfo = {
    references: string[];
    electron_shells: ShellInfo<number, number>[];
}



class BSE {
    private molssi_bse_schema: {
        schema_type: string;
        schema_version: string;
    };
    private description: string;
    private data_source: string;
    private elements: Map<string, ElementInfo>;

    constructor(json_text: string) {
        let basis = <BSE>JSON.parse(json_text);
        this.molssi_bse_schema = basis.molssi_bse_schema;
        this.description = basis.description;
        this.data_source = basis.data_source;
        this.elements = new Map(Object.entries(basis.elements));
    }

    public getElementInfoFor(element: string | number): ElementInfo {
        if (typeof element == "number") element = element.toString();
        if (!this.elements.has(element)) throw `没有${element}号元素的基组`;
        return <ElementInfo>this.elements.get(element);
    }

    public getBasisFor(element: string | number, kappa: number = 0): Basis[] {
        if (typeof element == "number") element = element.toString();
        if (!this.elements.has(element)) throw `没有${element}号元素的基组`;

        let nuclear_charge = parseFloat(element);
        let basis_list: Basis[] = [];
        (<ElementInfo>this.elements.get(element)).electron_shells.forEach((shell: ShellInfo<number, number>): void => {
            basis_list.push(
                new Basis(nuclear_charge, shell.angular_momentum
                    , {
                        exponents: shell.exponents,
                        coefficients: shell.coefficients
                    }, kappa));
        });
        return basis_list;
    }

}
