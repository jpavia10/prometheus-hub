# three.js 0.170.0 (vendored)

From the npm package `three@0.170.0` (MIT, `LICENSE`), unmodified. Only the files the pillars use:
`build/three.module.min.js` and, under `addons/`, the same files as `examples/jsm/` in the package
(GLTFLoader + BufferGeometryUtils, OrbitControls, RoomEnvironment, the meshopt decoder).

A page that uses it maps the bare `three` import in an import map:
`<script type="importmap">{"imports":{"three":"../../kit/vendor/three/build/three.module.min.js"}}</script>`.
Upgrade by replacing every file from one newer package version; never mix versions.
