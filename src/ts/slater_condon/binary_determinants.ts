export { BinaryDeterminant };



class BinaryDeterminant{
    constructor(nocc: number, nvir: number){
        let occ_bytes = Math.ceil(nocc / 8)
            , vir_bytes = Math.ceil(nvir / 8)
            , obrit = new Uint8Array(2 * (occ_bytes + vir_bytes))
            , begin_offset = 0
            , end_offset = occ_bytes;
        this.alpha_occ = obrit.subarray(begin_offset, end_offset);
        begin_offset = end_offset;
        end_offset += occ_bytes;
        this.beta_occ = obrit.subarray(begin_offset, end_offset);
        begin_offset = end_offset;
        end_offset += occ_bytes;
        this.alpha_vir = obrit.subarray(begin_offset, end_offset);
        begin_offset = end_offset;
        end_offset += vir_bytes;
        this.beta_vir = obrit.subarray(begin_offset, end_offset);
    }

    private alpha_occ: Uint8Array;
    private alpha_vir: Uint8Array;
    private beta_occ: Uint8Array;
    private beta_vir: Uint8Array;

    public activate(occ: number, vir: number){

    }
}
