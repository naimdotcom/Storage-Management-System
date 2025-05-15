const otpTemplate = (CODE) => {
  return `<div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333; text-align: center; margin-top: 0;">Email Verification Code</h2>

    <p style="font-size: 16px; color: #555555;">Dear user,</p>
    <p style="font-size: 16px; color: #555555;">
      To complete your registration, please use the following 6-digit verification code:
    </p>

    <div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2e7dff; background-color: #f0f4ff; padding: 15px 0; margin: 20px 0; border-radius: 5px;">
      ${CODE}
    </div>

    <p style="font-size: 16px; color: #555555;">
      This code will expire in 5 minutes. If you did not request this, you can safely ignore this email.
    </p>

    <div style="text-align: center; font-size: 13px; color: #999999; margin-top: 30px;">
      &copy; 2025 SparkTech Agency. All rights reserved.
    </div>
  </div>
</div>`;
};
