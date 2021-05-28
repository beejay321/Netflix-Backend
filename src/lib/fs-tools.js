import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

export const getMedia = async () =>
  await readJSON(join(dataFolderPath, "movies.json"));

export const writeMedia = async (content) =>
  await writeJSON(join(dataFolderPath, "movies.json"), content);
