export { Atom };



class Atom {
    public nuclear_charge: number;
    public nuclear_modle: number;
    public nuclear_distribution: number[] | undefined;
    public coordinates: number[];

    public offset_coordinates: number | undefined;
    public offset_nuclear_distribution: number | undefined;

    constructor(nuclear_charge: number, nuclear_modle: number, coordinates: number[], nuclear_distribution: number[] | undefined = undefined) {
        this.nuclear_charge = nuclear_charge;
        this.nuclear_modle = nuclear_modle;
        this.nuclear_distribution = nuclear_distribution;
        this.coordinates = coordinates;

        this.offset_coordinates = undefined;
        this.offset_nuclear_distribution = typeof nuclear_distribution == "undefined" ? 0 : undefined;
    }

    public generateATM(): Int32Array {
        if (typeof this.offset_coordinates == "undefined") throw "";
        // if(typeof this.offset_nuclear_distribution == "undefined" && typeof this.nuclear_distribution != "undefined") throw "";
        if (typeof this.offset_nuclear_distribution == "undefined") {
            if (typeof this.nuclear_distribution != "undefined") throw "";
            this.offset_nuclear_distribution = 0;
        }
        return new Int32Array([
            this.nuclear_charge
            , this.offset_coordinates
            , this.nuclear_modle
            , <number>this.offset_nuclear_distribution
            , 0, 0
        ]);
    }
}
