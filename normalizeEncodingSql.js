import fs from "fs";
import { replaceBetween } from "./utils/stringUtils";

const inputFile = "./input/trainery.sql";
const outputFile = "./output/trainery.sql";

const content = fs.readFileSync(inputFile, "utf-8");
const characterSetStr = "CHARACTER SET";
const collateStr = "COLLATE";
const charsetStr = "CHARSET=";
const collateEqualString = "COLLATE=";
let normalizedContent = content;

function normalizeCharacterSet() {
  let startIndex = 0;
  let characterSetIndex = normalizedContent.indexOf(
    characterSetStr,
    startIndex,
  );
  while (
    (characterSetIndex = normalizedContent.indexOf(
      characterSetStr,
      startIndex,
    )) > -1
  ) {
    startIndex = characterSetIndex + characterSetStr.length;
    const firstSpaceIndex = normalizedContent.indexOf(" ", startIndex + 1);
    if (firstSpaceIndex > -1) {
      normalizedContent = replaceBetween(
        normalizedContent,
        " utf8mb4",
        startIndex,
        firstSpaceIndex,
      );
      const collateIndex = normalizedContent.indexOf(collateStr, startIndex);
      const secondSpaceIndex = normalizedContent.indexOf(
        " ",
        collateIndex + collateStr.length + 1,
      );
      const commaIndex = normalizedContent.indexOf(
        ",",
        collateIndex + collateStr.length + 1,
      );
      const endCharacterIndex = Math.min(secondSpaceIndex, commaIndex);
      if (endCharacterIndex > -1) {
        normalizedContent = replaceBetween(
          normalizedContent,
          " utf8mb4_general_ci",
          collateIndex + collateStr.length,
          endCharacterIndex,
        );
      }
    }
  }
}

function normalizedCharset() {
  let startIndex = 0;
  let charsetIndex = normalizedContent.indexOf(charsetStr, startIndex);
  while (
    (charsetIndex = normalizedContent.indexOf(charsetStr, startIndex)) > -1
  ) {
    startIndex = charsetIndex + charsetStr.length;
    const firstSpaceIndex = normalizedContent.indexOf(" ", startIndex);
    if (firstSpaceIndex > -1) {
      normalizedContent = replaceBetween(
        normalizedContent,
        "utf8mb4",
        startIndex,
        firstSpaceIndex,
      );
      const collateEqualIndex = normalizedContent.indexOf(
        collateEqualString,
        startIndex,
      );
      const secondSpaceIndex = normalizedContent.indexOf(
        ";",
        collateEqualIndex + collateEqualString.length + 1,
      );
      if (secondSpaceIndex > -1) {
        normalizedContent = replaceBetween(
          normalizedContent,
          "utf8mb4_general_ci",
          collateEqualIndex + collateEqualString.length,
          secondSpaceIndex,
        );
      }
    }
  }
}

normalizeCharacterSet();
normalizedCharset();

fs.writeFileSync(outputFile, normalizedContent);
