import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase(){
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); // Exit process with failure
    }
}

// export const connectDBTest = async () => {
//     const testUri = MONGO_URI + "_test"; // Use a separate test database
//     try{
//         await mongoose.connect(testUri);
//         console.log("MongoDB Test Database connected!");
//     }catch(error){
//         console.error("Database error:", error);
//         process.exit(1); // Exit process with failure
//     }
// }