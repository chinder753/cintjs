```
npm run build
```

or

```bash
git submodule init
git submodule update


###
# generate func.txt
###
cd tools/
python3 get_func.py
cd ..
cp ./tools/func.txt lib/libcint


###
# compile libcint to wasm
###
cd lib/libcint
mkdir build
cd build
emcmake cmake ..
emmake make -j
emcc libcint.a -o libcint.mjs --emit-symbol-map -O3 -MODULARIZE=1 -sALLOW_MEMORY_GROWTH -sEXPORTED_FUNCTIONS=@../func.txt


cd ../../../
npm install
cp lib/libcint/build/libcint.mjs src/libcint
tsc
cp lib/libcint/build/libcint.wasm dist/libcint
```
