---
title: 'Leetcode351:两个数组交集'
date: 2021-02-05 19:48:05
toc: true
categories:
- leetcode
tags:
- leetcode
---
## 题目
给定两个数组，编写一个函数来计算它们的交集。 

示例 1：
```
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2,2]
```

示例 2:
```
输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[4,9]
 ```

说明：

* 输出结果中每个元素出现的次数，应与元素在两个数组中出现次数的最小值一致。
* 我们可以不考虑输出结果的顺序。

<!-- more -->

## 题解
1. ### 使用hashmap

### javascript 版本
```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
  let res = [];
  let map1 = new Map();
  let map2 = new Map();
  for(let item of nums1) {
      if(!map1.has(item)) map1.set(item, 0)
      map1.set(item, map1.get(item) + 1)
  }

  for(let item of nums2) {
      if(!map2.has(item)) map2.set(item, 0)
      map2.set(item, map2.get(item) + 1)
  }

  for(let item of map1.keys()) {
      if(map2.has(item)) {
        let key1num = map1.get(item);
        let key2num = map2.get(item);
        let num = key1num;
          if(key1num > key2num ) num = key2num;
        for(var i = 0; i < num; i++) res.push(item)
      }
  }
  return res;
};
```
上面的方法，使用了多余一个map，空间占比比较大

### 更新
```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
  if(nums1.length > nums2.length) return intersect(nums2, nums1)
  let res = [];
  let map = new Map();
  for(let item of nums1) {
      if(!map.has(item)) map.set(item, 0)
      map.set(item, map.get(item) + 1)
  }

  for(let item of nums2) {
      let count = map.get(item) || 0;
      if(count > 0) {
          res.push(item);
          --count;
          map.set(item, count)
          if(count <=0) map.delete(item)
      }
  }
  return res;
};

```
