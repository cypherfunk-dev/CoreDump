import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const dbRoute = path.resolve( '../database/db.json');

const mdFolder = path.resolve('../../public/markdowns')

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * An asynchronous generator function to get all files in a directory recursively.
 * @param {string} dir The directory path to start the search from.
 */
async function* getFiles(dir) {
    for (const dirent of await readdir(dir, { withFileTypes: true })) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res); // Recursively call the generator for subdirectories
        } else {
            yield res; // Yield the full path of the file
        }
    }
}

// Example usage:
(async () => {
    const directoryPath = mdFolder; 
    console.log(`Scanning directory: ${directoryPath}`);
    fs.writeFileSync(dbRoute,  '' ); // Clear the file before writing}
    
    for await (const file of getFiles(directoryPath)) {
        const parsed = file.split(path.sep);
        const slug =  '/articles/'+ parsed[parsed.length - 2]+'/'+parsed[parsed.length - 1].replace('.md','');
        // console.log(`File: ${file}, Slug: ${slug}`);
        // console.log(matter.read(file).data)
        fs.appendFileSync(dbRoute,  '{ "slug": "'+slug+'", "metadata": ' + JSON.stringify(matter.read(file).data) + ' },\n' );
    }
})();

