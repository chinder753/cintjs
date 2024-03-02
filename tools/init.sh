#!/bin/bash

git submodule init
git submodule update

cd tools/
cint_func=${1}
out_func=""
for x in $(cat ./func_basis.txt)
do
    out_func=${out_func}"_"${x}"\n"
done
for x in $(cat ${cint_func})
do
    out_func=${out_func}"_"${x}"_optimizer\n"
    out_func=${out_func}"_"${x}"_cart\n"
    out_func=${out_func}"_"${x}"_sph\n"
    out_func=${out_func}"_"${x}"_spinor\n"
done
echo -e ${out_func} > ../lib/libcint/func.txt

cd ..
npm install