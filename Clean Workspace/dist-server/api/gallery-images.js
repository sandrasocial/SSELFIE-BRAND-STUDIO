export const config = {
    runtime: 'nodejs',
    maxDuration: 25
};
import main from './index.js';
export default async function handler(req, res) {
    return main(req, res);
}
