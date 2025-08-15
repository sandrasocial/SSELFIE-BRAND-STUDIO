import fs from 'fs';
import path from 'path';

export const checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const getUniqueFilePath = (basePath: string, fileName: string): string => {
  const dir = path.dirname(basePath);
  const ext = path.extname(fileName);
  const baseFileName = path.basename(fileName, ext);
  let finalPath = path.join(dir, `${baseFileName}${ext}`);
  let counter = 1;

  while (fs.existsSync(finalPath)) {
    finalPath = path.join(dir, `${baseFileName}_${counter}${ext}`);
    counter++;
  }

  return finalPath;
};

export const createFileIfNotExists = (filePath: string, content: string): boolean => {
  if (!checkFileExists(filePath)) {
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
};

export const appendToFileIfNotExists = (filePath: string, content: string, searchPattern: string): boolean => {
  if (!checkFileExists(filePath)) {
    return createFileIfNotExists(filePath, content);
  }

  const existingContent = fs.readFileSync(filePath, 'utf8');
  if (!existingContent.includes(searchPattern)) {
    fs.appendFileSync(filePath, '\n' + content);
    return true;
  }
  return false;
};