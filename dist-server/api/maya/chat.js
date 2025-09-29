export const config = {
    runtime: 'nodejs',
    maxDuration: 45
};
import main from '../index.js';
export default async function handler(req, res) {
    return main(req, res);
}
//# sourceMappingURL=chat.js.map