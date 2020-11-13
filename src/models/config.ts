const api_url = process.env.API_URL || 'http://localhost:1337';

const theme = {
    lineNumberColor: '#848484',
    lineNumberBgColor: '#ff0000',
    backgroundColor: '#212121',
    textColor: '#eceff1',
    keywordColor: '#C792EA',
    builtInColor: '#FFCB6B',
    stringColor: '#c3e88d',
    deletionColor: 'red',
    sectionColor: '#FFCB6B',
    commentColor: '#6b6b6b',
    metaKeywordColor: 'red',
    functionColor: '#82AAFF',
    numberColor: '#ffcb6b'
};

export { api_url, theme };
