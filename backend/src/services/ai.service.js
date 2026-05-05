import axios from "axios";

const AI_API_URL = process.env.AI_API_URL; 

export async function predictPortfolioText(text){
    try {
        const response = await axios.post(`${AI_API_URL}/predict`, {
            text: text,
        });
        return response.data;
    } catch (error) {

        if(error.response){ // error real FastAPI
            console.error("AI error response;", error.response.data);
        } else {
            console.error("AI error:", error.message);
        }

        throw new Error("AI service failed");
        
    }
}