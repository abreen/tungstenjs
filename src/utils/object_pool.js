/**
 * Abstract structure to pool and recycle constructed objects
 */
'use strict';

var _ = require('underscore');

function ObjectPool(limit, constructorFunc) {
  this.allocatedObjects = new Array(limit);
  this.constructorFunc = constructorFunc;
  this.limit = limit;
  this.size = 0;

  var self = this;
  constructorFunc.prototype.recycle = function() {
    self.recycle(this);
  };
}

/**
 * Allocates and recycles a number of objects for later use
 * Can be run during periods of low-execution to save cycles later
 * @param  {Number} num  Number of objects to allocate into the pool
 */
ObjectPool.prototype.preallocate = function(num) {
  var size = Math.min(num, this.limit);
  var objs = new Array(size);
  for (var i = size; i--;) {
    objs[i] = this.allocate();
  }
  for (i = size; i--;) {
    objs[i].recycle();
  }
};

/**
 * Creates a new or uses a recycled object and constructs it
 * Arguments passed into allocate will be passed through to the constructor
 * @return {Any} Allocated object
 */
ObjectPool.prototype.allocate = function(...args) {
  var temp;
  if (this.size > 0) {
    // Reduce the available pool size
    this.size -= 1;
    // Grab the object at the pointer and null it from the array
    temp = this.allocatedObjects[this.size];
    this.allocatedObjects[this.size] = undefined;
  }

  if (!temp) {
    // If we don't have any preallocated ones available, make a new one
    temp = _.create(this.constructorFunc.prototype);
  }
  this.constructorFunc.apply(temp, args);
  return temp;
};

/**
 * Puts the object back into the pool if there is room
 * If there isn't room, it's left loose to be dealloc-ed
 * @param  {Any} recyclable  Object to recycle
 */
ObjectPool.prototype.recycle = function(recyclable) {
  if (typeof recyclable.recycleObj === 'function') {
    recyclable.recycleObj();
  }
  if (this.size < this.limit) {
    this.allocatedObjects[this.size] = recyclable;
    this.size += 1;
  }
};

module.exports = ObjectPool;
