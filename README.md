# [node-binary-encoder](https://github.com/walasek/node-binary-encoder) [![Build Status](https://img.shields.io/travis/walasek/node-binary-encoder.svg?style=flat-square)](https://travis-ci.org/walasek/node-binary-encoder) [![Package Version](https://img.shields.io/npm/v/binary-encoder.svg?style=flat-square)](https://www.npmjs.com/walasek/node-binary-encoder) ![License](https://img.shields.io/npm/l/binary-encoder.svg?style=flat-square) [![Dependencies](https://david-dm.org/walasek/node-binary-encoder.svg)](https://david-dm.org/walasek/node-binary-encoder.svg)  [![codecov](https://codecov.io/gh/walasek/node-binary-encoder/branch/master/graph/badge.svg)](https://codecov.io/gh/walasek/node-binary-encoder)

Quick and consistent binary encoding of data structures.

---

## Goal

Encoding data in raw buffers is a difficult task especially in terms of description of the encoding and decoding process. This project aims to deliver tools for easy description of data structures that can be encoded into raw buffers, and decoded from raw buffers and data streams.

## Installation

Node `>=8.9.0` is required.

```bash
npm install --save binary-encoder
```

To perform tests use:

```bash
cd node_modules/binary-encoder
npm i
npm t
```

This project also has a benchmark that you can run yourself:

```bash
cd node_modules/binary-encoder
npm i
npm run benchmark
```

## Usage

Beware this project is still in development. There may be serious bugs or performance issues over time.

Documentation is available [here](https://walasek.github.io/node-binary-encoder/).

```javascript
const bin = require('binary-encoder');

// A basic structure definition
const Person = bin.Structure({
    first_name: bin.String(),
    age: bin.Uint32(),
});

const Image = bin.Structure({
    binary: bin.Data(),
});
const Link = bin.Structure({
    url: bin.String(),
});

// A Protobuf-style OneOf union
const Attachment = bin.OneOf({
    image: Image,
    link: Link,
});

// Definitions can be nested
const MyMessage = bin.Structure({
    title: bin.String(),
    from: Person,
    to: Person,
    content: bin.String(),
    attachments: bin.Array(Attachment),
});

// Any type or definition can be encoded and decoded
const my_message = {
    title: 'binary-encoder',
    from: {first_name: 'Karol', age: 25},
    to: {first_name: 'Jon', age: 30},
    content: 'This library is awesome!',
    attachments: [
        {link: {url: 'https://github.com/walasek/node-binary-encoder'}},
    ],
};
const buffer = MyMessage.encode(my_message);
// socket.send(buffer); fs.writeFileSync(..., buffer); or something else here
// ...
// socket.on('data', ...); fs.readFilesync(...); or something else here
const message = MyMessage.decode(buffer);
// t.deepEqual(message, my_message, 'This would pass');
```

## API

### Basic Types
Type | Usage | Size
--- | --- | ---
Uint8 | A byte of data (value range 0-255) | 1
Uint16 | Two bytes of data (value range 0-(2^16-1)) | 2
Int16 | Two bytes signed (value range -32768:32767) | 2
Uint32 | Little-endian unsigned int (0-(2^32-1)) | 4
Int32 | Found bytes signed (value range -2^16:2^16-1) | 4
Varint | A Protobuf-style Varint, same value range as Uint32 | 1-5

### Structures
Type | Usage | Size
--- | --- | ---
Structure | An object that maps types to keys. Order matters. All fields must be present, additional fields that are not declared earlier will not be encoded. | Sum of fields
Array | A list of values (can be of any type). Variable length by default, can be set as fixed size. | Sum of values (+ _Varint_ size if the array is not fixed size)
OneOf | Protobuf-style _OneOf_ which allows only one member to be encoded. Can be considered as a C-style _union_. | _Varint_ size + value size

### Advanced Types
Type | Usage | Size
--- | --- | ---
Constant | A Uint8 constant. If attempting to decode or encode a different value an exception is thrown. | 1 (Uint8)
Optional | Marks a field as optional (null if not present). | 1 + value size (if set)
Data | A generic binary buffer. Equivalent to an Array of Uint8's. Can be fixed size. | (Array)
String | A UTF-8 encoded string. Equivalent to Data with some post processing. Can be fixed size. | (Array)

## Benchmarks

The following benchmark compares Protobuf to this implementation for some basic data structure and a long string of length at least N. `binary-encoder-buf` uses a preallocated buffer for all operations.

```
protobuf x 243,121 ops/sec ±3.58% (86 runs sampled)
binary-encoder x 73,333 ops/sec ±2.17% (90 runs sampled)
binary-encoder-buf x 159,013 ops/sec ±2.34% (89 runs sampled)
json x 251,349 ops/sec ±1.19% (90 runs sampled)
Fastest Transcoding for N=10 is json

protobuf x 252,062 ops/sec ±2.13% (92 runs sampled)
binary-encoder x 71,901 ops/sec ±2.26% (92 runs sampled)
binary-encoder-buf x 158,841 ops/sec ±1.45% (93 runs sampled)
json x 224,417 ops/sec ±1.52% (94 runs sampled)
Fastest Transcoding for N=100 is protobuf

protobuf x 197,825 ops/sec ±1.72% (84 runs sampled)
binary-encoder x 65,152 ops/sec ±1.36% (90 runs sampled)
binary-encoder-buf x 138,347 ops/sec ±1.97% (92 runs sampled)
json x 119,051 ops/sec ±2.29% (89 runs sampled)
Fastest Transcoding for N=1000 is protobuf

protobuf x 67,883 ops/sec ±2.63% (74 runs sampled)
binary-encoder x 30,369 ops/sec ±4.00% (84 runs sampled)
binary-encoder-buf x 59,281 ops/sec ±1.37% (91 runs sampled)
json x 23,988 ops/sec ±0.81% (94 runs sampled)
Fastest Transcoding for N=10000 is protobuf

protobuf x 11,065 ops/sec ±4.38% (81 runs sampled)
binary-encoder x 6,191 ops/sec ±5.16% (84 runs sampled)
binary-encoder-buf x 9,975 ops/sec ±2.12% (90 runs sampled)
json x 2,642 ops/sec ±0.92% (95 runs sampled)
Fastest Transcoding for N=100000 is protobuf
```

## Contributing

The source is documented with JSDoc. To generate the documentation use:

```bash
npm run docs
```

Extra debugging information is printed using the `debug` module:

```bash
DEBUG=binary-encoder:* npm t
```

The documentation will be put in the new `docs` directory.

To introduce an improvement please fork this project, commit changes in a new branch to your fork and add a pull request on this repository pointing at your fork. Please follow these style recommendations when working on the code:

* Use tabs (yup).
* Use `async`/`await` and/or `Promise` where possible.
* Features must be properly tested.
* New methods must be properly documented with `jscode` style comments.