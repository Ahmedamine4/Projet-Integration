import { createPersonalProjet } from '../services/projet.service.js';

export const addProjet = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const result = await createPersonalProjet(data, userId);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};