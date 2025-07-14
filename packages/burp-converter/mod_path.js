import { fileURLToPath } from 'url';

async function getFilePath() {
    console.log('getFilePath called');
    // Get the path of the current module file
    const filename = fileURLToPath(import.meta.url)
    return filename;
    
}

module.exports = getFilePath;