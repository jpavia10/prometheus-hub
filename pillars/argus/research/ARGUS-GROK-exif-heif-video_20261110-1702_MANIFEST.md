# ARGUS-GROK-exif-heif-video_20261110-1702 — manifest

File: `ARGUS-GROK-exif-heif-video_20261110-1702.json` (Drive: Argus Album / incoming (AI drop files)).
Task: WS-ARGUS Deliverable 1 (Prometheus one-day reset). Extends the shipped 40-row JPEG table (`argus_gemini_tags_20261108-2345.json`, `pillars/argus/tags.js`) to HEIF/HEIC, AVIF, ISO BMFF/MP4, QuickTime/MOV, 3GPP, Android Motion Photo and C2PA.

## Schema (same as shipped)
`n, tag_id, name, group, leaks, url` — identical keys to `argus_gemini_tags_20261108-2345.json`.

tag_id conventions (no IDs invented; each is the literal code in the cited source):
- 4CC box/item/property codes as registered (e.g. `clap`, `©xyz`, `loci`).
- `box.field` for header fields defined inside a box (`mvhd.creation_time`) — Tag Name is ExifTool's.
- QuickTime `mdta` keys: full `com.apple.quicktime.*` where Apple documents it; otherwise ExifTool's Tag ID verbatim (ExifTool strips the `com.apple.quicktime.` prefix from most).
- `uuid <UUID>` for extended-type boxes; URNs for AVIF auxiliary types; `Prefix:Name` for XMP properties; C2PA assertion labels.
- camm6 rows use ExifTool's byte offsets inside the camm type-6 packet.

## Verified counts (read back from the Drive copy)
- Rows: **131**; unique (group, tag_id): **131**; duplicate rows: 0.
- Combined inspector world with the shipped JPEG table: 40 + 131 = **171** rows (no overlap: every new row is in a non-JPEG group).
- Per group: QuickTime-Keys 26, QuickTime-UserData 20, HEIF-ItemProperty 16, ISOBMFF 12, 3GPP-udta 10, Apple-udta 10, HEIF-EntityGroup 6, XMP-MotionPhoto 6, C2PA 6, HEIF-ItemType 5, QuickTime-camm6 4, HEIF-ItemRef 4, AVIF 4, QuickTime-VideoKeys 2
- Machine check: every row's tag_id (and Tag Name for ExifTool rows) was string-matched against the downloaded source (ExifTool HTML tables, MP4RA CSVs, Apple QTFF JSON, AVIF HTML, Android Motion Photo HTML, C2PA 2.2 HTML, XMP Part 3 PDF text): 131/131 matched, 0 failed.

## Sources (URL — what was taken — rows)
- https://exiftool.org/TagNames/QuickTime.html — ExifTool QuickTime tag tables (Keys, VideoKeys, UserData, MovieHeader/TrackHeader/MediaHeader, ItemPropCont, camm6): Tag ID + Tag Name taken verbatim — 44 rows
- https://github.com/adobe/XMP-Toolkit-SDK/blob/main/docs/XMPSpecificationPart3.pdf — Adobe XMP Spec Part 3: MPEG-4 top-level uuid BE7ACFCB-97A9-42E8-9C71-999491E3AFAC — 1 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/boxes-udta.csv — MP4RA (ISO/IEC JTC1/SC29 registration authority) user-data box codes: 3GPP TS 26.244, ISO 14496-12 and Apple-registered udta 4CCs + descriptions — 21 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/track-references.csv — MP4RA ISO track reference 'cdsc' — 1 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/sample-entries.csv — MP4RA sample entries 'mebx' (ISO) and 'camm' (CamMotion) — 2 rows
- https://developer.apple.com/documentation/quicktime-file-format/quicktime_metadata_keys — Apple QuickTime File Format, metadata keys: full com.apple.quicktime.* key names + meanings (direction.facing heading format, location.role values) — 15 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/item-types.csv — MP4RA HEIF item type 4CCs (Exif, rgan, mski) — 3 rows
- https://github.com/AOMediaCodec/libavif/issues/247 — libavif/libheif: XMP in HEIF/AVIF = 'mime' item, content_type application/rdf+xml — 1 rows
- https://aomediacodec.github.io/av1-avif/ — AOM AVIF spec: alpha/depth auxiliary URNs, 'tmap' gain map, 'a1lx' — 4 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/item-references.csv — MP4RA HEIF item reference 4CCs (thmb, cdsc, auxl, eroi) — 4 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/item-properties.csv — MP4RA HEIF (ISO/IEC 23008-12) and AVIF item property 4CCs + descriptions — 17 rows
- https://raw.githubusercontent.com/mp4ra/mp4ra.github.io/HEAD/data/entity-groups.csv — MP4RA ISO/HEIF entity group 4CCs (altr, brst, iaug, ster, pano, favc) — 6 rows
- https://developer.android.com/media/platform/motion-photo-format — Android Motion Photo format 1.0: Camera:MotionPhoto*, Container:Directory, Item:Semantic, legacy MicroVideo, 'mpvd' box — 6 rows
- https://c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html — C2PA 2.2 §A.5.1 BMFF uuid D8FEC3D6-1B0E-483C-9297-5828877EC481 + assertion labels (actions.v2, ingredient.v3, thumbnail.claim, metadata incl. exif:GPSLatitude example, depthmap.GDepth) — 6 rows

## Enablement / integration notes for the inspector (Sebastian/Claude)
- `exif.js` throws "Not a JPEG file." on HEIC/AVIF/MP4/MOV. iPhone default capture is HEIC + Live Photo MOV, so the inspector currently sees none of these leaks.
- `exif.js` keys its lookup as `group + ':' + parseInt(id,16)`. Non-hex tag_ids here (4CCs, keys, UUIDs) need a string key path, e.g. `group + ':' + tag_id` when `/^0x/` fails (the shipped row 40 already has `tag_id: null`).
- Highest-value additions to parse first: HEIF `Exif` item (reuse the existing TIFF parser after skipping the 4-byte offset), `©xyz`, `com.apple.quicktime.location.ISO6709`, `loci`, camm6 GPS track, `thmb`/`clap` (cropped-away pixels), Motion Photo appended video, C2PA `c2pa.metadata`.
- Privacy: no Joseph data, no photos, no collection IDs were used. This file is reference data only.
