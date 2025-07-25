import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email, token) {
  const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your WhatToCarry account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to WhatToCarry! 🎁</h2>
        <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with WhatToCarry, you can safely ignore this email.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email, token) {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your WhatToCarry password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request 🔐</h2>
        <p>You requested to reset your password for your WhatToCarry account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <p>This link will expire in 1 hour.</p>
        <p><strong>If you didn't request a password reset, please ignore this email.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          For security reasons, this link will expire in 1 hour.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error);
    throw error;
  }
}

export async function sendEventReminderEmail(email, event) {
  const eventDate = new Date(event.event_date).toLocaleDateString();
  const eventTime = event.event_time ? new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Reminder: ${event.title} is coming up! 📅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Event Reminder ⏰</h2>
        <p>Hi ${event.full_name},</p>
        <p>This is a friendly reminder about your upcoming event:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">${event.title}</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          ${eventTime ? `<p><strong>Time:</strong> ${eventTime}</p>` : ''}
          ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
        </div>
        
        <p>Don't forget to check WhatToCarry for gift suggestions! 🎁</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/chat" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Gift Suggestions
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          You can manage your events and reminders in your WhatToCarry dashboard.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Event reminder sent to ${email} for event: ${event.title}`);
  } catch (error) {
    console.error(`❌ Failed to send event reminder to ${email}:`, error);
    throw error;
  }
}

export async function sendWelcomeEmail(email, fullName) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to WhatToCarry! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to WhatToCarry! 🎁</h2>
        <p>Hi ${fullName},</p>
        <p>Thank you for joining WhatToCarry! We're excited to help you find the perfect gifts for every occasion.</p>
        
        <h3 style="color: #333;">What you can do with WhatToCarry:</h3>
        <ul>
          <li>🤖 Get AI-powered gift recommendations</li>
          <li>📅 Manage your events and get reminders</li>
          <li>🗺️ Find nearby stores and get directions</li>
          <li>💝 Save and organize your favorite gift ideas</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </div>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Happy gift-giving! 🎉
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error);
    throw error;
  }
}

export async function sendSubscriptionUpgradeEmail(email, fullName, subscriptionTier) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Welcome to WhatToCarry ${subscriptionTier}! ⭐`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to WhatToCarry ${subscriptionTier}! ⭐</h2>
        <p>Hi ${fullName},</p>
        <p>Congratulations on upgrading to ${subscriptionTier}! You now have access to premium features:</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">${subscriptionTier} Benefits:</h3>
          <ul style="color: #856404;">
            <li>🚀 Unlimited AI gift recommendations</li>
            <li>📅 Advanced calendar features</li>
            <li>🗺️ Premium map and navigation</li>
            <li>🔔 Priority notifications</li>
            <li>💎 Exclusive gift suggestions</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Explore Premium Features
          </a>
        </div>
        
        <p>Thank you for supporting WhatToCarry! We're committed to making your gift-giving experience exceptional.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you have any questions about your ${subscriptionTier} subscription, please contact our support team.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription upgrade email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send subscription upgrade email to ${email}:`, error);
    throw error;
  }
}

export async function sendNotificationEmail(email, notification) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: notification.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        ${notification.message ? `<p>${notification.message}</p>` : ''}
        
        ${notification.action_url ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${notification.action_url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Details
            </a>
          </div>
        ` : ''}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          You can manage your notification preferences in your WhatToCarry account settings.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification email sent to ${email}: ${notification.title}`);
  } catch (error) {
    console.error(`❌ Failed to send notification email to ${email}:`, error);
    throw error;
  }
}

// Test email function
export async function testEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'WhatToCarry Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Test ✅</h2>
        <p>This is a test email from WhatToCarry to verify that email functionality is working correctly.</p>
        <p>If you received this email, the email configuration is working properly!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send test email to ${email}:`, error);
    throw error;
  }
} 