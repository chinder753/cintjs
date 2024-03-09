#!/bin/bash

cint_func_file=${1}
if [ $# == 0 ]; then
  cint_func_file="cint_intor_all.txt"
elif [ $# -gt 1 ]; then
  exit
fi
out_func=""
for x in $(cat ./cint_basic.txt); do
    out_func=${out_func}"_"${x}"\n"
done
for x in $(cat ${cint_func_file}); do
    out_func=${out_func}"_"${x}"_optimizer\n"
    out_func=${out_func}"_"${x}"_cart\n"
    out_func=${out_func}"_"${x}"_sph\n"
    out_func=${out_func}"_"${x}"_spinor\n"
done
echo -e ${out_func} > ../../lib/libcint/func.txt