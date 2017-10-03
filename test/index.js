import test from 'tape'
import createREGL from 'regl'
import { createContext } from './utils/create-context'
import { LineBuilder, line } from '../index'

var slice = Array.prototype.slice

test('export line shader', function (t) {
  t.plan(2)
  t.ok(line.vert, 'vert')
  t.ok(line.frag, 'frag')
})

test('export line builder', function (t) {
  t.plan(2)
  t.ok(LineBuilder != null, 'LineBuilder')
  t.equal(typeof LineBuilder.create, 'function', 'LineBuilder.create')
})

test('builder - create resources', function (t) {
  var gl = createContext(16, 16)
  var regl = createREGL(gl)

  t.plan(6)

  var lines = LineBuilder.create(regl, {
    stride: 2,
    maxSize: 1024
  })

  var position = lines.resources.position
  var offsetScale = lines.resources.offsetScale
  var elements = lines.resources.elements
  t.equal(position.view.constructor, Float32Array,
    'position.view')
  t.equal(position.view.length, 1024 * 2 * 2,
    'position.view.length')
  t.equal(offsetScale.view.constructor, Float32Array,
    'offsetScale.view')
  t.equal(offsetScale.view.length, 1024 * 2,
    'offsetScale.view.length')
  t.equal(elements.view.constructor, Uint16Array,
    'elements.view')
  t.equal(elements.view.length, 1024 * 4,
    'elements.view.length')
})

test('builder - create geometry', function (t) {
  var gl = createContext(16, 16)
  var regl = createREGL(gl)

  t.plan(10)

  var lines = LineBuilder.create(regl, {
    stride: 2,
    maxSize: 1024
  })
  var ctx = lines.getContext()
  var cursor = lines.state.cursor
  var paths = lines.state.paths
  var position = lines.resources.position
  var offsetScale = lines.resources.offsetScale

  ctx.beginPath()
  ctx.moveTo(10, 11)
  ctx.lineTo(20, 21)
  ctx.lineTo(30, 31)
  ctx.lineTo(40, 41)
  ctx.stroke()

  t.equal(cursor.element, 3,
    'cursor.element')
  t.equal(cursor.vertex, 6,
    'cursor.vertex')
  t.deepEqual(
    slice.call(position.view, 0, 6 * 2 * 2), [
      10, 11, 10, 11, 10, 11, 10, 11,
      20, 21, 20, 21,
      30, 31, 30, 31,
      40, 41, 40, 41, 40, 41, 40, 41],
    'position.view values')
  t.deepEqual(
    slice.call(offsetScale.view, 0, 6 * 2), [
      0.5, -0.5, 0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5, 0.5, -0.5],
    'offsetScale.view values')
  t.deepEqual(paths[0], {
    offset: 0,
    elementOffset: 0,
    count: 4,
    isClosed: false
  },
  'paths[0] state')

  ctx.beginPath()
  ctx.moveTo(50, 51)
  ctx.lineTo(60, 61)
  ctx.lineTo(70, 71)
  ctx.lineTo(80, 81)
  ctx.lineTo(90, 91)
  ctx.stroke()

  t.equal(cursor.element, 7,
    'cursor.element')
  t.equal(cursor.vertex, 13,
    'cursor.vertex')
  t.deepEqual(
    slice.call(position.view, 0, 13 * 2 * 2), [
      10, 11, 10, 11, 10, 11, 10, 11,
      20, 21, 20, 21,
      30, 31, 30, 31,
      40, 41, 40, 41, 40, 41, 40, 41,
      50, 51, 50, 51, 50, 51, 50, 51,
      60, 61, 60, 61,
      70, 71, 70, 71,
      80, 81, 80, 81,
      90, 91, 90, 91, 90, 91, 90, 91],
    'position.view values')
  t.deepEqual(
    slice.call(offsetScale.view, 0, 13 * 2), [
      0.5, -0.5, 0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5, 0.5, -0.5,
      0.5, -0.5, 0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5,
      0.5, -0.5, 0.5, -0.5],
    'offsetScale.view values')
  t.deepEqual(paths[1], {
    offset: 4,
    elementOffset: 12,
    count: 5,
    isClosed: false
  },
  'paths[1] state')
})

test('builder - set line width', function (t) {
  var gl = createContext(16, 16)
  var regl = createREGL(gl)

  t.plan(2)

  var lines = LineBuilder.create(regl, {
    stride: 2,
    maxSize: 1024
  })
  var ctx = lines.getContext()
  var style = lines.state.style
  var offsetScale = lines.resources.offsetScale

  ctx.lineWidth = 3
  t.equal(style.lineWidth, 3, 'style.lineWidth')

  ctx.beginPath()
  ctx.moveTo(10, 11)
  ctx.lineTo(20, 21)
  ctx.lineTo(40, 41)
  ctx.stroke()

  t.deepEqual(
    slice.call(offsetScale.view, 0, 5 * 2), [
      1.5, -1.5, 1.5, -1.5,
      1.5, -1.5,
      1.5, -1.5, 1.5, -1.5],
    'offsetScale.view values')
})

test('builder - reset state', function (t) {
  var gl = createContext(16, 16)
  var regl = createREGL(gl)

  t.plan(10)

  var lines = LineBuilder.create(regl, {
    stride: 2,
    maxSize: 1024
  })
  var ctx = lines.getContext()
  var state = lines.state
  var position = lines.resources.position
  var offsetScale = lines.resources.offsetScale

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(10, 11)
  ctx.lineTo(20, 21)
  ctx.lineTo(30, 31)
  ctx.lineTo(40, 41)
  ctx.stroke()

  t.equal(state.cursor.element, 3,
    'cursor.element')
  t.equal(state.cursor.vertex, 6,
    'cursor.vertex')
  t.deepEqual(
    slice.call(position.view, 0, 6 * 2 * 2), [
      10, 11, 10, 11, 10, 11, 10, 11,
      20, 21, 20, 21,
      30, 31, 30, 31,
      40, 41, 40, 41, 40, 41, 40, 41],
    'position.view values')
  t.deepEqual(
    slice.call(offsetScale.view, 0, 6 * 2), [
      1, -1, 1, -1,
      1, -1,
      1, -1,
      1, -1, 1, -1],
    'offsetScale.view values')
  t.deepEqual(state.paths[0], {
    offset: 0,
    elementOffset: 0,
    count: 4,
    isClosed: false
  },
  'paths[0] state')

  lines.reset()
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(50, 51)
  ctx.lineTo(60, 61)
  ctx.lineTo(70, 71)
  ctx.lineTo(80, 81)
  ctx.lineTo(90, 91)
  ctx.stroke()

  t.equal(state.cursor.element, 4,
    'cursor.element')
  t.equal(state.cursor.vertex, 7,
    'cursor.vertex')
  t.deepEqual(
    slice.call(position.view, 0, 7 * 2 * 2), [
      50, 51, 50, 51, 50, 51, 50, 51,
      60, 61, 60, 61,
      70, 71, 70, 71,
      80, 81, 80, 81,
      90, 91, 90, 91, 90, 91, 90, 91],
    'position.view values')
  t.deepEqual(
    slice.call(offsetScale.view, 0, 7 * 2), [
      2, -2, 2, -2,
      2, -2,
      2, -2,
      2, -2,
      2, -2, 2, -2],
    'offsetScale.view values')
  t.deepEqual(state.paths[0], {
    offset: 0,
    elementOffset: 0,
    count: 5,
    isClosed: false
  },
  'paths[0] state')
})
