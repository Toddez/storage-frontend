const domain = window.location.href.split('://');

let apiUrl = process.env.REACT_APP_API_URL;

if (domain[1].includes('localhost') ||
    domain[1].includes('127.0.0.1')) {
    apiUrl = 'http://localhost:1337';
}

const theme = {
    lineNumberColor: '#848484',
    lineNumberBgColor: '#ff0000',
    backgroundColor: 'transparent',
    textColor: '#eceff1',
    keywordColor: '#C792EA',
    builtInColor: '#FFCB6B',
    stringColor: '#c3e88d',
    deletionColor: 'red',
    sectionColor: '#FFCB6B',
    commentColor: '#6b6b6b',
    functionColor: '#82AAFF',
    numberColor: '#ffcb6b'
};

export { apiUrl, theme };
