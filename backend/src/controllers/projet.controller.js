import { createProjet } from '../services/projet.js';

export const addProjet = async (req, res) => {
  try {
    const userId = "cmohi6r330000uxpsulloqrot" ;
    const data = req.body;

    const result = await createProjet(data, userId);

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