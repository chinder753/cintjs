#!/bin/bash

xc_func_files=$*
if [ $# == 0 ]; then
    xc_func_files=( xc_lda.txt xc_gga.txt xc_mgga.txt )
fi
out_func=""
gen_fun(){
  for x in $(cat ${1}); do
      out_func=${out_func}"_"${x}"\n"
  done
}
gen_fun xc_reference.txt
gen_fun xc_funcinfo.txt
gen_fun xc_manage.txt
for file in ${xc_func_files[*]}; do
  gen_fun ${file}
done
echo -e ${out_func} > ../../lib/libxc/func.txt