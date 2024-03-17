import pyscf, pyscf.gto, pyscf.df
import numpy
import scipy.linalg

bas_name = "sto-3g"
aux_bas_name = "def2-universal-jkfit"



h2o = pyscf.gto.M(atom="H 0.0 0.5 0.0;H 0.0 -0.5 0.0;O 0.0 0.0 0.0", basis=bas_name)
h2o_aux: pyscf.gto.Mole = pyscf.df.addons.make_auxmol(h2o, aux_bas_name)

nbas = h2o.nbas
nbas_aux = h2o_aux.nbas
print(f'nbas: {nbas} = {int(pyscf.gto.M(atom="H 0.0 0.0 0.0; H 0.0 0.0 1.0", basis=bas_name).nbas / 2)} * 2 + {int(pyscf.gto.M(atom="O 0.0 0.0 0.0; O 0.0 0.0 1.0", basis=bas_name).nbas / 2)} * 1\n'
      f'nbas_aux: {nbas_aux} = {int(pyscf.gto.M(atom="H 0.0 0.0 0.0; H 0.0 0.0 1.0", basis=aux_bas_name).nbas / 2)} * 2 + {int(pyscf.gto.M(atom="O 0.0 0.0 0.0; O 0.0 0.0 1.0", basis=aux_bas_name).nbas / 2)} * 1\n'
      f'nao: {h2o.nao}\nnao_aux: {h2o_aux.nao}\n')




bas_start = 0
bas_end = nbas
aux_start = nbas
aux_end = nbas + nbas_aux

atm_all, bas_all, env_all = pyscf.gto.conc_env(h2o._atm, h2o._bas, h2o._env
                                               , h2o_aux._atm, h2o_aux._bas, h2o_aux._env)
i3c2e = pyscf.gto.moleintor.getints("int3c2e_cart", atm_all, bas_all, env_all
                                                   , shls_slice = [bas_start, bas_end, bas_start, bas_end, aux_start, aux_end])
i2c2e = pyscf.gto.moleintor.getints("int2c2e_cart", atm_all, bas_all, env_all
                                                   , shls_slice = [aux_start, aux_end, aux_start, aux_end])
print(f"i3c2e: {i3c2e.shape}\ni: [{bas_start}, {bas_end}]\nj: [{bas_start}, {bas_end}]\nk: [{aux_start}, {aux_end}]\n"
      "\n"
      f"i2c2e: {i2c2e.shape}\ni: [{aux_start}, {aux_end}]\nj: [{aux_start}, {aux_end}]\n")



i2c2e_inv = scipy.linalg.inv(i2c2e)
d_tensor = numpy.einsum("pqP, PQ -> pqQ", i3c2e, i2c2e_inv)
print(f"d_tensor: {d_tensor.shape}\n")

eri = numpy.einsum("ijp, klq, pq -> ijkl", d_tensor, d_tensor, i2c2e)
eri_2 = numpy.einsum("ijp, klp -> ijkl", d_tensor, i3c2e)
eri_3 = numpy.einsum("ijp, klq, pq -> ijkl", i3c2e, i3c2e, i2c2e_inv)
print(f'ijp, klq, pq -> ijkl:\t{numpy.abs(eri - h2o.intor("int2e_cart")).max()}\n'
      f'ijp, klp -> ijkl:\t{numpy.abs(eri_2 - h2o.intor("int2e_cart")).max()}\n'
      f'ijp, klq, pq -> ijkl:\t{numpy.abs(eri_3 - h2o.intor("int2e_cart")).max()}\n')
