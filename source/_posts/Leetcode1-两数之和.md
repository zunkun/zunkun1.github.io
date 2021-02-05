---
title: Leetcode1-两数之和
date: 2021-02-04 20:36:46
toc: true
categories:
- leetcode
tags:
- leetcode
---
## 题目
Leetcode towsum 题目，题号 1

![towsum](/img/towsum1.jpg)

<!-- more -->

## 题解
### 暴力破解
#### js 版本
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let map = new Map();
    for(let i in nums) {
        map.set(nums[i], i);
    }

    for(let i in nums) {
        // let exist = target -nums[i];
        if(map.has(target -nums[i]) && map.get(target-nums[i]) > i) {
            return [i, map.get(target - nums[i])]
        }
    }
    return [0, -1]
};

```
#### java版本
``` java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int len = nums.length;

        for(int i = 0; i < len; i++) {
            for(int j = i+1; j < len; j++) {
                if(nums[i] + nums[j] == target) {
                    return new int[] {i, j};
                }
            }
        }
       return new int[0];
        
    }
}
```

### 使用map

#### js版本
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let map = new Map();
    for(let i in nums) {
        map.set(nums[i], i);
    }

    for(let i in nums) {
        let exist = target -nums[i];
        if(map.has(exist) && map.get(exist) > i) {
            return [i, map.get(exist)]
        }
    }
    return [0, -1]
};
```

#### java版本
```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> hashmap = new HashMap<Integer, Integer>();
        for( int i =0; i < nums.length; i++) {
            if(hashmap.containsKey(target - nums[i])) {
                return new int[]{i, hashmap.get(target - nums[i])};
            }
            hashmap.put(nums[i], i);
        }
        return new int[0];
        
    }
}
```