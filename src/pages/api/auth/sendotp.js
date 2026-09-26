import jwt from "jsonwebtoken";
import { sendEmail } from "../../../../lib/mailer";

export default async function handler(req, res) {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpTemplate = (otp, name = "User") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:20px;">
    <tr>
      <td align="center">
        
        <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:#f97316; padding:20px; text-align:center; color:#ffffff;">
              <h2 style="margin:0;">MeetStreet</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; text-align:center;">
              <h3 style="margin-bottom:10px; color:#333;">Email Verification</h3>
              <p style="color:#555; font-size:14px;">
                Hi ${name},<br/>
                Use the OTP below to verify your email address.
              </p>

              <!-- OTP Box -->
              <div style="
                margin:20px auto;
                padding:15px;
                font-size:28px;
                font-weight:bold;
                letter-spacing:5px;
                background:#fff7ed;
                color:#f97316;
                border-radius:8px;
                width:fit-content;
              ">
                ${otp}
              </div>

              <p style="color:#888; font-size:13px;">
                This OTP is valid for 5 minutes.
              </p>

              <p style="color:#999; font-size:12px; margin-top:20px;">
                If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#999;">
              © ${new Date().getFullYear()} MeetStreet. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
    // 🔐 create token with OTP inside
    const token = jwt.sign(
        { email, otp },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
    );

    await sendEmail({
        to: email,
        subject: "Your OTP - MeetStreet",
        html: otpTemplate(otp) // pass dynamic name if available
    });
    res.status(200).json({
        message: "OTP sent",
        token // send token to frontend
    });
}