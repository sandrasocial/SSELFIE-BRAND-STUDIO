export const config = { runtime: 'nodejs' };
import main from '../index.js';
export default async function handler(req, res) {
    return main(req, res);
}
