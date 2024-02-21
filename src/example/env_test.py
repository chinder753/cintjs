import pyscf

NORMALIZE_GTO = False

O2 = pyscf.gto.M(atom="H 0.0 0.5 0.0; O 0.0 0.0 0.0;H 0.0 -0.5 0.0", basis="sto-3g")
print(O2._atm)
print(O2._bas)
print(O2._env)

