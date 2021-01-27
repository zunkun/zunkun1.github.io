---
title: Redis分布式锁
date: 2021-01-27 20:35:45
toc: true
categories:
- 知识学习
- 技术
tags:
- Redis
---
## 分布式锁
### 加锁
Redis 对资源加锁，使用 `setnx` 指令，表示 `set if not exists`,比如 `setnx lock:key 200` ，就对 `lock:key` 加锁了。

<!-- more -->
### 过期时间
setnx 对资源已经加锁，如果不执行 `del` 命令，则资源不会释放，会陷入死锁，解决办法是对锁资源加上过期时间
```
expire lock:key 5 # 表示资源过期时间为5s
```

上面两个命令，是分两步操作，不是原子命令操作，如果 expire 操作没有执行，又会陷入死锁

### Redis方案
官方方案原子操作
```
set lock:key 200 ex 5 nx

```
其中nodejs 方案 

```
const Redis = require('ioredis');
const redis = new Redis({
  port: 6379, // Redis port
  host: '127.0.0.1', // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: 'abcd1234',
  db: 0,
});

redis.set('lock:key', 200, 'EX', 10, 'NX');

```

## 超时问题
线程A 获取了锁，设置时间10s，然后执行30s任务。 待A开始执行10s后，锁资源超时，被Redis释放。 此时 线程B来获取锁，系统没有，因此获得锁资源，此时系统中存在两个线程对同一锁资源都获取到了，得到执行任务，锁的独享性不存在了。同时，在B执行任务过程中，A执行完毕，执行 删除锁操作，则B占有的锁，被A 释放了。

### 解决方案
可以设置 `lock:key` 的 value 值为独有的值，当要删除的 value 与 redis中的 value 一致时，才允许删除操作

```
let tag = Math.floor(Math.random() * 1000);

redis.set(`lock:key`, tag, 'EX', 10, 'NX')

.....
.....

let value = redis.get(`lock:key`)

if(value ==== tag) redis.del(`lock:key`)


```
注意，上面的操作也不是原子性的，需要使用Lua 脚本来执行操作

```

const script = `if redis.call("get", KEYS[1] == ARGV[1] then 
    return redis.call("del", KEYS[1]))
    else 
        return 0
    end`;
redis.eval(script, 1, `lock:key`, tag);

执行上面的代码来释放锁
```


## 代码
``` javascript
'use strict';

const Redis = require('ioredis');
const sleep = require('mz-modules/sleep');
const redis = new Redis({
  port: 6379, // Redis port
  host: '127.0.0.1', // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: 'abcd1234',
  db: 0,
});

class RedisLock {
  constructor(options) {
    this.expireMode = options.expireMode || 'EX'; // 过期时间策略
    this.setMode = options.setMode || 'NX'; // 锁策略
    this.expire = options.expire || 5; // 默认过期时间
    this.maxtime = options.maxtime || 10; // 加锁重试时间最大值
  }

  /**
   *  lock key
   * @param {string} key key to lock
   * @param {string} value value to set
   * @param {number} expire key expire time
   * @param {number} startTime 加锁开始时间
   */
  async lock(key, value, expire, startTime = Date.now()) {
    const result = await redis.set(key, value, this.expireMode, expire, this.setMode);
    if (result === 'OK') {
      console.log(`${key} ${value} 加锁成功`);
      return true;
    }
    // 如果加锁等待超时后，仍然不成功，停止加锁
    if ((Date.now() - startTime) > this.maxtime) {
      console.log(`${key} ${value} 加锁失败，不再加锁`);
      return false;
    }
    // 加锁不成功等待重试
    await sleep(3000);
    return this.lock(key, value, expire);
  }

  /**
   * 解锁操作
   * @param {string} key key
   * @param {string} value value
   */
  async unlock(key, value) {
    const script = `if redis.call("get", KEYS[1] == ARGV[1] then 
    return redis.call("del", KEYS[1]))
    else 
        return 0
    end`;
    try {
      const result = redis.eval(script, 1, key, value);
      if (result === 1) return true;
      return false;
    } catch (error) {
      console.log(`解锁 ${key} ${value}失败`);
      return false;
    }
  }
}


const redislock = new RedisLock();

async function testlock(name) {
  const value = Math.floor(Math.random() * 10000);
  await redislock.lock(name, value);

  await sleep(3000);
  // 解锁
  await redis.unlock(name, value);
}

testlock('name1');
testlock('name2');


```
