import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./src/models/Course.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from current directory
dotenv.config({ path: join(__dirname, ".env") });

const courses = [
    {
        title: "SAP S/4HANA Fundamentals",
        description: "Understand SAP modules, business processes, and S/4HANA essentials",
        fullDescription: "This comprehensive course covers SAP S/4HANA fundamentals, including core modules, business processes, and essential system navigation. Perfect for beginners looking to start a career in SAP.",
        price: 9999,
        originalPrice: 14999,
        duration: "10 weeks",
        students: "600+",
        rating: 4.6,
        level: "Intermediate",
        category: "SAP",
        image: "https://images.pexels.com/photos/574069/pexels-photo-574069.jpeg?auto=compress&cs=tinysrgb&w=600",
        features: [
            "Comprehensive SAP S/4HANA overview",
            "Business process understanding",
            "Hands-on practical exercises",
            "Industry expert mentorship",
            "Career guidance and support"
        ],
        learningOutcomes: [
            "Understand SAP S/4HANA architecture",
            "Navigate SAP system effectively",
            "Implement basic business processes",
            "Configure SAP modules"
        ],
        prerequisites: ["Basic computer knowledge", "Understanding of business processes"],
        careerPaths: ["SAP Consultant", "SAP Analyst", "ERP Specialist"],
        isActive: true
    },
    {
        title: "Web Development Essentials",
        description: "HTML, CSS, and JavaScript fundamentals to build modern responsive sites",
        fullDescription: "Learn the foundations of web development with HTML5, CSS3, and JavaScript. Build responsive, modern websites from scratch and understand the core concepts that power the web.",
        price: 7999,
        originalPrice: 11999,
        duration: "8 weeks",
        students: "1k+",
        rating: 4.7,
        level: "Beginner",
        category: "Web Development",
        image: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=600",
        features: [
            "HTML5 & CSS3 fundamentals",
            "JavaScript basics and ES6+",
            "Responsive design principles",
            "Real-world projects",
            "Portfolio development"
        ],
        learningOutcomes: [
            "Build responsive websites",
            "Master HTML5 and CSS3",
            "Understand JavaScript programming",
            "Create interactive web applications"
        ],
        prerequisites: ["No prior experience required", "Basic computer literacy"],
        careerPaths: ["Frontend Developer", "Web Developer", "UI Developer"],
        isActive: true
    }
];

async function seedCourses() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MongoDB URI not found in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Clear existing courses
        await Course.deleteMany({});
        console.log("Cleared existing courses");

        // Insert new courses
        const createdCourses = await Course.insertMany(courses);
        console.log(`Successfully created ${createdCourses.length} courses`);

        createdCourses.forEach((course) => {
            console.log(`- ${course.title} (ID: ${course._id})`);
        });

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error seeding courses:", error);
        process.exit(1);
    }
}

seedCourses();
