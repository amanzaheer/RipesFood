/**
 * Three.js GLTFLoader often logs "Unknown extension KHR_materials_pbrSpecularGlossiness"
 * and skips diffuse textures. This reads the embedded diffuse image from the GLB BIN chunk.
 */

function chunkTypeIsBin(bytes) {
  return (
    bytes[0] === 0x42 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x4e &&
    (bytes[3] === 0x00 || bytes[3] === 0x20)
  );
}

/**
 * @param {ArrayBuffer} arrayBuffer
 * @returns {{ blob: Blob; mimeType: string } | null}
 */
export function extractSpecGlossDiffuseBlob(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  const magic = String.fromCharCode(
    dv.getUint8(0),
    dv.getUint8(1),
    dv.getUint8(2),
    dv.getUint8(3)
  );
  if (magic !== "glTF") return null;

  let json = null;
  let bin = null;
  let offset = 12;

  while (offset < arrayBuffer.byteLength) {
    const chunkLen = dv.getUint32(offset, true);
    const typeBytes = new Uint8Array(arrayBuffer, offset + 4, 4);

    const chunkData = arrayBuffer.slice(offset + 8, offset + 8 + chunkLen);

    const typeStr = String.fromCharCode(
      typeBytes[0],
      typeBytes[1],
      typeBytes[2],
      typeBytes[3]
    ).replace(/\0/g, "");

    if (typeStr === "JSON") {
      try {
        const text = new TextDecoder()
          .decode(chunkData)
          .replace(/\u0000+$/g, "");
        json = JSON.parse(text);
      } catch {
        return null;
      }
    } else if (chunkTypeIsBin(typeBytes)) {
      bin = new Uint8Array(chunkData);
    }

    offset += 8 + chunkLen;
  }

  if (!json || !bin) return null;

  for (const material of json.materials || []) {
    const spec =
      material?.extensions?.KHR_materials_pbrSpecularGlossiness;
    const texIdx = spec?.diffuseTexture?.index;
    if (typeof texIdx !== "number") continue;

    const texture = json.textures?.[texIdx];
    const imageIdx = texture?.source;
    const image = json.images?.[imageIdx];
    const bvIdx = image?.bufferView;
    const bv = json.bufferViews?.[bvIdx];

    if (
      typeof bv?.byteOffset !== "number" ||
      typeof bv?.byteLength !== "number"
    )
      continue;

    const mimeType = image?.mimeType || "image/jpeg";
    const start = bv.byteOffset;
    const end = start + bv.byteLength;
    if (start < 0 || end > bin.length) continue;

    const imageBytes = bin.slice(start, end);
    return { blob: new Blob([imageBytes], { type: mimeType }), mimeType };
  }

  return null;
}
