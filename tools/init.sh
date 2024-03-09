#!/bin/bash

cd ..
git submodule init
git submodule update
npm install
cd tools/cint_func
bash gen_func.sh
cd ../xc_func
bash gen_func.sh