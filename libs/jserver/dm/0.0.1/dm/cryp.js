//- dm/b41.js
//- dm/It.js
/*
 * Copyright 05-Feb-2017 ºDeme
 * GNU General Public License - V3 <http://www.gnu.org/licenses/>
 */
/*global dm */

(function () {
  "use strict";

  var b41 = dm.b41;
  var It = dm.It;

  dm.cryp = {};
  var cryp = dm.cryp;

  /// Encodes a string to b41
  //# str - str
  cryp.s2b = function (s) { return b41.compress(s); };

  /// Decodes a string codified with s2b()
  //# str - str
  cryp.b2s = function (c) { return b41.decompress(c); };

  /// Generates a b41 random key of a length 'lg'
  //# num - str
  cryp.genK = function (lg) {
    return It.join(It.range(lg).map(function () {
      return b41.n2b(Math.floor(Math.random() * 41));
    }));
  };

  /**
   * Returns 'k' codified in irreversible way, using 'lg' B41 digits.
   *   k     : String to codify
   *   lg    : Length of result
   *   return: 'lg' B41 digits
   */
  //# str - num - str
  cryp.key = function (k, lg) {
    var lg2 = k.length * 2;
    if (lg2 < lg * 2) { lg2 = lg * 2; }
    k += "codified in irreversibleDeme is good, very good!\n\r8@@";
    while (k.length < lg2) { k += k; }
    k = k.substring(0, lg2);
    var dt = b41.decodeBytes(b41.encode(k));
    lg2 = dt.length;

    var sum = 0;
    var i = 0;
    while (i < lg2) {
      sum = (sum + dt[i]) % 256;
      dt[i] = (sum + i + dt[i]) % 256;
      ++i;
    }
    while (i > 0) {
      --i;
      sum = (sum + dt[i]) % 256;
      dt[i] = (sum + i + dt[i]) % 256;
    }

    return b41.encodeBytes(dt).substring(0, lg);
  };

  /**
   * Encodes 'm' with key 'k'.
   *   k     : Key for encoding
   *   m     : Message to encode
   *   return: 'm' codified in B41 digits.
   */
  //# str - str - str
  cryp.cryp = function (k, m) {
    m = b41.encode(m);
    k = cryp.key(k, m.length);
    return It.join(It.range(m.length).map(function (i) {
      return b41.n2b((b41.b2n(m.charAt(i)) + b41.b2n(k.charAt(i))) % 41);
    }));
  };

  /**
   * Decodes 'c' using key 'k'. 'c' was codified with cryp().
   *   k     : Key for decoding
   *   c     : Text codified with cryp()
   *   return: 'c' decoded.
   */
  //# str - str - str
  cryp.decryp = function (k, c) {
    k = cryp.key(k, c.length);
    return b41.decode(It.join(It.range(c.length).map(function (i) {
      var n = b41.b2n(c.charAt(i)) - b41.b2n(k.charAt(i));
      return b41.n2b(n >= 0 ? n : n + 41);
    })));
  };

  /**
   * Encodes automatically 'm' with a random key of 'nk' digits.
   *   nK    : Number of digits for random key (1 to 40 both inclusive)
   *   m     : Text for enconding
   *   return: 'm' encoded in B41 digits
   */
  //# num - str - str
  cryp.autoCryp = function (nK, m) {
    var k1 = Math.floor(Math.random() * 41);
    var n = b41.n2b((nK + k1) % 41);
    var k = cryp.genK(nK);
    return b41.n2b(k1) +
      n +
      k +
      cryp.cryp(k, m);
  };

  /**
   * Decodes a text codified with autoCryp()
   *   c     :Codified text
   *   return: Decoded text
   */
  //# str - str
  cryp.autoDecryp = function (c) {
    var c1 = b41.b2n(c.charAt(1)) - b41.b2n(c.charAt(0));
    var nK = c1 >= 0 ? c1 : c1 + 41;
    return cryp.decryp(c.substr(2, nK), c.substr(2 + nK));
  };

  /**
   * Encodes 'm' whith key 'k' and an autoKey of length 'nK'
   *   k     : Key for encoding
   *   mK    : Digits to generate autoKey (1 to 40 both inclusive)
   *   m     : Message to encode
   *   return: 'm' codified in B41 digits.
   */
  //# str - num - str - str
  cryp.encode = function (k, nK, m) {
    return cryp.cryp(k, cryp.autoCryp(nK, m));
  };

  /**
   * Decodes a string codified with encode()
   *   k     : Key for encoding
   *   c     : Message encoded with encode()
   *   return: 'c' decoded.
   */
  //# str - str - str
  cryp.decode = function (k, c) { return cryp.autoDecryp(cryp.decryp(k, c)); };

}());
