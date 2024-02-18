import numpy
# import time

# NPOINT = 2**23

# # data = range(NPOINT)
# data = numpy.cos(numpy.array(range(NPOINT))/NPOINT)

# a = time.time()
# numpy.fft.fft(data)
# print(time.time() - a)

# a = numpy.array([  [1, 1, 1]
#                  , [1, 2, 2]
#                  , [1, 2, 3]])

# print(numpy.linalg.eig(a))

# a = numpy.array([
#     [1, 0, 1, 0]
#     , [0, 1, 0, 1]
#     , [0, 0, 1, 1]
#     , [1, 1, 0, 0]
# ])
# b = numpy.array([150, 130, 240, 40])
a = numpy.array([
    [1, 0, 1]
    , [0, 1, -1]
    , [1, 1, 0]
])
b = numpy.array([150, -90, 40])
 
print(numpy.linalg.solve(a, b))
