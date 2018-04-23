/**
 * Created by loiuslv on 2018/4/10.
 * js基础知识点实例测试与分析
 * 数据类型
 一.数据类型
    1.数字 number
    2.字符串 string
    3.布尔值 boolean
    4.函数  function
    5.对象  object
        []
        {}
        null
    6.未定义  underfined

 二.数据类型转换
    1.显式类型转换(强制类型转换)
        Number 整体转换
        parseInt 遍历字符串,一个字符一个字符转换,遇到非数字时候中断,但是识别"+ - 空格"之类
        parestFloat
    2.隐式类型转换
        加减乘除 运算过后自动转换为数字 以最后单元数据类型为标准 例如"200"-3 即为number
    ...

    isNaN工作原理即先通过Number()计算一次 如果返回NuN则返回true 如果不是NuN 则false
 */
 var Json ={name:'lvjun',data:333};
    console.log(typeof Json.data);
 var a = null;
    console.log(isNaN(NaN));