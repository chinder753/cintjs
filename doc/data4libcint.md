# 为libcint构建输入数据

- [为libcint构建输入数据](#为libcint构建输入数据)
  - [概述](#概述)
  - [积分函数的调用](#积分函数的调用)
  - [shls](#shls)
  - [out](#out)
  - [atm](#atm)
  - [bas](#bas)
  - [env](#env)

------------------------

## 概述

libcint输入的数据之间耦合度极高，再加上qiming写的文档和示例比较抽象，直接使用libcint有不小的难度。以下是使用libcint获取笛卡尔坐标系下电子积分的大致流程，

```mermaid
flowchart TD
    1[准备atm,env数组];
    2[构建基函数的bas数组];
    3[将参与积分的基函数在bas数组中的位置存入shls数组,需要注意顺序];
4[调用CINTcgto_cart获取out数组的大小并创建out数组];
5[调用CINTIntegralFunction拿到相应积分];
1 --> 2;
2 --> 3;
3 --> 4;
4 --> 5;
5 --> 2;
```

其中最麻烦的是各个数组中offset的准备。当然，如果只是尝试一下，可以先将env构建好并存下offset后再准备其他数组。bas数组也可以提前全部构建出来，而不是需要哪个构建哪个。

------------------------

## 积分函数的调用

我们先看CINTIntegralFunction的调用形式，了解下我们需要准备哪些数据，以下是libcint中积分函数的通用形式，

```c
typedef CACHE_SIZE_T CINTIntegralFunction(double *out, FINT *dims, FINT *shls,
                                  FINT *atm, FINT natm, FINT *bas, FINT nbas, double *env,
                                  CINTOpt *opt, double *cache);
```

| 接口方向 |  形参   |   类型   | 数组 | 可选 |                作用                |
|:----:|:-----:|:------:|:--:|:---|:--------------------------------:|
|  O   |  out  | double | ✔  | ❌  |            获取函数输出的积分             |
|  I   | dims  |  int   | ✔  | ✔  |             out数组大小              |
|  I   | shls  |  int   | ✔  | ❌  |         指定哪些基函数参与积分，及其顺序         |
|  I   |  atm  |  int   | ✔  | ❌  |            储存原核相关的信息             |
|  I   | natm  |  int   | ❌  | ❌  |           说明atm中有多少个原子           |
|  I   |  bas  |  int   | ✔  | ❌  |            储存基函数相关信息             |
|  I   | nbas  |  int   | ❌  | ❌  |          说明bas中有多少个基函数           |
|  I   |  env  | double | ✔  | ❌  |       储存原子坐标、基组参数，以及一些全局变量       |
|  I   |  opt  |  int   | ✔  | ✔  |              优化积分效率              |
|  I   | cache |  int   | ✔  | ✔  | 将一些数据放入其中，以便CPU把他们存在cache里提高计算速度 |

其中整型的字节数一般来说是[32bits](https://en.cppreference.com/w/c/language/arithmetic_types)。

从上表中可以看到，需要准备shls、atm、bas、env四个数组输入，还需要准备out获取输出，接下来逐个进行介绍。

------------------------

## shls

该数组储存的是参与积分的基函数的索引，比如bas中储存了一些基函数，我们想计算第一个和第四个的重叠积分，那么shls就可以写成（数组索引从0开始）

```c
shls = {0, 3};
```

想计算第一、二、四、五个基函数的eri，就写成

```c 
shls = {0, 1, 3, 4};
```

但计算eri的时候会涉及到基函数顺序的问题，如$(ij|kl)$，在shls中就可以写成

```c
shls = {i, j, k, l};
```

简单来说，就是公式中的基函数顺序与shls中的顺序是一样的。当有些积分涉及到基函数作用了算符时就需要查看libcint中include/cint_funcs.h文件，每个函数的开头都有相应的注释，如动能积分

```c
/* <i|OVLP |P DOT P j> */
extern CINTOptimizerFunction int1e_kin_optimizer;
extern CINTIntegralFunction int1e_kin_cart;
extern CINTIntegralFunction int1e_kin_sph;
extern CINTIntegralFunction int1e_kin_spinor;
```

对应的数学公式是

$$
(i|\vec{p} \cdot \vec{p} \ j)
$$

调用时，shls需要写成

```c
shls = {i, j}
```

可以在libcint的README.rst中找到各种算符的别称，下表列出来了左矢和右矢中支持算符的别称及其数学符号，

| 别称 | 算符 |
| :--: | :--: |
| p |  $-i \nabla$ |
| ip |  $\nabla$ |
| r0 |  $\vec{r} - (0,0,0)$ |
| rc |  $\vec{r} - \vec{R}_(env[PTR\_COMMON\_ORIG])$ |
| ri |  $\vec{r} - \vec{R}_i$ |
| rj |  $\vec{r} - \vec{R}_j$ |
| rk |  $\vec{r} - \vec{R}_k$ |
| rl |  $\vec{r} - \vec{R}_l$ |
| r |  $ri/rj/rk/rl$ |
| g |  $\frac{i}{2} (\vec{R}_{bra} - \vec{R}_{ket}) \times \vec{r}$ |
| sigma |  three pauli matrix|
| dot | $\cdot$|
| cross | $\times$|

以及支持的单电子算符和双电子算符，

| 别称 | 算符 |
| :--: | :--: |
|rinv | $\frac{1}{ \vec{r} - \vec{R}_(env[PTR\_RINV\_ORIG]) }$|
|nuc | $\frac{\sum_N Z_N}{\|\vec{r} - \vec{R}_N\|}$|
|nabla-rinv | $\nabla (\frac{1}{\|\vec{r} - \vec{R}_(env[PTR\_RINV\_ORIG])\|})$|
|gaunt | $\frac{\alpha_i \cdot \alpha_j}{\|\vec{r}_i - \vec{r}_j\|}$|
|breit | $- \frac{1}{2} \frac{\alpha_i \cdot \alpha_j}{\|\vec{r}_i - \vec{r}_j\|} - \frac{1}{2} \frac{\alpha_i \cdot r_{ij} \alpha_j \cdot r_{ij}}{\|\vec{r}_i - \vec{r}_j\|^3}$|


式中的env[PTR_COMMON_ORIG]是env数组中的一个参数，会在后续章节中介绍。

------------------------

## out

计算得到的out数组是个多维数组，其维度与shls的长度相同，但每个维度的长度需要通过调用函数获得。以STO为例，我们想计算bas中第i个基组和第j个基组在笛卡尔坐标系下的动能积分，也就是计算

$$
(i|\vec{p} \cdot \vec{p} \ j)
$$

那么计算得到out的维度就是2。如果基组$i$的角动量等于1，即基组$i$是个P型轨道，基组$j$的角动量等于2，即基组$j$是个D型轨道，各维度的长度如下

```c
int shls = {i, j};

int di = CINTcgto_cart(i, bas); // 3 p_x p_y p_z
int dj = CINTcgto_cart(j, bas); // 5 d_{xy} d_{xz} d_{yx} d_{x^2-y^2} d_{z^2}（并不一定是按该顺序排列，都记成j0,j1...就行了）
```

out数据的排布就是

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | ... |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| i0, j0 | i0, j1 | i0, j2 | i0, j3 | i0, j4 | i1, j0 | i0, j1 | ... |

简单来讲，就是shls的长度就是out的维度（如果把out当作一个多维数组看）。输出的数据排布，从shls中最后的一个开始递增，比如上例中就从j开始增加，当增加到dj时j就归零，i加上1。

如果想将out转化为多维数组，需要注意所使用语言的数组储存是列优先还是行优先。[C语言是行优先](https://en.cppreference.com/w/c/language/array)，因此可以将上例中的out数组声明为

```c
double out[di][dj];
```

对于其他的积分，可以参考如下，

```c
int shls_3c = {i, j, k};
double out_3c[di][dj][dk];

int shls_4c = {i, j, k, l};
double out_4c[di][dj][dk][dl];
```

注意，对于C语言，直接将out输入积分函数是不严谨的，编译器会出现警告甚至错误，对于如out[di][dj]，建议传入&out[0][0]。

这是因为out本质上指向的是out中第一个元素的指针。如果out是一个一维数组，那它指向的就是out[0]，也就是一个double；但对于高维数组，比如out[di][dj]，out其实是指向out[0]这个指针数组的指针，或者说out指向的是一个数组而不是double。

但是，调用out[0][2]与调用(&out[0][0])[0 * di + 2]是等效的（dj > 2），这是因为out的数据在内存上的分布是连续的，拿到&out[0][0]后就可以通过指针的偏移访问到其他全部元素。~~甚至segmentation fault~~

```c
double out[di][dj];
out[0][2] == (&out[0][0])[0 * di + 2]; // True
out[0][0] == out[0]; // error: invalid operands to binary == (have ‘double’ and ‘double *’)
```

------------------------

## atm

接下来正式进入输入数据的结构，先说一个相对简单的数组。atm中每六个元素表示一个原子的信息，以下两种定义方式在C语言中是等效的，

```c
/*
natm    总原子数
i       第i个原子
*/

/* 以下define已在cint.h中定义 */
#define CHARGE_OF       0
#define PTR_COORD       1
#define NUC_MOD_OF      2
#define PTR_ZETA        3
#define PTR_FRAC_CHARGE 4
#define RESERVE_ATMSLOT 5
#define ATM_SLOTS       6

/* 使用数组定义 */
int atm_array[natm*ATM_SLOTS];

atm_array[i * ATM_SLOTS + CHARGE_OF]          = ... ;
atm_array[i * ATM_SLOTS + PTR_COORD]          = ... ;
atm_array[i * ATM_SLOTS + NUC_MOD_OF]         = ... ;
atm_array[i * ATM_SLOTS + PTR_ZETA]           = ... ;
atm_array[i * ATM_SLOTS + PTR_FRAC_CHARGE]    = ... ;
atm_array[i * ATM_SLOTS + RESERVE_ATMSLOT]    = ... ;

/* 使用struct定义 */
struct{
    int CHARGE_OF      ;
    int PTR_COORD      ;
    int NUC_MOD_OF     ;
    int PTR_ZETA       ;
    int PTR_FRAC_CHARGE;
    int RESERVE_ATMSLOT;
} atm_struct[natm];

atm_struct[i].CHARGE_OF        = ... ;
atm_struct[i].PTR_COORD        = ... ;
atm_struct[i].NUC_MOD_OF       = ... ;
atm_struct[i].PTR_ZETA         = ... ;
atm_struct[i].PTR_FRAC_CHARGE  = ... ;
atm_struct[i].RESERVE_ATMSLOT  = ... ;

```

下表是各偏移量的含义

| 索引 | 名称 | 作用 |
| :--: | :--: | :-- |
| 0 | CHARGE_OF | 原子电荷数 |
| 1 | PTR_COORD | 原子坐标在env中的位置（数组的索引） |
| 2 | NUC_MOD_OF | |
| 3 | PTR_ZETA | |
| 4 | PTR_FRAC_CHARGE | |
| 5 | RESERVE_ATMSLOT | 保留位 |

------------------------

## bas

bas的定义与atm类似，bas中每八个元素表示一个基组的信息，以下两种定义方式在C语言中是等效的，

```c
/*
nbas    总原子数
i       第i个原子
*/

/* 以下define已在cint.h中定义 */
#define ATOM_OF         0
#define ANG_OF          1
#define NPRIM_OF        2
#define NCTR_OF         3
#define KAPPA_OF        4
#define PTR_EXP         5
#define PTR_COEFF       6
#define RESERVE_BASLOT  7
#define BAS_SLOTS       8

/* 使用数组定义 */
int bas_array[natom * ATM_SLOTS];
bas_array[i * BAS_SLOTS + ATOM_OF] = ... ;
bas_array[i * BAS_SLOTS + ANG_OF] = ... ;
bas_array[i * BAS_SLOTS + NPRIM_OF] = ... ;
bas_array[i * BAS_SLOTS + NCTR_OF] = ... ;
bas_array[i * BAS_SLOTS + KAPPA_OF] = ... ;
bas_array[i * BAS_SLOTS + PTR_EXP] = ... ;
bas_array[i * BAS_SLOTS + PTR_COEFF] = ... ;
bas_array[i * BAS_SLOTS + RESERVE_BASLOT] = ... ;

/* 使用struct定义 */
struct{
    int ATOM_OF;
    int ANG_OF;
    int NPRIM_OF;
    int NCTR_OF;
    int KAPPA_OF;
    int PTR_EXP;
    int PTR_COEFF;
    int RESERVE_BASLOT;
} bas_struct[n*BAS_SLOTS];

bas_struct.ATOM_OF = ... ;
bas_struct.ANG_OF = ... ;
bas_struct.NPRIM_OF = ... ;
bas_struct.NCTR_OF = ... ;
bas_struct.KAPPA_OF = ... ;
bas_struct.PTR_EXP = ... ;
bas_struct.PTR_COEFF = ... ;
bas_struct.RESERVE_BASLOT = ... ;

```

下表是各偏移量的含义

| 索引 | 名称 | 作用 |
| :--: | :--: | :-- |
| 0 | ATOM_OF | 使用这个bas的原子在atm中的位置（第几个原子，不是数组索引） |
| 1 | ANG_OF | 基组的角动量 |
| 2 | NPRIM_OF | PGTO的数量 |
| 3 | NCTR_OF | CGTO的数量 |
| 4 | KAPPA_OF | |
| 5 | PTR_EXP | PGTO指数在env中的位置（数组索引） |
| 6 | PTR_COEFF | CGTO指数在env中的位置（数组索引） |
| 7 | RESERVE_BASLOT | 保留位 |


------------------------

## env

env中储存了原子坐标、基组参数，以及一些全局变量。除前二十个元素有固定位置外，其他元素比较随意，只需要将某个数据的所有元素放在一起就行，比如某个原子的x,y,z坐标就必须放在一起，某个基组PGTO的系数必须放在一起，但CGTO的系数和PGTO的系数并不一定要放在一起。笔者建议用以下格式组织env，

```
┌[env] = 0
├─┬[global_parameters] = 0
│ ├──[PTR_EXPCUTOFF] = 0      // 积分prescreening的阈值，等于ln(threshold)，具体参考direct相关方法
│ ├──[PTR_COMMON_ORIG] = 1    // 积分的参考点，参考[shls](#shls)中的算符定义
│ ├──[PTR_RINV_ORIG] = 4      // $\frac{1}{\|r-R_O\|}$中的$R_O$
│ ├──[PTR_RINV_ZETA] = 7
│ ├──[PTR_RANGE_OMEGA] = 8      
│ ├──[PTR_F12_ZETA] = 9
│ ├──[PTR_GTG_ZETA] = 10
│ ├──[NGRIDS] = 11
│ └──[PTR_GRIDS] = 12
├─┬[atoms_coordinates] = 20
│ ├──[coordinates_0] = 0                        <= atm(PTR_COORD, 0)
│ ├── ...
│ ├──[coordinates_i] = i*3                      <= atm(PTR_COORD, i)
│ ├── ...
│ └──[coordinates_n] = n*3                      <= atm(PTR_COORD, n)
├─┬[basis_parameters] = 20+natm*3 
│ ├─┬[basis_0] = 0
│ │ ├──[exponents] = 0*bas(NPRIM_OF, 0)         <= bas(PTR_EXP, 0)
│ │ ├──[coefficients_1] = 1*bas(NPRIM_OF, 0)    <= bas(PTR_COEFF, 0)
│ │ ├── ...
│ │ ├──[coefficients_i] = i*bas(NPRIM_OF, 0) 
│ │ ├── ...
│ │ └──[coefficients_n] = n*bas(NPRIM_OF, 0) 
│ ├──[basis_1] = bas(NCTR_OF, 1)*bas(NPRIM_OF, 1)
│ ├── ...
│ ├─┬[basis_i] = \sum_{j=0}^{i-1} bas(NCTR_OF, j)*bas(NPRIM_OF, j)
│ │ ├──[exponents] = 0*bas(NPRIM_OF, i)         <= bas(PTR_EXP, i)
│ │ ├──[coefficients_1] = 1*bas(NPRIM_OF, i)    <= bas(PTR_COEFF, i)
│ │ ├── ...
│ │ ├──[coefficients_i]  = i*bas(NPRIM_OF, i)
│ │ ├── ...
│ │ └──[coefficients_n] = n*bas(NPRIM_OF, i)
│ ├── ...
│ └──[basis_n] = \sum_{j=0}^{n-1}bas(NCTR_OF, j)*bas(NPRIM_OF, j)
└──┬[other_data] = \sum_{j=0}^{n}bas(NCTR_OF, j)*bas(NPRIM_OF, j)
   └── ...
```

我们把每个横线都称为一个节点，用方括号括起来的文字用于说明该节点的作用，其等号后的数值是该节点相对于父节点的偏移量，箭头表示bas或atm里的哪个元素等于该节点的偏移量，该节点偏移量与下个节点偏移量的差就是该节点的长度。

如coordinates_i，代表第i个原子的坐标，其偏移量等于$0+20+i*3$，由于conrdinates每个节点的长度都是3，因此$env[0+20+i*3+0],env[0+20+i*3+1],env[0+20+i*3+2]$都是coordinates_i的元素。

全局变量的定义及其作用可以在cint.h中查询，不使用全局变量的时候建议全置0。
