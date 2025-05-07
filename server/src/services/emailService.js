const nodemailer = require('nodemailer');

// Get email transport for a specific user or fall back to default
const getTransporter = async (user) => {
  if (user?.useCustomEmail && user?.smtpHost) {
    return nodemailer.createTransport({
      host: user.smtpHost,
      port: user.smtpPort,
      secure: user.smtpSecure,
      auth: {
        user: user.smtpUser,
        pass: user.smtpPass,
      },
    });
  }

  // Fall back to default transport
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const templates = {
  teamInvite: (teamName, inviterName, inviteCode) => ({
    subject: `You've been invited to join ${teamName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Team Invitation</h2>
        <p>Hello!</p>
        <p>${inviterName} has invited you to join their team "${teamName}" on Project Management App.</p>
        <p>To join the team, you can:</p>
        <ol>
          <li>If you already have an account, use this invite code: <strong>${inviteCode}</strong></li>
          <li>If you're new, <a href="${process.env.CLIENT_URL}/register?invite=${inviteCode}">click here to register</a> and join the team automatically.</li>
        </ol>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>Project Management Team</p>
      </div>
    `,
  }),
};

// Send team invitation email
const sendTeamInvitation = async (email, teamName, inviter, inviteCode) => {
  try {
    const transporter = await getTransporter(inviter);
    const { subject, html } = templates.teamInvite(teamName, inviter.name, inviteCode);
    
    await transporter.sendMail({
      from: inviter.useCustomEmail ? inviter.smtpFrom : process.env.SMTP_FROM,
      to: email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendNotificationEmail = async (userEmail, notification) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${notification.title}</h2>
          <p style="color: #666;">${notification.message}</p>
          ${notification.link ? `
            <a href="${notification.link}" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                      color: white; text-decoration: none; border-radius: 5px;">
              View Details
            </a>
          ` : ''}
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};

module.exports = {
  sendTeamInvitation,
  sendNotificationEmail,
}; 