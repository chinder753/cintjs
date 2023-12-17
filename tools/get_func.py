output_name = "libcint_hf"
cint_func: str = "./hf.h"

cm = f"emcc libcint.a -o {output_name}.cjs -sWASM=1 --emit-symbol-map -O3 -MODULARIZE=1 -sALLOW_MEMORY_GROWTH"


other_func = ["malloc", "free"
    , "CINTlen_cart", "CINTlen_spinor"
    , "CINTcgtos_cart", "CINTcgtos_spheric", "CINTcgtos_spinor"
    , "CINTcgto_cart", "CINTcgto_spheric", "CINTcgto_spinor", "CINTtot_pgto_spheric"
    , "CINTtot_pgto_spinor", "CINTtot_cgto_cart", "CINTtot_cgto_spheric", "CINTtot_cgto_spinor"
    , "CINTshells_cart_offset", "CINTshells_spheric_offset", "CINTshells_spinor_offset"
    , "CINTc2s_bra_sph", "CINTc2s_ket_sph", "CINTc2s_ket_sph1"
    , "CINTgto_norm"
    , "CINTinit_2e_optimizer", "CINTinit_optimizer"
    , "CINTdel_2e_optimizer", "CINTdel_optimizer"
    , "CINTc2s_ket_spinor_sf1", "CINTc2s_iket_spinor_sf1"
    , "CINTc2s_ket_spinor_si1", "CINTc2s_iket_spinor_si1"]


for i, x in enumerate(other_func):
    other_func[i] = f"_{x}"

func_lines: list[str] = open(cint_func, encoding="utf-8").readlines()
all_func = []
for line in func_lines:
    if line.find("extern CINTOptimizerFunction") == -1:
        continue
    line = line.split()[2].strip().strip(";")
    all_func.append(f"_{line}"
                    f",_{line.replace('optimizer', 'cart')}"
                    f",_{line.replace('optimizer', 'sph')}"
                    f",_{line.replace('optimizer', 'spinor')}")

cm = f"{cm} -sEXPORTED_FUNCTIONS={','.join(other_func)},{','.join(all_func)}"
print(cm)
# import os
# os.system(cm)
