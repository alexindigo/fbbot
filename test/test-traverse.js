var tape     = require('tape')
  , Traverse = require('../traverse/index.js')
  , steps    = {'': 'a', 'a': 'b', 'b': 'c'}
  ;

tape('traverse - default', function(t)
{
  t.plan(6);

  var slider, original = slider = {a: {b: {c: {d: 25}}}}
    // + "auto" constructor
    , tr       = Traverse(steps, {middleware: function(branch, payload, cb)
    {
      t.deepEqual(payload, branch ? slider[branch] : slider, 'middleware payload, should match original object');

      // proceed to the next level
      if (branch)
      {
        slider = slider[branch];
      }

      cb(null, payload);
    }})
    ;

  tr.traverse(original, function(err, result)
  {
    t.error(err, 'expect no errors');
    t.deepEqual(result, original, 'expect unchanged result object');
  });
});

tape('traverse - short circuit', function(t)
{
  t.plan(2);

  var original = {a: {b: 42}}
    , tr       = new Traverse(steps)
    ;

  tr.traverse(original, function(err, result)
  {
    t.equal(err.message, 'payload <b> is not an Object');
    t.deepEqual(result, undefined, 'expect no result object');
  });
});

tape('traverse - middleware error', function(t)
{
  t.plan(3);

  var original = {a: {b: {c: {d: 25}}}}
    , tr       = new Traverse(steps, {middleware: function(branch, payload, cb)
    {
      t.deepEqual(payload, original, 'middleware payload, should match original object');

      cb(new Error('Meh'), payload);
    }})
    ;

  tr.traverse(original, function(err, result)
  {
    t.equal(err.message, 'Meh', 'expect middleware error');
    t.deepEqual(result, original, 'expect unchanged result object with middleware error');
  });
});

tape('traverse - broken middleware', function(t)
{
  t.plan(4);

  var original = {a: {b: {c: {d: 25}}}}
    , tr       = new Traverse(steps, {middleware: function(branch, payload, cb)
    {
      t.deepEqual(payload, branch ? original[branch] : original, 'middleware payload, should match original object');

      cb(null, branch ? 42 : payload);
    }})
    ;

  tr.traverse(original, function(err, result)
  {
    t.equal(err.message, 'payload after <a> middleware is not an Object or an Array', 'expect after middleware error on second iteration');
    t.deepEqual(result, undefined, 'expect no result object with after middleware error');
  });
});
