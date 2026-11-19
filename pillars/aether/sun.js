/* AET-GEM-07 (Claude, 2026-11-19): Gemini 4 Neon's offline sun and twilight module, aether_gemini_suntimes_20261119-0839.js, unchanged.
   Checked by Claude against the astral library (independent code): 12 dates x 9 events at Frazier Park, worst difference 0.73 min.
   USNO (blocked for Gemini) was fetched by Claude later the same day: the task's 12 dates x 5 events, 57 exact, 3 off by one minute
   (proofs/unit/aether-sun.test.mjs). The page also checks USNO itself when online ('Check against USNO', prometheus.aether.sunCheck). */
/*
 * Aether Offline Solar & Twilight Calculator (window.AETHER_SUN)
 *
 * Equations based on:
 * - NOAA Global Monitoring Laboratory, "General Solar Position Calculations"
 *   https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * - NOAA Global Monitoring Laboratory, "Solar Calculation Details" (Meeus)
 *   https://gml.noaa.gov/grad/solcalc/calcdetails.html
 *
 * Zenith angles:
 * - Sunrise / Sunset:      90.833 deg (geometric 90 deg + 0.833 deg refraction & solar radius)
 * - Civil twilight:        96.0 deg
 * - Nautical twilight:    102.0 deg
 * - Astronomical twilight: 108.0 deg
 */
(function (root) {
  'use strict';

  var DEG2RAD = Math.PI / 180;
  var RAD2DEG = 180 / Math.PI;

  function julianDayAtUtcMidnight(dateISO) {
    var parts = String(dateISO).split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    var a = Math.floor((14 - m) / 12);
    var y1 = y + 4800 - a;
    var m1 = m + 12 * a - 3;
    var jdn =
      d +
      Math.floor((153 * m1 + 2) / 5) +
      365 * y1 +
      Math.floor(y1 / 4) -
      Math.floor(y1 / 100) +
      Math.floor(y1 / 400) -
      32045;
    return jdn - 0.5;
  }

  function solarParams(jd) {
    var t = (jd - 2451545.0) / 36525.0;
    var l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
    if (l0 < 0) l0 += 360;
    var m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    var mRad = m * DEG2RAD;
    var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    var c =
      Math.sin(mRad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
      Math.sin(2 * mRad) * (0.019993 - 0.000101 * t) +
      Math.sin(3 * mRad) * 0.000289;
    var trueLon = l0 + c;
    var omega = 125.04 - 1934.136 * t;
    var appLon = trueLon - 0.00569 - 0.00478 * Math.sin(omega * DEG2RAD);
    var meanObliq =
      23 +
      (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
    var obliqCorr = meanObliq + 0.00256 * Math.cos(omega * DEG2RAD);
    var decl = Math.asin(
      Math.sin(obliqCorr * DEG2RAD) * Math.sin(appLon * DEG2RAD)
    );
    var y = Math.tan((obliqCorr / 2) * DEG2RAD);
    y = y * y;
    var l0Rad = l0 * DEG2RAD;
    var eqTime =
      4 *
      RAD2DEG *
      (y * Math.sin(2 * l0Rad) -
        2 * e * Math.sin(mRad) +
        4 * e * y * Math.sin(mRad) * Math.cos(2 * l0Rad) -
        0.5 * y * y * Math.sin(4 * l0Rad) -
        1.25 * e * e * Math.sin(2 * mRad));
    return { decl: decl, eqTime: eqTime };
  }

  function hourAngleDeg(lat, decl, zenithDeg) {
    var latRad = lat * DEG2RAD;
    var cosHA =
      Math.cos(zenithDeg * DEG2RAD) / (Math.cos(latRad) * Math.cos(decl)) -
      Math.tan(latRad) * Math.tan(decl);
    if (cosHA > 1 || cosHA < -1) return null;
    return Math.acos(cosHA) * RAD2DEG;
  }

  function formatHHMM(localMinutes) {
    if (localMinutes === null || !isFinite(localMinutes)) return null;
    var total = Math.round(localMinutes);
    total = ((total % 1440) + 1440) % 1440;
    var hh = Math.floor(total / 60);
    var mm = total % 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  function calcEvent(jd0, lat, lon, tzOffsetHours, zenithDeg, isEvening) {
    var jdNoon = jd0 + (12 - tzOffsetHours) / 24;
    var p0 = solarParams(jdNoon);
    var ha0 = hourAngleDeg(lat, p0.decl, zenithDeg);
    if (ha0 === null) return null;
    var noon0 = 720 - 4 * lon - p0.eqTime + tzOffsetHours * 60;
    var estMin = isEvening ? noon0 + 4 * ha0 : noon0 - 4 * ha0;
    var jd1 = jd0 + (estMin - tzOffsetHours * 60) / 1440;
    var p1 = solarParams(jd1);
    var ha1 = hourAngleDeg(lat, p1.decl, zenithDeg);
    if (ha1 === null) return null;
    var noon1 = 720 - 4 * lon - p1.eqTime + tzOffsetHours * 60;
    return isEvening ? noon1 + 4 * ha1 : noon1 - 4 * ha1;
  }

  function times(dateISO, lat, lon, tzOffsetHours) {
    var jd0 = julianDayAtUtcMidnight(dateISO);
    var jdNoon0 = jd0 + (12 - tzOffsetHours) / 24;
    var p0 = solarParams(jdNoon0);
    var noon0 = 720 - 4 * lon - p0.eqTime + tzOffsetHours * 60;
    var p1 = solarParams(jd0 + (noon0 - tzOffsetHours * 60) / 1440);
    var noonMin = 720 - 4 * lon - p1.eqTime + tzOffsetHours * 60;

    return {
      astroDawn: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 108.0, false)),
      nauticalDawn: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 102.0, false)),
      civilDawn: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 96.0, false)),
      sunrise: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 90.833, false)),
      noon: formatHHMM(noonMin),
      sunset: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 90.833, true)),
      civilDusk: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 96.0, true)),
      nauticalDusk: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 102.0, true)),
      astroDusk: formatHHMM(calcEvent(jd0, lat, lon, tzOffsetHours, 108.0, true))
    };
  }

  var api = { times: times };
  if (typeof window !== 'undefined') window.AETHER_SUN = api;
  if (root && root !== (typeof window !== 'undefined' ? window : null)) {
    root.AETHER_SUN = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
