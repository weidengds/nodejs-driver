'use strict';
var assert = require('assert');
var rewire = require('rewire');
var helper = require('../helper');
var Point = require('../../lib/types/point');
var moduleName = '../../lib/types/line-string';
var LineString = require(moduleName);

describe('LineString', function () {
  describe('constructor', function () {
    it('should validate points provided', function () {
      assert.doesNotThrow(function () {
        new LineString(new Point(1, 2.312));
      });
      assert.doesNotThrow(function () {
        //empty line strings are valid
        new LineString();
      });
    });
    it('should set #points property', function () {
      [
        [new Point(1, 3)],
        [new Point(0, 1), new Point(3, 4)]
      ]
        .forEach(function (points) {
          var line = new LineString(points);
          assert.strictEqual(line.points.length, points.length);
        });
    });
  });
  describe('fromBuffer()', function () {
    it('should create an instance from WKB', function () {
      [
        [ '000000000200000002000000000000000000000000000000003ff0000000000000bff3333333333333',
          [ new Point(0, 0), new Point(1, -1.2)]],
        [ '000000000200000001c08f4000000000004161249b3ff7ced9',
          [ new Point(-1000, 8987865.999)]],
        [ '0102000000030000000000000000908440b5f171b7353f2040000000000000f03f0000000000000840000000000000f0bf0000000000c05b40',
          [ new Point(658, 8.1234567), new Point(1, 3), new Point(-1, 111)]]
      ]
        .forEach(function (item) {
          var line = LineString.fromBuffer(new Buffer(item[0], 'hex'));
          assert.strictEqual(line.points.length, item[1].length);
          line.points.forEach(function (p, i) {
            assert.strictEqual(p.toString(), item[1][i].toString());
          });
        });
    });
  });
  describe('#toBuffer()', function () {
    it('should return WKB in a big-endian OS', function () {
      var BELineString = rewire(moduleName);
      BELineString.__set__('os', { endianness: function() { return 'BE';} });
      [
        [ [ new Point(0, 0), new Point(1, -1.2)],
          '000000000200000002000000000000000000000000000000003ff0000000000000bff3333333333333'],
        [ [ new Point(-1000, 8987865.999)],
          '000000000200000001c08f4000000000004161249b3ff7ced9'],
        [ [ new Point(-123, -1)],
          '000000000200000001c05ec00000000000bff0000000000000'],
        [ [ new Point(658, 8.1234567), new Point(1, 3), new Point(-1, 111)],
          '000000000200000003408490000000000040203f35b771f1b53ff00000000000004008000000000000bff0000000000000405bc00000000000']
      ]
        .forEach(function (item) {
          var line = new BELineString(item[0]);
          var buffer = line.toBuffer();
          helper.assertInstanceOf(buffer, Buffer);
          assert.strictEqual(buffer.toString('hex'), item[1]);
        });
    });
    it('should return WKB in a little-endian OS', function () {
      var LELineString = rewire(moduleName);
      LELineString.__set__('os', { endianness: function() { return 'LE';} });
      [
        [ [ new Point(0, 0), new Point(1, -1.2)],
          '01020000000200000000000000000000000000000000000000000000000000f03f333333333333f3bf'],
        [ [ new Point(-1000, 8987865.999)],
          '0102000000010000000000000000408fc0d9cef73f9b246141'],
        [ [ new Point(-123, -1)],
          '0102000000010000000000000000c05ec0000000000000f0bf'],
        [ [ new Point(658, 8.1234567), new Point(1, 3), new Point(-1, 111)],
          '0102000000030000000000000000908440b5f171b7353f2040000000000000f03f0000000000000840000000000000f0bf0000000000c05b40']
      ]
        .forEach(function (item) {
          var line = new LELineString(item[0]);
          var buffer = line.toBuffer();
          helper.assertInstanceOf(buffer, Buffer);
          assert.strictEqual(buffer.toString('hex'), item[1]);
        });
    });
  });
  describe('#toString()', function () {
    it('should return WKT of the object', function () {
      [
        [[ new Point(-123, -1)], 'LINESTRING (-123 -1)'],
        [[ new Point(658, 8.1234567), new Point(1, 3), new Point(-1, 111) ], 'LINESTRING (658 8.1234567, 1 3, -1 111)']
      ]
        .forEach(function (item) {
          var p = new LineString(item[0]);
          assert.strictEqual(p.toString(), item[1]);
        });
    });
  });
});