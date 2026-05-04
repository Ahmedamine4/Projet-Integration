import { getInstitutions } from '../services/institution.service.js';

export const getInstitution = async (req, res) => {
    try {
        const institutions = await getInstitutions();
        res.status(200).json(institutions);
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}