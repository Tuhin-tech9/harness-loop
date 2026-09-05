l1=["tuhin","jhondoe","naocha"]


question="helloj"


block=any(p in question for p in l1)


if block:
    print("true")
else:
    print("false")