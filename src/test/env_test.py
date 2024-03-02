import pyscf
from scipy.linalg import eigh


O2 = pyscf.gto.M(atom="H 0.0 0.5 0.0;H 0.0 -0.5 0.0; O 0.0 0.0 0.0", basis="sto-3g")
print("atm")
print(O2._atm)
print()

print("bas")
print(O2._bas)
print()

print("env")
print(O2._env)
print()

print("int1e_ovlp_cart")
ovlp = O2.intor("int1e_ovlp_cart")
print(ovlp.shape)
print(ovlp)
print()

print("H_core")
hf = pyscf.scf.RHF(O2)
print(hf.get_hcore())
print()

print("H_core guess")
print(eigh(hf.get_hcore(), ovlp))
print(hf.init_guess_by_1e())
print()


