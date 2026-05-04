import {predictPortfolioText} from "../services/ai.service.js"

export async function predictTechnologiesAndDomains(req,res){
    try {
        const {text} = req.body;

        if(!text || text.trim().length === 0){
            return res.status(400).json({
                success: false,
                message: "Text is required",
            });
        }

        const prediction = await predictPortfolioText(text);

        return res.status(200).json({
            success: true,
            message: prediction,
        });
        
    } catch (error) {
        console.error("AI prediction error:" , error.message);
        return res.status(500).json({
            success:false,
            message: "AI prediction failed",
        });
    }
}