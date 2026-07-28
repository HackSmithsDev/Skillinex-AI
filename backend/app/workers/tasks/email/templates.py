# --- 1. ONBOARDING ---
WELCOME_HTML = """
<html>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; border-top: 6px solid #2563eb;">
            <h1 style="color: #1e3a8a;">Welcome to Skillinex, {username}!</h1>
            <p style="color: #4b5563; font-size: 16px;">Your AI-powered learning journey starts now. We've set up your dashboard so you can start discovering new roadmaps.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{dashboard_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to Dashboard</a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">Read Less, Discover More.</p>
        </div>
    </body>
</html>
"""

# --- 2. SECURITY ---
OTP_HTML = """
<html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 8px;">
            <h2 style="color: #111827;">Verification Code</h2>
            <p>Hi {username}, use the code below to secure your account:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">
                {code}
            </div>
            <p style="font-size: 13px; color: #6b7280;">This code expires in 10 minutes.</p>
        </div>
    </body>
</html>
"""

LOGIN_ALERT_HTML = """
<div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; max-width: 600px; margin: auto;">
    <h2 style="color: #dc2626;">New Login Detected</h2>
    <p>Hi {username}, a new login was detected at <strong>{time}</strong>.</p>
    <p>If this wasn't you, please secure your account immediately:</p>
    <a href="{reset_url}" style="color: #ef4444; font-weight: bold;">Reset Password Now</a>
</div>
"""

RESET_SUCCESS_HTML = """
<div style="font-family: sans-serif; padding: 20px; border: 1px solid #dcfce7; border-radius: 8px; max-width: 600px; margin: auto;">
    <h2 style="color: #16a34a;">Password Updated</h2>
    <p>Hi {username}, your password has been successfully reset. You can now log in with your new credentials.</p>
</div>
"""

DELETE_ACCOUNT_HTML = """
<div style="font-family: sans-serif; padding: 20px; border: 1px solid #f3f4f6; border-radius: 8px; max-width: 600px; margin: auto; background-color: #fffafa;">
    <h2 style="color: #374151;">Account Deleted</h2>
    <p>Hello {username},</p>
    <p>This email confirms that your Skillinex account and all associated data have been permanently deleted.</p>
    <p style="color: #6b7280; font-size: 14px;">We're sorry to see you go. If this was a mistake, you can always create a new account in the future.</p>
</div>
"""

# --- 3. ACADEMIC & SUPPORT ---
COURSE_READY_HTML = """
<html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #10b981; padding: 30px; border-radius: 8px;">
            <h2 style="color: #065f46;">Your Course is Ready! 📚</h2>
            <p>The AI has finished generating the curriculum for: <strong>{course_title}</strong></p>
            <p>Check your dashboard to start your first lecture and take the AI-generated quizzes.</p>
            <div style="text-align: center; margin: 20px;">
                <a href="{link}" style="background: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Start Learning</a>
            </div>
        </div>
    </body>
</html>
"""

SUPPORT_TICKET_HTML = """
<div style="font-family: sans-serif; padding: 20px; border-top: 4px solid #3b82f6; max-width: 600px; margin: auto;">
    <h2 style="color: #1e40af;">Ticket Received</h2>
    <p>Hi {username}, we've received your request regarding <strong>{issue_type}</strong>.</p>
    <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 10px 0;">
        <strong>Details:</strong><br>{details}
    </div>
    <p>Our team will get back to you within 24 hours.</p>
</div>
"""