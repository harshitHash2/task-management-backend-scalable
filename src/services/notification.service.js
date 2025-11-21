import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const notificationTemplates = {
  TASK_ASSIGNED: ({ title, taskId }) => ({
    subject: `New Task Assigned: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f5f6fa; font-family:Arial, sans-serif;">
        <table width="100%" style="padding:20px 0; background:#f5f6fa;">
          <tr>
            <td align="center">
              <table width="600" style="background:#fff; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2563eb; color:#fff; padding:20px; font-size:20px; font-weight:bold;">
                    New Task Assigned
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px; font-size:15px; color:#333; line-height:1.6;">
                    <p>You have been assigned a new task.</p>

                    <h3 style="margin:0 0 10px;">${title}</h3>

                    <p style="color:#666;">Task ID: ${taskId}</p>

                    <a href="${process.env.FRONTEND_URL}/tasks/${taskId}"
                      style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; text-decoration:none; border-radius:6px; margin-top:15px;">
                      View Task
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  TASK_STATUS_CHANGED: ({ title, taskId, oldStatus, newStatus }) => ({
    subject: `Task Status Updated: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f5f6fa; font-family:Arial, sans-serif;">
        <table width="100%" style="padding:20px 0; background:#f5f6fa;">
          <tr>
            <td align="center">
              <table width="600" style="background:#fff; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2563eb; color:#fff; padding:20px; font-size:20px; font-weight:bold;">
                    Task Status Updated
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px; font-size:15px; color:#333; line-height:1.6;">
                    <p>The status of the task has been updated.</p>

                    <h3 style="margin:0 0 10px;">${title}</h3>

                    <p><strong>Old Status:</strong> ${oldStatus}</p>
                    <p><strong>New Status:</strong> ${newStatus}</p>

                    <a href="${process.env.FRONTEND_URL ?? 'www.google.com'}/tasks/${taskId}"
                      style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; text-decoration:none; border-radius:6px; margin-top:15px;">
                      View Task
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  })
};

// const msg = {
//   to: 'harshitchauhan939@gmail.com',
//   from: 'harshit.chauhan2015@gmail.com', // Use the email address or domain you verified above
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };

// (async () => {
//   try {
//     console.log('Sending test email via SendGrid...');
//     await sgMail.send(msg);
//   } catch (error) {
//     console.error(error);

//     if (error.response) {
//       console.error(error.response.body)
//     }
//   }
// })();

export const sendNotification = async ({ userId, email, type, payload }) => {
  const template = notificationTemplates[type];

  if (!template) {
    throw new Error(`Unknown notification type: ${type}`);
  }

  const { subject, html } = template(payload);
  const msg = {
    to: email,
  from: 'harshit.chauhan2015@gmail.com', // Use the email address or domain you verified above
  subject: subject,
  text: 'twilio',
  html: html,
  }
  console.log('Sending test email via SendGrid...');
    await sgMail.send(msg);
  console.log('Sending notification:', {
    userId,
    email,
    type,
    payload
  });
  return { success: true };
};
