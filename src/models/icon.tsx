import React from "react";

type Node = {
  type: number;
  extension: string;
  path: string;
  file: string;
  children: Array<Node>;
};

type ExtensionDefinition = {
  ext: Array<string>;
  icon: Icon;
};

type Icon = {
  Icon: React.ElementType;
  color: string;
};

const gen = (
  color: string,
  icon: React.ElementType,
  extensions: Array<string>
): ExtensionDefinition => {
  return {
    ext: extensions,
    icon: { Icon: icon, color: color },
  };
};

import LanguageJavascript from "mdi-material-ui/LanguageJavascript";
import LanguageTypescript from "mdi-material-ui/LanguageTypescript";
import LanguageReact from "mdi-material-ui/React";
import LanguageText from "mdi-material-ui/FormatText";
import LanguageMarkdown from "mdi-material-ui/LanguageMarkdownOutline";
import LanguageJson from "mdi-material-ui/CodeJson";
import LanguageHtml from "mdi-material-ui/CodeTags";
import LanguageCss from "mdi-material-ui/LanguageCss3";
import LanguageSvg from "mdi-material-ui/Svg";
import LanguageFont from "mdi-material-ui/FormatFont";

// Icons by extension
const byExtension = [
  gen("2", LanguageJavascript, ["js"]),
  gen("2", LanguageTypescript, ["ts"]),
  gen("2", LanguageReact, ["jsx", "tsx"]),
  gen("2", LanguageText, ["txt"]),
  gen("2", LanguageMarkdown, ["md"]),
  gen("7", LanguageJson, ["json"]),
  gen("6", LanguageHtml, ["html"]),
  gen("2", LanguageCss, ["css"]),
  gen("7", LanguageSvg, ["svg"]),
  gen("6", LanguageFont, ["ttf"]),
];

// Icons by name for folders
import FolderImage from "mdi-material-ui/FolderImage";
import FolderRoute from "mdi-material-ui/FolderSwap";

const byNameFolder = [
  gen("2", FolderRoute, ["routes", "route"]),
  gen("2", FolderImage, ["images", "image", "img", "imgs"]),
];

// Folders given the special icon
import FolderSpecialIcon from "mdi-material-ui/FolderStar";
import FolderSpecialMultipleIcon from "mdi-material-ui/FolderStarMultiple";

const byFolderSpecial = [
  "src",
  "source",
  "models",
  "model",
  "styles",
  "style",
  "fonts",
  "font",
  "components",
  "component",
  "builds",
  "build",
  "node_modules",
  "public",
];

// Icons by name for files
import FileGitignore from "mdi-material-ui/SourceBranch";
import FilePackageJson from "mdi-material-ui/Nodejs";
import FileReadme from "mdi-material-ui/Information";
import FileLicense from "mdi-material-ui/Certificate";
import FileEslint from "mdi-material-ui/Eslint";

const byNameFile = [
  gen("6", FileGitignore, [".gitignore"]),
  gen("4", FilePackageJson, ["package.json"]),
  gen("4", FilePackageJson, ["package-lock.json"]),
  gen("2", FileReadme, ["README.md"]),
  gen("6", FileLicense, ["LICENSE"]),
  gen("3", FileEslint, [".eslintignore", ".eslintrc.json"]),
];

import FileImage from "mdi-material-ui/FileImageOutline";
import FileVideo from "mdi-material-ui/FileVideoOutline";
import FileUnknown from "mdi-material-ui/FileQuestionOutline";

// Icons by type
const byType = (types: Record<string, number>): Record<string, Icon> => {
  return {
    [types.IMAGE]: { Icon: FileImage, color: "2" },
    [types.VIDEO]: { Icon: FileVideo, color: "2" },
  };
};

// Generic icons
import FileIcon from "@material-ui/icons/InsertDriveFileOutlined";
import FolderIcon from "@material-ui/icons/FolderRounded";
import FolderMultipleIcon from "mdi-material-ui/FolderMultiple";

const pickIcon = (node: Node, types: Record<string, number>): Icon => {
  if (node.type & types.DIR)
    for (const def of byNameFolder)
      if (def.ext.includes(node.path.split("/").slice(-1)[0].toLowerCase()))
        return def.icon;

  if (node.type & types.FILE)
    for (const def of byNameFile)
      if (def.ext.includes(node.file)) return def.icon;

  if (node.type & types.DIR) {
    const isEmpty = node.children.length === 0;

    let isSpecial = false;
    for (const def of byFolderSpecial)
      if (def === node.path.split("/").slice(-1)[0].toLowerCase())
        isSpecial = true;

    let isDeep = false;
    if (!isEmpty)
      for (const child of node.children)
        if (child.children.length > 0) isDeep = true;

    if (isSpecial) {
      if (isDeep) return { Icon: FolderSpecialMultipleIcon, color: "2" };
      else return { Icon: FolderSpecialIcon, color: "2" };
    } else {
      if (isDeep) return { Icon: FolderMultipleIcon, color: "1" };
      else return { Icon: FolderIcon, color: "1" };
    }
  }

  for (const def of byExtension)
    if (def.ext.includes(node.extension.toLowerCase())) return def.icon;

  const generatedTypeTable = byType(types);
  for (const t of Object.keys(generatedTypeTable))
    if (node.type & parseInt(t)) return generatedTypeTable[t];

  if (node.type & types.UNKNOWN) return { Icon: FileUnknown, color: "0" };

  return { Icon: FileIcon, color: "0" };
};

export { pickIcon };
