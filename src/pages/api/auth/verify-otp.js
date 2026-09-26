import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { otp, token } = req.body;

        if (!otp || !token) {
            return res.status(400).json({ message: "OTP and token are required" });
        }

        // 🔐 Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                message: "OTP expired or invalid",
            });
        }

        // 🔍 Compare OTP
        if (String(decoded.otp) !== String(otp)) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        // ✅ Success
        return res.status(200).json({
            message: "Email verified successfully",
            email: decoded.email, // optional
        });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
}