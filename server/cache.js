import { readFile, writeFile } from 'fs/promises';
import * as url from 'url';
import path from 'path';
import chalk from 'chalk';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const filename = 'arts.json';

export const store = async (data) => {
    try {
        await writeFile(path.join(__dirname, filename), JSON.stringify(data, null, 2), {
            encoding: 'utf-8',
        });
    } catch (e) {
        console.log(chalk.red(`Failure while writing file.`));
        console.error(e);
    }
};

export const retrieve = async () => {
    try {
        const data = await readFile(path.join(__dirname, filename), {
            encoding: 'utf-8',
        });

        const json = JSON.parse(data);

        return json;
    } catch (e) {
        console.log(chalk.red(`Failure while reading file.`));
        console.error(e);
    }
};
