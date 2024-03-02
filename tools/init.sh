git submodule init
git submodule update

cd tools/
python3 get_func.py
cd ..
cp ./tools/func.txt lib/libcint