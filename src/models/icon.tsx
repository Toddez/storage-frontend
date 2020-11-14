import React from 'react';

type Node = {
    type: number,
    extension: string,
    path: string,
    file: string,
    children: Array<Node>
}

type ExtensionDefinition = {
    ext: Array<string>,
    icon: React.ElementType
}

const gen = (icon: React.ElementType, extensions: Array<string>) : ExtensionDefinition => {
    return {
        ext: extensions,
        icon: icon
    };
};

import LanguageJavascript from 'mdi-material-ui/LanguageJavascript';
import LanguageTypescript from 'mdi-material-ui/LanguageTypescript';
import LanguageReact from 'mdi-material-ui/React';
import LanguageText from 'mdi-material-ui/FormatText';
import LanguageMarkdown from 'mdi-material-ui/LanguageMarkdownOutline';
import LanguageGif from 'mdi-material-ui/Gif';
import LanguageJson from 'mdi-material-ui/CodeJson';
import LanguageHtml from 'mdi-material-ui/CodeTags';
import LanguageCss from 'mdi-material-ui/LanguageCss3';

// Icons by extension
const byExtension = [
    gen(LanguageJavascript, ['js']),
    gen(LanguageTypescript, ['ts']),
    gen(LanguageReact, ['jsx', 'tsx']),
    gen(LanguageText, ['txt']),
    gen(LanguageMarkdown, ['md']),
    gen(LanguageGif, ['gif']),
    gen(LanguageJson, ['json']),
    gen(LanguageHtml, ['html']),
    gen(LanguageCss, ['css']),
];

// Icons by name for folders
import FolderImage from 'mdi-material-ui/FolderImage';
import FolderRoute from 'mdi-material-ui/FolderSwap';

const byNameFolder = [
    gen(FolderRoute, ['routes', 'route']),
    gen(FolderImage, ['images', 'image', 'img', 'imgs']),
];

// Folders given the special icon
import FolderSpecialIcon from 'mdi-material-ui/FolderStar';
import FolderSpecialEmptyIcon from 'mdi-material-ui/FolderStarOutline';
import FolderSpecialMultipleIcon from 'mdi-material-ui/FolderStarOutline';

const byFolderSpecial = [
    'src', 'source',
    'models', 'model',
    'styles', 'style',
    'fonts', 'font',
    'components', 'component',
    'builds', 'build',
    'node_modules',
    'public'
];

// Icons by name for files
import FileGitignore from 'mdi-material-ui/SourceBranch';
import FilePackageJson from 'mdi-material-ui/Nodejs';
const byNameFile = [
    gen(FileGitignore, ['.gitignore']),
    gen(FilePackageJson, ['package.json']),
];

import FileImage from 'mdi-material-ui/FileImageOutline';
import FileVideo from 'mdi-material-ui/FileVideoOutline';
import FileUnknown from 'mdi-material-ui/FileQuestionOutline';

// Icons by type
const byType = (types: Record<string, number>) : Record<string, React.ElementType> => {
    return {
        [types.IMAGE]: FileImage,
        [types.VIDEO]: FileVideo
    };
};

// Generic icons
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import FolderIcon from '@material-ui/icons/FolderRounded';
import FolderMultipleIcon from 'mdi-material-ui/FolderMultiple';
import FolderEmptyIcon from '@material-ui/icons/FolderOutlined';

const pickIcon = (node: Node, types: Record<string, number>) : React.ElementType => {
    if (node.type & types.DIR)
        for (const def of byNameFolder)
            if (def.ext.includes(node.path.split('/').slice(-1)[0].toLowerCase()))
                return def.icon;

    if (node.type & types.FILE)
        for (const def of byNameFile)
            if (def.ext.includes(node.file.toLowerCase()))
                return def.icon;

    if (node.type & types.DIR) {
        const isEmpty = node.children.length === 0;

        let isSpecial = false;
        for (const def of byFolderSpecial)
            if (def.includes(node.path.split('/').slice(-1)[0].toLowerCase()))
                isSpecial = true;

        let isDeep = false;
        for (const child of node.children)
            if (child.children.length > 0)
                isDeep = true;

        if (isEmpty) {
            if (isSpecial)
                return FolderSpecialEmptyIcon;
            else
                return FolderEmptyIcon;
        } else {
            if (isSpecial) {
                if (isDeep)
                    return FolderSpecialMultipleIcon;
                else
                    return FolderSpecialIcon;
            } else {
                if (isDeep)
                    return FolderMultipleIcon;
                else
                    return FolderIcon;
            }
        }
    }

    for (const def of byExtension)
        if (def.ext.includes(node.extension))
            return def.icon;

    const generatedTypeTable = byType(types);
    for (const t of Object.keys(generatedTypeTable))
        if (node.type & parseInt(t))
            return generatedTypeTable[t];

    if (node.type & types.UNKNOWN)
        return FileUnknown;

    return FileIcon;
};

export { pickIcon };
