export const config = {
    runtime: 'nodejs',
    maxDuration: 45
};
import main from '../index.js';
export default async function handler(req, res) {
    // Delegate to the consolidated API handler which returns JSON
    return main(req, res);
}
