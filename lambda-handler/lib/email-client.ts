// @ts-expect-error TS(7016): Could not find a declaration file for module 'node... Remove this comment to see the full error message
import nodemailer from "nodemailer";
import moment from "moment";

export class EmailClient {
  clientEmail: any;
  clientEmailPassword: any;
  constructor() {
    this.clientEmail = process.env.ROB_EMAIL;
    this.clientEmailPassword = process.env.ROB_EMAIL_PASSWORD;
  }

  async sendEmail(recipientEmail: string, subject: string, html: string) {
    // Set up the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.clientEmail,
        pass: this.clientEmailPassword,
      },
    });

    // Set up the email options
    const mailOptions = {
      from: `ResyRob<${this.clientEmail}>`,
      to: recipientEmail,
      subject,
      html,
    };

    // Send the email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  createEmailBodyWithReservationDetails(reservationDetails: any) {
    const reservation = reservationDetails.reservations[0];
    const venue = reservationDetails.venues[reservation.venue.id];
    const imageURL = venue.images[0];
    const location = `${venue.location.address_1}, ${venue.location.locality}, ${venue.location.region} ${venue.location.postal_code}`;
    const name = venue.name;
    const cancellationPolicy = reservation.cancellation_policy.join(" ");
    const instagramHandle = venue.social.find(
      (social: any) => social.name === "instagram",
    ).value;
    const numSeats = reservation.num_seats;
    const dateTime = moment(
      `${reservation.day} ${reservation.time_slot}`,
      "YYYY-MM-DD HH:mm:ss",
    ).format("dddd, MMMM Do YYYY, h:mm a");
    const seatType = reservation.config.type;

    return `
        <!DOCTYPE html>
        <html>
        <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
        <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
        <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
        </head>
        <body>
        <div style="width: 100%; max-width: 600px; margin: auto;">
            <div style="text-align: center; padding: 20px;">
            <h2 style="font-weight: 300;">Congratulations! We successfully reserved a spot using ResyRob, our resy bot</h2>
            </div>
            <div style="text-align: center;">
            <img src="${imageURL}" alt="${name}" style="width: 100%; max-width: 350px; height: auto; border-radius: 4px;" />
            </div>
            <div style="padding: 20px;">
            <h3 style="font-weight: 300;">${name}</h3>
            <p>${location}</p>
            <p>${dateTime}</p>
            <p><strong>Party:</strong> ${numSeats}</p>
            <p><strong>Seats:</strong> ${seatType}</p>
            <p><strong>Cancellation Policy:</strong> ${cancellationPolicy}</p>
            <p style="visibility: ${venue.social[0].value ? "visible" : "hidden"
      }"><strong>Instagram:</strong> <a href="https://www.instagram.com/${instagramHandle}">@${instagramHandle}</a></p>
            </div>
        </div>
        </body>
        </html>
        `;
  }
}
