import {JsonBasis} from "./extype";


export {BSE};

type ReturnJsonBasis<T extends string | Set<string>> = T extends string ? JsonBasis[] : JsonBasis[][];

type ShellInfo = {
    function_type: string;
    region: string;
    angular_momentum: number[];
    exponents: string[];
    coefficients: string[][];
}

type ElementInfo = {
    references: string[];
    electron_shells: ShellInfo[];
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

    public getElementInfoFor(element: string): ElementInfo {
        if (!this.elements.has(element)) throw `没有${element}号元素的基组`;
        return <ElementInfo>this.elements.get(element);
    }


    public getJsonBasis<T extends string | Set<string>>(element_num: T): ReturnJsonBasis<T> {
        function getOneJsonBasis(element_info: ElementInfo): JsonBasis[] {
            let json_basis: JsonBasis[] = [];
            element_info.electron_shells.forEach((shell_info: ShellInfo): void => {
                json_basis.push({
                    KAPPA_OF: 0
                    , angular_momentum: shell_info.angular_momentum
                    , exponents: shell_info.exponents.map(Number)
                    , coefficients: shell_info.coefficients.map((v) => v.map(Number))
                });
            });
            return json_basis;
        }

        let json_basis: ReturnJsonBasis<T> = [];

        if (typeof element_num == "string") {
            let element_info = this.getElementInfoFor(element_num);
            // @ts-ignore
            json_basis = getOneJsonBasis(element_info);
        } else {
            element_num.forEach((atm_num: string) => {
                // @ts-ignore
                let element_info = this.getElementInfoFor(atm_num);
                // @ts-ignore
                json_basis.push(getOneJsonBasis(element_info));
            })
        }
        return json_basis;
    }

}
