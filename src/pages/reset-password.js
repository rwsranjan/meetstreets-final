import { useRouter } from "next/router";
import { useState } from "react";

export default function ResetPassword() {
    const router = useRouter();
    const { token } = router.query;
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, password })
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.message);
        } else {
            setMessage("Password updated successfully");
            setTimeout(() => router.push("/login"), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Reset Password</h2>

                {message && <p className="text-sm mb-3">{message}</p>}

                <input
                    type="password"
                    required
                    placeholder="New password"
                    className="w-full border p-3 rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-orange-500 text-white py-3 rounded">
                    Update Password
                </button>
            </form>
        </div>
    );
}