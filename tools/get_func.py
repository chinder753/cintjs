output_name = "libcint"
cint_func = "./hf.txt"

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

int_func = []
for line in open(cint_func, encoding="utf-8").readlines():
    line = line.strip()
    int_func.append(f"_{line}_optimizer"+"\n"
                    f"_{line}_cart"+"\n"
                    f"_{line}_sph"+"\n"
                    f"_{line}_spinor"+"\n")

cm = '\n'.join(other_func) + '\n' + ''.join(int_func)
with open("func.txt", "w") as file:
    file.write(cm)
